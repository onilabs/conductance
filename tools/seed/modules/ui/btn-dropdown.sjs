@ = require(['mho:std', 'mho:surface/bootstrap', 'sjs:xbrowser/dom']);

var UP = 38, DOWN = 40, SPACE = 32, ESCAPE = 27, RETURN = 13;

exports.Dropdown = function(button, actions, cls) {
  var showing = @ObservableVar();
  var button;
  var hide = function() {
    showing.set(false);
    button.focus();
  };

  return @Div([
    @Button([button, `&nbsp;`, @Span(null, {'class':'caret'})], {'class':'dropdown-toggle'}),
    @Ul(actions .. @map([item,action] ->
      (item .. @isElementOfType('li') ? item : @Li(item, {'tabindex':'-1'}))
        .. @On('mouseup', {handle:@stopEvent}, -> (action(),hide()))
    ) , {'class': 'dropdown-menu', 'role':'menu'})
  ] , {'class': cls || 'dropdown'})
  .. @Class('open', showing)
  .. @Mechanism {|div|
    var menu;
    [button, menu] = div.children;
    // XXX should support a Stream of actions
    var elems = menu.children .. @filter(el -> !el.classList.contains('divider')) .. @toArray();
    if(elems.length !== actions.length)
      throw new Error("each action must have exactly one elem");

    waitfor {
      var clicks = @combine(
        button .. @events('mousedown', {handle:@stopEvent}),
        button .. @events('keydown', {
          handle: @stopEvent,
          filter: (ev) -> ([SPACE, RETURN] .. @hasElem(ev.which)),
        })
      );
      clicks .. @each {|ev|
        showing.set(!showing.get());
      }
    } or {
      button .. @events('keydown', {
        handle: @stopEvent,
        filter: (ev) -> (ev.which === DOWN),
      }) .. @each {||
        if(!showing.get()) showing.set(true);
        else {
          //console.log("focusing elem", elems[0]);
          elems[0].focus();
        }
      }
    } or {
      menu .. @events('!mouseup') .. @each(hide);
    } or {
      var keydowns = menu .. @events('keydown', {
        filter: (ev) -> (
          true && [UP, DOWN, SPACE, RETURN, ESCAPE] .. @hasElem(ev.which) &&
          !/input|textarea/.test(ev.target.tagName)),
        handle: @stopEvent,
      });
      keydowns .. @each {|ev|
        //console.log("Got keycode #{ev.which} on #{ev.target.tagName}");
        if(ev.which === ESCAPE) {
          hide();
          continue;
        }
        var menuItem = 'li' .. @findNode(ev.target, menu, true);
        var idx = elems.indexOf(menuItem);
        if(idx === -1) {
          //console.log("Can't find elem", menuItem, "in ", elems);
          return;
        }
        if([SPACE, RETURN] .. @hasElem(ev.which)) {
          // TODO: select element
          if(actions[idx][1]) {
            actions[idx][1]();
            hide();
          }
        } else {
          idx = idx + (ev.which === UP ? -1 : 1);
          if(idx >=0 && idx<elems.length) {
            //console.log("focussing elem @ #{idx}");
            elems[idx].focus();
          }
        }
      }
    }
  };
};

