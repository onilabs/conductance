/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
   @nodoc
   @module  server/rpc/raft
   @summary An implementation of the Raft consensus algorithm
*/

@ = require(['sjs:std']);

/**
   @function runRaftServer
   @summary XXX write me 
  settings:
    id: String,

    servers:
     [ { id: String,
         connect : (localId, localRaftAPI) -> remoteRaftAPI }, ... ]

    saveState: json -> void

    loadState: void -> json|null

    electionTimeoutMin: time_in_ms (default = 400)
    electionTimeoutMax: time_in_ms (default = 600)
*/
function runRaftServer(settings, clientBlock) {
  // extract server settings:
  var {id:myId, saveState, loadState, electionTimeoutMin, electionTimeoutMax, randomCommsDelays} = settings;

  if (settings.log)
    var LOG = -> settings.log("RAFT #{myId}: #{arguments .. @map(@inspect) .. @join('\n')}");
  else
    var LOG = -> null;

  // RAFT uses randomized election timeouts [RAFT 5.2]
  electionTimeoutMin = electionTimeoutMin || 150;
  electionTimeoutMax = electionTimeoutMax || 300;
  var electionTimeout = Math.round(Math.random()*(electionTimeoutMax - electionTimeoutMin)+electionTimeoutMin);

  if (!saveState) saveState = -> null;
  if (!loadState) loadState = -> null;

  // helper for making calls to external servers fault-tolerant:
  function fnretry(f) {
    return function() {
      // retry calls forever; retraction will eventuall bail us out
      while (1) {
        try {
          return f.apply(this, arguments);
        }
        catch(e) {
          LOG('api call failed');
          // force reconnection in case the api is still alive but pointing to a
          // dead server:
          this._api = null;
          // XXX could have exponential backoff here:
          hold(10);
        }
      }
    }
  }

  // For each server we build an object with `appendEntries` &
  // `requestVote` methods that transparently connect to the server and
  // retry calls indefinitely (until retraction or success):
  var servers = settings.servers .. 
    @filter({id} -> id != myId) .. // omit ourselves
    @transform({id,connect} -> [
      id,
      {
        // `api` connects to the remote server if we're not connected
        // yet and returns the server's exposed api
        api: 
           @fn.exclusive(true) :: // only ever run one concurrent call; make concurrent callers wait for result
             (-> this._api ? this._api : (this._api = connect(myId, localRaftAPI))),

        // `appendEntries` calls the remote server's `appendEntries` API function
        appendEntries: 
           fnretry :: // transparently retry on failure 
             (/*args*/ -> this.api().appendEntries.apply(null, arguments)),

        // `requestVote` calls the remote server's `requestVote` API function
        requestVote: 
           fnretry :: // transparently retry on failure
             (/*args*/ -> this.api().requestVote.apply(null, arguments))
      }
    ]) ..
    @pairsToObject; // build { server_id : api_access_object, ... } hash

  //----------------------------------------------------------------------
  // API exposed to other servers:

  // We use a bunch of dispatchers to communicate between external calls
  // made to our API and the current Raft state loop (follower,
  // candidate, leader - see below):

  //  *  Heartbeat that will be dispatched whenever there is comms from a
  //     leader or a candidate that we're waiting for. This is used to 
  //     reset election timeouts when in the 'follower' or 'candidate' 
  //     state
  var heartbeatDispatcher = @Dispatcher();

  //  *  Dispatcher that will fire whenever there are new commands in the log
  //     that can be applied to the state machine:
  var applyCommitsDispatcher = @Dispatcher();

  //  *  Dispatcher that will fire whenever we received a call with a term
  //     greater than our current term:
  var termChangeDispatcher = @Dispatcher();


  var localRaftAPI = {
    // our server's 'AppendEntries' RPC [RAFT Fig.2]
    appendEntries: function(term, leaderId, prevLogIndex, prevLogTerm, entries, leaderCommit) {

      // insert a random delay (for testing):
      if (randomCommsDelays) hold(Math.random()*randomCommsDelays);

      // reply false if term < currentTerm [RAFT 5.1 & Fig.2 AppendEntries RPC 1]
      if (term < state.currentTerm) return { success: false, term: state.currentTerm };

      // handle case where term > currentTerm [RAFT 5.1]
      checkTermCurrent(term);
      
      // reset election timeouts (in case of 'follower' or 'candidate') [RAFT 5.2]
      heartbeatDispatcher.dispatch(); // XXX should we do this before the term check above?

      // reply false if log doesn't contain an entry at prevLogIndex
      // whose term matches prevLogTerm [RAFT 5.3 & Fig.2 AppendEntries RPC 2]
      if (prevLogIndex > 0 && state.log[prevLogIndex-1].term !== prevLogTerm) 
        return { success: false, term: state.currentTerm };

      if (entries.length) {
        // If an existing entry conflicts with a new one (same index;
        // different terms), delete the existing entry and all that
        // follow it [RAFT 5.3 & Fig.2 AppendEntries RPC 3]
        if (state.log.length > prevLogIndex)
          state.log = state.log.slice(0, prevLogIndex);
        state.log = state.log.concat(entries);
      }

      if (leaderCommit > commitIndex) {
        commitIndex = Math.min(leaderCommit, state.log.length);
        applyCommitsDispatcher.dispatch();
      }

      return { success: true, term: state.currentTerm };
    },

    // our server's 'RequestVote' RPC [RAFT Fig.2]
    requestVote: function(term, candidateId, lastLogIndex, lastLogTerm) {
      if (randomCommsDelays) hold(Math.random()*randomCommsDelays);
      if (term < state.currentTerm) return { voteGranted: false, term: state.currentTerm };

      checkTermCurrent(term);

      if (
        (state.votedFor == null || state.votedFor === candidateId) &&
          lastLogIndex >= state.log.length && 
          (lastLogTerm >= getLastLogTerm())
      ) {

        state.votedFor = candidateId;
        heartbeatDispatcher.dispatch();
        return { voteGranted: true, term: state.currentTerm };
      }
      
      return {voteGranted: false, term: state.currentTerm};
    }
  };
  
  function checkTermCurrent(term) {
    if (term > state.currentTerm) {
      state.currentTerm = term;
      state.votedFor = null;
      termChangeDispatcher.dispatch();
    }
  }

  function getLastLogTerm() {
    return state.log.length === 0 ? 0 : state.log[state.log.length-1].term;
  }

  //----------------------------------------------------------------------
  // API exposed to runRaftServer clients:

  var clientAPI = {
    accept: function(id, remoteRaftAPI) {
      //LOG("accept #{id}");
      if (!servers[id]) throw new Error("Unknown server #{id}");
      servers[id]._api = remoteRaftAPI;
      return localRaftAPI;
    },
    commandStream: @Stream(function(r) { 
      while (true) {
        while (commitIndex > lastApplied) {
          r(state.log[++lastApplied]);
        }
        applyCommitsDispatcher.receive();
      }
    })
  };

  //----------------------------------------------------------------------
  // main server logic:

  function follower() {
    LOG('FOLLOWER');
    while (true) {
      waitfor {
        heartbeatDispatcher.receive();
      }
      or {
        hold(electionTimeout);
        break;
      }
    }
    // we timed out without receiving a heartbeat. become candidate:
    candidate();
        
  }

  function candidate() {
    LOG("CANDIDATE in term #{state.currentTerm+1}");
    // XXX termchange dispatcher
    ++state.currentTerm;
    state.votedFor = myId;
    waitfor {
      hold(electionTimeout);
      //LOG("election timed out");
      collapse;
      // kick off a new election
      candidate();
    }
    or {
      // send requests to all servers; count if we've got a majority
      var votes_needed = Math.round((@ownKeys(servers) .. @count +1)/2 + .5)-1;
      //LOG("requestVotes (required=#{votes_needed}) in term #{state.currentTerm}");
      @ownPropertyPairs(servers) .. @each.par {
        |[key, server]|
        var { term, voteGranted } = server.requestVote(state.currentTerm, myId, state.log.length, getLastLogTerm());
        checkTermCurrent(term);
        //LOG("#{key} has #{voteGranted ? '' : 'NOT '}granted vote");
        if (voteGranted && --votes_needed <= 0)
          break;
        else
          hold();
      }
      collapse;
      leader();
    }
    or {
      heartbeatDispatcher.receive();
      collapse;
      // we've got a new leader; become follower
      follower();
    }
  }

  function leader() {
    LOG('***** NEW LEADER ******');
    // XXX termchange dispatcher
    
    waitfor {
      // keepalive loop
      while (true) {
        
        waitfor {
          //LOG("sending heartbeat");
          @ownPropertyPairs(servers) .. @each.par {
            |[key, server]|
            var { term, success } = server.appendEntries(state.currentTerm, myId, state.log.length, getLastLogTerm(),
                                                         [], commitIndex);
            checkTermCurrent(term);
          }
        }
        or {
          while (true) {
            waitfor {
              heartbeatDispatcher.receive();
            }
            or {
              hold(electionTimeout/2);
              break;
            }
          }
        }
      }
    }
    and {

      // initialize volatile state for leader:
      @ownValues(servers) .. @each { |server|
        server.nextIndex = state.log.length + 1;
        server.matchIndex = 0;
      }

      // XXX
    }
  }

  //----------------------------------------------------------------------
  // kick off server:

  LOG("HELLO");

  // load initial state:

  var state = loadState();
  if (state) {
    state = JSON.parse(state);
  }
  else {
    // initial boot
    state = {
      currentTerm: 0,
      votedFor: null,
      log: []
    };
  }

  // volatile state:
  var commitIndex = 0;
  var lastApplied = 0;

  // run client block and server logic in parallel:

  waitfor {
    follower();
  }
  or {
    clientBlock(clientAPI); 
  }
  finally {
    LOG("BYE");
  }
};

