/* (c) 2013-2014 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
@nodoc
@summary HTML 'Cmd' abstraction 
@hostenv xbrowser
@desc
  Command routing abstractions.
*/

module.setCanonicalId('mho:surface/cmd');

var { hostenv } = require('builtin:apollo-sys');

if (hostenv !== 'xbrowser') 
  throw new Error('The mho:surface/cmd module can currently only be used in an xbrowser hostenv');

@ = require([
  'sjs:std',
  {id:'./base', include: ['Mechanism', 'Class']},
  {id:'./dynamic', include: ['On']},
  {id:'sjs:type', include: ['Interface']},
  {id:'./nodes', include: ['getDOMNodes']}
]);

/* - undocumented 
   @variable ITF_CMD_EMITTERS
*/
var ITF_CMD_EMITTERS = exports.ITF_CMD_EMITTERS = @Interface(module, "itf_cmd_emitters");

/* - undocumented 
   @variable ITF_CMD_RECEIVERS
*/
var ITF_CMD_RECEIVERS = exports.ITF_CMD_RECEIVERS = @Interface(module, "itf_cmd_receivers");


/**
   @function Click
   @altsyntax element .. Click(cmd, [settings])
   @summary XXX write me
   
*/
function Click(/*element, settings*/) {

  // untangle arguments
  var element, cmd, settings;
  if (arguments.length === 2) {
    element = arguments[0];
    settings = {
      cmd: undefined,
      filter: undefined,
      param: undefined,
      track_enabled: false
    };
    if (typeof arguments[1] === 'string') {
      cmd = arguments[1];
    }
    else {
      settings = settings .. @override(arguments[1]);
      cmd = settings.cmd;
    }
  }
  else if (arguments.length === 3) {
    element = arguments[0];
    cmd = arguments[1];
    settings = {
      param: undefined,
      filter: undefined,
      track_enabled: false
    } .. @override(arguments[2]);
  }
  else 
    throw new Error("Unexpected number of arguments");
  
  if (settings.track_enabled)
    var Enabled = @ObservableVar(false);
  var emitter;
  
  var methods = {
    cmd: cmd,
    isActive: function() { return !!emitter },
    setEmitter: function(e) { emitter = e; if (Enabled) { Enabled.set(!!e); } }
  };

  var rv = element ..
    @Class('__oni_cmd_emitter') ..
    @Mechanism(function(node) {
      // install api with which receivers can bind to us:
      var itf = node[ITF_CMD_EMITTERS];
      if (!itf)
        itf = node[ITF_CMD_EMITTERS] = [];

      itf.push(methods);

      // xxx why this?
      hold(0);

      if (!methods.isActive()) {
        // if we're not bound yet, attempt to find receiver to bind to:
        do {
          if (node[ITF_CMD_RECEIVERS]) {
            node[ITF_CMD_RECEIVERS] .. @each {
              |rec|
              if (rec.bound_commands && rec.bound_commands.indexOf(methods.cmd) === -1)
                continue;
              rec.cmd_nodes.push(methods);
              methods.setEmitter(rec.emitter);
              return; // we're bound
            }
          }
          node = node.parentNode;
        } while (node);
      }
    }) ..
    @On('click',
        {handle:@dom.preventDefault,
         filter: settings.filter
        },
        ev -> emitter ? emitter.emit([cmd,
                                      settings.param!==undefined ?
                                      (typeof settings.param === 'function' ? settings.param(ev) : settings.param) :
                                      ev
                                     ])
       );

  if (Enabled)
    rv = rv .. @Enabled(Enabled);

  return rv;
};
exports.Click = Click;


