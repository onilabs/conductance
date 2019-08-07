/* (c) 2013-2019 Oni Labs, http://onilabs.com
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
   @summary HTML command routing abstractions
   @hostenv xbrowser
   @desc
     Constructs for command routing in DOM trees 
*/

module.setCanonicalId('mho:surface/cmd');

var { hostenv } = require('builtin:apollo-sys');

if (hostenv !== 'xbrowser') 
  throw new Error('The mho:surface/cmd module can currently only be used in an xbrowser hostenv');

@ = require([
  'sjs:std',
  {id:'./base', include: ['Mechanism', 'Class']},
  {id:'./dynamic', include: ['On', 'Enabled']},
  {id:'sjs:type', include: ['Interface']},
  {id:'./nodes', include: ['getDOMNodes', 'getDOMNode']}
]);

/* - undocumented 
   @variable ITF_CMD_UIS
   @desc 
     cmd uis are command emitters or state listeners
*/
var ITF_CMD_UIS = exports.ITF_CMD_UIS = @Interface(module, "itf_cmd_uis");

/* - undocumented 
   @variable ITF_CMD_PROCESSORS
*/
var ITF_CMD_PROCESSORS = exports.ITF_CMD_PROCESSORS = @Interface(module, "itf_cmd_processors");


//----------------------------------------------------------------------
// helpers

__js function findCmdProcessor(node, cmd) {
  do {
    if (node[ITF_CMD_PROCESSORS]) {
      for (var i=0; i<node[ITF_CMD_PROCESSORS].length; ++i) {
        var proc = node[ITF_CMD_PROCESSORS][i];
        if (proc.bound_commands && proc.bound_commands.indexOf(cmd) === -1)
          continue;
        return proc;
      }
    }
    node = node.parentNode;
  } while (node);
  return null;
}


//----------------------------------------------------------------------

/**
   @function emit
   @summary Emit a command
   @param {Object} [settings]
   @setting {String} [cmd] Command to be emitted
   @setting {Object} [param] optional value to be passed to command handler
   @setting {optional DOMNode} [node] DOM node at which to emit the command. If `undefined`: use the implicit [mho:surface::DynamicDOMContext]
*/
function emit(settings /*{[node], cmd, [param]}*/) {
  settings = {
    node: undefined,
    cmd: undefined,
    param: undefined
  } .. @override(settings);

  var node = settings.node .. @getDOMNode();
  var processor = node .. findCmdProcessor(settings.cmd);
  if (!processor) return false;
  processor.emitter.emit([settings.cmd, settings.param]);
  return true;
}
exports.emit = emit;

/**
   @function Click
   @altsyntax element .. Click(cmd, [settings])
   @summary An [mho:surface::ElementWrapper] that emits command `cmd` when the element is clicked
   @param {mho:surface::Element} [element]
   @param {Object} [settings] Admits the same settings as [::On], but by default `event` is set to `"click"` and `handle` to [sjs:xbrowser/dom::preventDefault].
*/
__js {
  function Click(/*element, settings*/) {
    // untangle arguments
    var settings = {
      event:         'click',
      cmd:           undefined,
      filter:        undefined,
      handle:        @dom.preventDefault,
      param:         undefined,
      track_enabled: undefined
    };
    var element;
    if (arguments.length === 2) {
      element = arguments[0];
      if (typeof arguments[1] === 'string') {
        settings.cmd = arguments[1];
      }
      else {
        settings = settings .. @override(arguments[1]);
      }
    }
    else if (arguments.length === 3) {
      element = arguments[0];
      settings = settings .. @override(arguments[2]);
      settings.cmd = arguments[1];
    }
    else 
      throw new Error("Unexpected number of arguments");
    return On(element, settings);
  }
  exports.Click = Click;
}