exports.runRaftServer = runRaftServer;

//----------------------------------------------------------------------
// TEST CODE
if (require.main === module) {

  // ----
  // backfill for function module:

  function fnProxy() {
    var Fn = @ObservableVar();
    var rv = function() {
      Fn .. @each {
        |fn|
        if (typeof fn !== 'function') continue;
        return fn.apply(null, arguments);
      }
    }
    rv.set = Fn.set;
    return rv;
  }

  // ----

  // -> {id, run, connect}
  function makeServer(id) {
    var connect = fnProxy();
    return {
      id: id,
      run: function(settings, block) {
        runRaftServer(settings) {
          |api|
          connect.set(api.accept);
          try {
            block(api); 
          }
          finally {
            connect.set(function() { throw new Error('gone') });
          }
        }
      },
      connect: connect
    }
  }


  function main() {
    var stopwatch = @Stopwatch();

    var servers = ['a', 'b', 'c', 'd', 'e', 'f','g', 'h'] .. 
      @map(id -> makeServer(id));

    servers .. @each.par {
      |server|
      while (1) {
        hold(Math.random()*1000);
        server.run({id: server.id, 
                    servers: servers, 
                    log: x -> console.log(stopwatch.snapshot(true) + '   ' + x),
                    electionTimeoutMin: 2000,
                    electionTimeoutMax: 2500,
                    randomCommsDelays: 100
                   }) {
          |api|
          hold(Math.random()*100000);
        }
      }
    }
  }

  main();
}