/**
   @function stream
   @summary XXX write me
*/
function stream(/*[dom_root], [commands]*/) {

  var args = arguments;
  
  return @Stream(function(downstream) {

    // untangle arguments:
    var root, bound_commands;
    if (args.length === 1) {
      if (Array.isArray(args[0]))
        bound_commands = args[0];
    }
    else if (args.length === 2) {
      root = args[0];
      bound_commands = args[1];
    }
    else if (args.length !== 0)
      throw new Error("Surplus arguments supplied to cmd::Stream()");
    
    var emitter = @Emitter();
    var disable_inputs = @Emitter();

    while (1) {
      waitfor {
        try {
          var cmd_nodes = [];

          // install a handler where retrospectively added command emitters can bind themselves:
          var cmd_receiver = {
            bound_commands: bound_commands,
            cmd_nodes: cmd_nodes,
            emitter: emitter
          };
          root .. @getDOMNodes() .. @each {
            |node|
            var receivers = node[ITF_CMD_RECEIVERS];
            if (!receivers)
              receivers = node[ITF_CMD_RECEIVERS] = [];
            receivers.push(cmd_receiver);
          }

          // proactively bind existing command emitters:
          root .. @getDOMNodes('.__oni_cmd_emitter') ..
            @each {
              |node|
              var cmd_emitters = node[ITF_CMD_EMITTERS];
              if (!cmd_emitters) {
                // node has probably just been added
                // we'll let it add itself using our ITF_CMD_RECEIVERS
                continue;
              }
              cmd_emitters .. @each {
                |cmd_emitter|
                if (cmd_emitter.isActive()) 
                  continue; // already bound
                if (bound_commands && bound_commands.indexOf(cmd_emitter.cmd) === -1)
                  continue; // not a command we bind to
                cmd_nodes.push(cmd_emitter);
                cmd_emitter.setEmitter(emitter);
              }
            }

          // keep up bindings until 'disable_inputs' fires
          disable_inputs .. @wait();
          
        }
        finally {
          // unbind
          cmd_nodes .. @each {
            |command_emitter|
            command_emitter.setEmitter(null);
          }

          root .. @getDOMNodes() .. @each {
            |node|
            var receivers = node[ITF_CMD_RECEIVERS];
            if (receivers)
              receivers .. @remove(cmd_receiver);
          }
        }
      }
      and {
        emitter .. @each {
          |cmd_param|
          var downstream_taking_time = false;
          waitfor {
            downstream(cmd_param);
          }
          or {
            hold(100);
            downstream_taking_time = true;
            disable_inputs.emit();
            hold();
          }
          if (downstream_taking_time)
            break; // force outer loop
        }
      }
    }
  });
};
exports.stream = stream;


//----------------------------------------------------------------------
// key handling

/**
   @function KeyMap
   @summary XXX write me
*/

var modifiermap = {
  16 : "SHIFT",
  17 : "CTRL",
  18 : "ALT",
  224: "META"
};

var keymap = {
  8  : "BS",
  9  : "TAB",
  13 : "RETURN",
  19 : "PAUSE",
  27 : "ESC",
  33 : "PAGEUP",
  34 : "PAGEDOWN",
  35 : "END",
  36 : "HOME",
  37 : "LEFT",
  38 : "UP",
  39 : "RIGHT",
  40 : "DOWN",
  44 : "PRINT",
  45 : "INSERT",
  46 : "DEL",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NUMLOCK",
  145: "SCROLLLOCK"
};

/*


exports.KeyMap = (element, key_map) ->
  element .. @Mechanism(
    function(node) {
      node .. @events('keydown', 
                      {
                        filter: function(ev) {
                          // drop modifier keydowns:
                          if (ev.keyCode in modifiermap) return false;
                          
                          // generate an ACMS-key code
                          var index = "";
                          if (ev.altKey) index += "A";
                          if (ev.ctrlKey) index += "C";
                          if (ev.metaKey) index += "M";
                          if (ev.shiftKey) index += "S";
                          if (index.length) index += "-";
                          var key = keymap[ev.keyCode] ||  ev.keyCode;
                          index += key;

                          var cmd = key_map[index];
                     if (!cmd) return false;
                          ev.cmd = cmd.cmd;
                          if (cmd.filter)
                            return cmd.filter();
                          return true;
                        }
                      }) .. @each {
        |{cmd}|
        Emitter(node).emit(cmd);
      }
    }
  );
*/