/**
   @function On
   @altsyntax element .. On(event, cmd, [settings])
   @summary An [mho:surface::ElementWrapper] that emits command `cmd` when the element receives the given `event`
   @param {mho:surface::Element} [element]
   @param {Object} [settings]
   @setting {String} [event] Name of DOM event (can be prefixed with '!' to listen to the event during the capture phase)
   @setting {String} [cmd] Command to be emitted
   @setting {Function} [filter] Function through which received events will be passed. An event will only be considered if this function returns a truthy value.
   @setting {Function} [handle] A handler function to call directory on the event if it hasn't been filtered.
   @setting {Object|Function} [param] optional value to be passed to command handler, or function generating value (see description below)
   @setting {Boolean} [track_enabled=false]
   @desc
     ### Notes
     - If a functional `param` parameter is given, the result of executing `param(event_object)` 
       will be passed to the command handler (instead of `param` itself).
*/
function On(/*element, settings*/) {
  // untangle arguments
  var element;
  var settings = {
    event:         undefined,
    cmd:           undefined,
    filter:        undefined,
    handle:        undefined,
    param:         undefined,
    track_enabled: undefined
  };

  if (arguments.length === 2) {
    element = arguments[0];
    settings = settings .. @override(arguments[1]);
  }
  else if (arguments.length === 3 || arguments.length === 4) {
    element = arguments[0];
    if (arguments.length === 4)
      settings = settings .. @override(arguments[3]);
    
    settings.event = arguments[1];
    settings.cmd = arguments[2];
  }
  else 
    throw new Error("Unexpected number of arguments");
  
  if (settings.track_enabled)
    var Enabled = @ObservableVar(false);
  var emitter;
  
  var methods = {
    cmd: settings.cmd,
    isBound: function() { return !!emitter },
    setEmitter: function(e) { emitter = e; if (Enabled) { Enabled.set(!!e); } }
  };

  var rv = element ..
    @Class('__oni_cmd_uis') ..
    @Mechanism(function(node) {
      // install api through which processors can bind to us:
      var itf = node[ITF_CMD_UIS];
      if (!itf)
        itf = node[ITF_CMD_UIS] = [];

      itf.push(methods);

      // give command processors priority for finding _us_. XXX does this make sense; is this needed?
      hold(0);

      if (!methods.isBound()) {
        // if we're not bound yet, attempt to find processors to bind to:
        do {
          if (node[ITF_CMD_PROCESSORS]) {
            node[ITF_CMD_PROCESSORS] .. @each {
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
    @On(settings.event,
        {handle: settings.handle,
         filter: settings.filter
        },
        ev -> emitter ? emitter.emit([settings.cmd,
                                      settings.param!==undefined ?
                                      (typeof settings.param === 'function' ? settings.param(ev) : settings.param) :
                                      ev
                                     ])
       );

  if (Enabled)
    rv = rv .. @Enabled(Enabled);

  return rv;
};
exports.On = On;

////////////////////////////////////////////////////////////////////////
/**
   @function Active
   @summary Returns an [sjs:observable::Observable] that is `true` if the command is being listened for, `false` otherwise.
   @param {optional DOMNode} [node] DOM node, or child thereof, on which we want to observe active commands. If `undefined`: use the implicit [mho:surface::DynamicDOMContext]
   @param {String} [cmd] Command name
*/
function Active(/*[dom_root], cmd */) {
  // untangle arguments:
  var root, cmd;
  if (arguments.length === 1) {
    cmd = arguments[0];
  }
  else if (arguments.length === 2) {
    root = arguments[0];
    cmd = arguments[1];
  }
  else
    throw new Error("cmd::Active: Invalid number of arguments");

  return @Stream(function(downstream) {

    var Enabled = @ObservableVar(false);
    var emitter;
    var methods = {
      cmd: cmd,
      isBound: function() { return !!emitter },
      setEmitter: function(e) { emitter = e; Enabled.set(!!e); }
    };


    // XXX we're only installing on the first node in the dom context;
    // processors are installed on all. This is probably the correct
    // logic: we don't want a processor to attempt to bind to us
    // multiple times, but is _should_ be ok to install on all nodes here too
    var node = root .. @getDOMNode();

    // install api through which processors can bind to us: 
    var itf = node[ITF_CMD_UIS];
    if (!itf) {
      node.classList.add('__oni_cmd_uis');
      itf = node[ITF_CMD_UIS] = [];
    }

    itf.push(methods);

    
    // give command processors priority for finding _us_. 
    // XXX does this make sense; is this needed?
    hold(0);

   // attempt to find processor to bind to:
    if (!methods.isBound()) {
      do { 
        if (node[ITF_CMD_PROCESSORS]) {
          node[ITF_CMD_PROCESSORS] .. @each {
            |proc|
            if (proc.bound_commands && proc.bound_commands.indexOf(methods.cmd) === -1)
              continue;
            proc.cmd_nodes.push(methods);
            methods.setEmitter(proc.emitter);
            break; // we're bound
          }
        }
        node = node.parentNode;
      } while (node);
    }
 
    Enabled .. @each(downstream);

    // XXX could remove us from ITF_CMD_UIS here

  });
}
exports.Active = Active;


////////////////////////////////////////////////////////////////////////
/**
   @function stream
   @summary Listen for emitted commands under the given DOM node(s)
   @return {sjs:sequence::Stream}
   @param {optional DOMNode|Array} [dom_root] DOM node or array thereof (overrides use of [mho:surface::DynamicDOMContext])
   @param {optional Array} [commands] Array of commands to listen for (default: listen for all commands).
*/
function stream(/*[dom_root], [commands]*/) {

  var args = arguments;
  
  return @Stream(function(downstream) {

    // untangle arguments:
    var root, bound_commands;
    if (args.length === 1) {
      if (Array.isArray(args[0]) && typeof(args[0][0]) === 'string')
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

          // install a handler where retrospectively added command uis can bind themselves:
          var cmd_processor = {
            bound_commands: bound_commands,
            cmd_nodes: cmd_nodes,
            emitter: emitter
          };
          root .. @getDOMNodes() .. @each {
            |node|
            var processors = node[ITF_CMD_PROCESSORS];
            if (!processors)
              processors = node[ITF_CMD_PROCESSORS] = [];
            processors.push(cmd_processor);
          }

          // proactively bind existing command uis:
          root .. @getDOMNodes('.__oni_cmd_uis') ..
            @each {
              |node|
              var cmd_uis = node[ITF_CMD_UIS];
              if (!cmd_uis) {
                // node has probably just been added
                // we'll let it add itself using our ITF_CMD_PROCESSORS
                continue;
              }
              cmd_uis .. @each {
                |cmd_ui|
                if (cmd_ui.isBound()) 
                  continue; // already bound
                if (bound_commands && bound_commands.indexOf(cmd_ui.cmd) === -1)
                  continue; // not a command we bind to
                cmd_nodes.push(cmd_ui);
                cmd_ui.setEmitter(emitter);
              }
            }

          // keep up bindings until 'disable_inputs' fires
          disable_inputs .. @wait();
          
        }
        finally {
          // unbind
          cmd_nodes .. @each {
            |command_ui|
            command_ui.setEmitter(null);
          }

          root .. @getDOMNodes() .. @each {
            |node|
            var processors = node[ITF_CMD_PROCESSORS];
            if (processors)
              processors .. @remove(cmd_processor);
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

/* - to be added -
   @function KeyMap
   @summary XXX write me
*/

/*

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
