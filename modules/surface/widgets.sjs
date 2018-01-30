/* (c) 2013-2017 Oni Labs, http://onilabs.com
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
   legacy widgets which will over time be replaced by components.sjs
*/

@ = require([
  'sjs:std',
  'mho:surface',
  'mho:surface/html',
  {id:'mho:surface/cmd', name:'cmd'},
  {id:'mho:surface/style/helpers', name:'style_helpers'}
])

//----------------------------------------------------------------------
// helper to call a function after the first item in a stream is emitted. 
// XXX something more generic to go into sequence module?
var afterFirst = (in_stream, f) ->
  @Stream(function(r) {
    var first = true;
    in_stream .. @each {
      |elem|
      r(elem);
      if (first) {
        f(elem);
        first = false;
      }
    }
  });

//----------------------------------------------------------------------
// experimental 'ResizingMaterial' that resizes with MD transitions when content 
// resizes

function mutationEvents(element, config) {
  return @Stream(function(r) {
    var emitter = @Emitter();
    var observer = new MutationObserver(mutations -> emitter.emit(mutations));
    try {
      observer.observe(element, config);
      emitter .. @each(r);
    }
    finally {
      observer.disconnect();
    }
  });
}

function ResizingMaterial(content, attribs) {
  return @Div() .. 
    @CSS(`
         {
           overflow:hidden;
           max-height: 10000px; /* to prevent animation when Material is first shown */
           transition: max-height 280ms ${@style_helpers.Animation_curve_fast_out_slow_in};
         }
         > div { overflow:hidden; }
         `) ..
    @Mechanism(function(node) {
      var old_height = 0;
      mutationEvents(node.firstChild, {childList: true, characterData: true, subtree: true}) .. @each {
        |ev|
        var new_height = node.firstChild.scrollHeight;
        if(new_height > old_height) {
          old_height = new_height;
          node.style.height = old_height + 'px';
        }
        node.style.maxHeight = new_height + 'px';
      }
    }) :: @Div(attribs) :: content;
}


//----------------------------------------------------------------------
/**
   @variable Caret
   @summary A down-pointing caret arrow [surface::Element] (e.g. for use in dropdown triggers) 
*/

var CaretCSS = @CSS(
  `
  {
    display: inline-block;
    margin-left: 2px;
    vertical-align: middle;
    border-top: 4px solid;
    border-right: 4px solid transparent;
    border-left: 4px solid transparent;
  }
  `);
exports.Caret = @B() .. CaretCSS;

//----------------------------------------------------------------------
/**
   @function ActionLink
   @summary An `<a>` element that performs an action when clicked
   @param {surface::HtmlFragment} [content] Link content
   @param {Function} [action] Function to be executed when clicked. Will be passed the `<a>` DOM element.
   @desc
     Shorthand for

         @A(content) .. 
           @Attrib('href', '#') .. 
           @OnClick({handle: @preventDefault}, ev -> action(ev.currentTarget))
*/
exports.ActionLink = (content, action) ->
  @A(content) .. @Attrib('href', '#') .. @OnClick({handle: @preventDefault}, ev -> action(ev.currentTarget));

//----------------------------------------------------------------------

/**
   @function popover
   @summary Display a popover 
   @param {DOMNode} [anchor] DOM element relative to which popover will be positioned
   @param {surface::HtmlFragment} [content] Popover content
   @param {optional Object} [settings] 
   @param {Function} [block] Function bounding lifetime of popover
   @setting {Integer} [top=1] Top position of popover relative to anchor (scaled such that 0=top of anchor, 1=bottom of anchor)
   @setting {Integer} [left=0] Left position of popover relative to anchor (scaled such that 0=left of anchor, 1=right of anchor)
   @setting {Integer} [bottom=undefined] Bottom position of popover relative to anchor (scaled such that 0=top of anchor, 1=bottom of anchor)
   @setting {Integer} [right=undefined] Right position of popover relative to anchor (scaled such that 0=left of anchor, 1=right of anchor)
   @setting {Integer} [zindex=1040] CSS z-index of popover
   @demo
     @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}, 'mho:surface/widgets']);

     function doPopover(event) {
       @stopEvent(event);
       event.target .. @popover(@Div('This is a popover') .. @Style('border:2px solid #ffff00;background: #ffffcc;padding:5px;')) { 
         ||
         document .. @wait('click');
       }
     }

     @mainContent .. @appendContent([
       @demo.CodeResult("\
     function doPopover(event) {
       @stopEvent(event);
       event.target .. 
         @popover(
           @Div('This is a popover') .. 
             @Style(...)
         ) { 
           ||
           document .. @wait('click');
         }
     }

     @mainContent .. @appendContent([
       'The quick brown fox jumps over the ',
       @B('lazy') .. @OnClick(doPopover),
       ' dog',
       @Br(),
       'This is some more content. 1234567890.'
     ]);
       ",
       ["The quick brown fox jumps over the ", 
        @B("lazy") .. @Style('cursor:pointer') .. @OnClick(doPopover), 
        " dog.",
       @Br(),
       'This is some more content. 1234567890.'])
        ]);
*/

function popover(anchor, element, settings, block) {

  // untangle arguments:
  if (block === undefined && typeof settings === 'function') {
    block = settings;
    settings = undefined;
  }
  
  settings = {
    top: undefined,
    left: undefined,
    bottom: undefined,
    right: undefined,
    zindex: 1040
  } .. @override(settings);

  if (settings.left === undefined && settings.right === undefined)
    settings.left = 0;
  if (settings.top === undefined && settings.bottom === undefined)
    settings.top = 1;

  // to prevent the popover from being obscured by content in other stacking orders, we
  // append to the document body. determine position from anchor:

  var anchor_rect = anchor.getBoundingClientRect(); 

  var popover_CSS = @CSS("
    {
      position: absolute;
      z-index: #{settings.zindex};
      #{settings.left !== undefined ?  "left: #{anchor_rect.left + (anchor_rect.right-anchor_rect.left)*settings.left+window.scrollX}px;" : ''}
      #{settings.right !== undefined ?  "right: #{window.innerWidth - (anchor_rect.left + (anchor_rect.right-anchor_rect.left)*settings.right+window.scrollX)}px;" : ''}
      #{settings.top !== undefined ?  "top: #{anchor_rect.top + (anchor_rect.bottom-anchor_rect.top)*settings.top+window.scrollY}px;" : ''}
      #{settings.bottom !== undefined ?  "bottom: #{window.innerHeight - (anchor_rect.top + (anchor_rect.bottom-anchor_rect.top)*settings.bottom+window.scrollY)}px;" : ''}
    }
  ");

  return document.body .. @appendContent(
    element .. popover_CSS,
    block);
}
exports.popover = popover;

//----------------------------------------------------------------------

var DropdownMenu_CSS = @CSS('
  {
    box-shadow:
      0px 0px 2px 0px rgba(0,0,0,0.15),
      0px 6px 7px 0px rgba(0,0,0,0.15);
    border-radius: 3px;
    padding: 5px 0;
    margin: 0;
    background-color: #fff;
    list-style-type: none;
    min-width: 170px;
    overflow: hidden;
  }
  & > li  {
    display: block;
    text-decoration: none;
    color: #445;
    padding: 3px 20px;
    cursor: pointer;
  }

  & > li:hover {
    background: #fafafa;
  }

  & > li.selected {
    background: #f0f0f0;
  }
');

function waitforClosingClick(elem) {
  waitfor {
    // we wait for clicks during the capture phase, and if they are
    // outside of the menu, we close the menu:

    // before we wait for clicks, we wait for an initiating 'mousedown'. This is to ignore 
    // clicks that are already pendinging *before* calling waitforClosingClick.
    window .. @wait('!mousedown');

    window .. @events('!click') .. @each {
      |ev|
      var node = ev.target;
      while (node) {
        if (node === elem)
          break;
        node = node.parentNode;
      }
      if (!node) {
        // click is not contained in elem
        ev.stopPropagation();
        ev.preventDefault();
        return;
      }
    }
  }
  or {
    // we wait for bubbling clicks (those that have not been stopped
    // inside the dropdown) and close the menu for those too:
    elem .. @wait('click');
  }
}

/**
   @function doDropdown
   @altsyntax anchor .. doDropdown(items, [settings])
   @summary Display a dropdown menu and handle mouse/keyboard interactions
   @param {Object} [settings] 
   @setting {DOMNode} [anchor] DOM element relative to which dropdown will be positioned
   @setting {sjs:sequence::Sequence|sjs:observable::Observable} [items] Sequence of menu items as outlined in the description below, or Observable thereof.
   @setting {Boolean} [keyboard=false] If `true`, UP, DOWN, and ENTER interactions will be enabled.
   @setting {Integer} [top=1] Top position of dropdown relative to anchor (scaled such that 0=top of anchor, 1=bottom of anchor)
   @setting {Integer} [left=0] Left position of dropdown relative to anchor (scaled such that 0=left of anchor, 1=right of anchor)
   @setting {Integer} [bottom=undefined] Bottom position of dropdown relative to anchor (scaled such that 0=top of anchor, 1=bottom of anchor)
   @setting {Integer} [right=undefined] Right position of dropdown relative to anchor (scaled such that 0=left of anchor, 1=right of anchor)
   @return {Object} 
   @desc
     Members of `items` can either be [surface::HTMLFragment] content or objects

         {
           content: HTMLFragment,
           action: Function
         }

     Any content that is not an `Li()` [surface::Element] will be wrapped as an `Li()`.

     Any click will close the dropdown. If an item with an attached `action` function is clicked, `doDropdown` returns the result of executing `action()`.

     ### Positioning

     If neither `left` nor `right` are specified the dropdown will be horizontally aligned to the
     edge closest to the viewport border.

   @demo
     @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}, 'mho:surface/widgets']);


     function doMenu(target) {
       var rv = 
          target .. @doDropdown(
           [
             {content: 'foo', action: -> 'You chose foo'},
             {content: 'bar', action: -> 'You chose bar'}
           ]
         );
       if (rv !== undefined) 
         target .. @insertAfter(@Div(rv));
     }

     @mainContent .. @appendContent([
       @demo.CodeResult("\
     function doMenu(anchor) {
       var rv = 
         anchor .. @doDropdown(
           [
             {content: 'foo', action: -> 'You chose foo'},
             {content: 'bar', action: -> 'You chose bar'}
           ]
         );
       if (rv !== undefined) 
         anchor .. @insertAfter(@Div(rv));
     }
     
     @mainContent .. @appendContent(
       @ActionLink(`Menu $@Caret`, doMenu)
     )
     ",
     @ActionLink(`Menu $@Caret`, doMenu)
     )
     ])
     
*/

// XXX
var NakedUl = @ElementConstructor :: (content, attr) -> @Element('ul', content, attr);

function doDropdown(/* anchor, items, [settings] */) {
  
  // untangle arguments
  var anchor;
  var settings = {
    items: undefined,
    keyboard: false
  };
  
  anchor = arguments[0];

  if (arguments.length === 2) {
    if (@isSequence(arguments[1]))
      settings.items = arguments[1];
    else
      settings = settings .. @merge(arguments[1]);
  }
  else if (arguments.length === 3) {
    settings = settings .. @merge(arguments[2]);
    settings.items = arguments[1];
  }
  else
    throw new Error("Unexpected number of arguments");

  if (!@isObservable(settings.items)) {
    settings.items = @constantObservable(settings.items);
  }
  var action;

  function makeDropdownItem(item) {
    var rv;
    // xxx this duck-typing check should be made better
    if (typeof item === 'object' && 
        !@isElement(item) && 
        !Array.isArray(item) &&
        item.content !== undefined) {
      rv = item.content;
      if (!@isElementOfType(rv, 'li'))
        rv = @Li(rv);
      if (item.action) {
        // make sure item is wrapped as <li> before we do the OnClick, so that we capture clicks on the full menu item:
        rv = rv .. @OnClick(-> action = item.action);
      }
    }
    else {
      rv = item;
      if (!@isElementOfType(rv, 'li'))
        rv = @Li(rv);
    }
    
    return rv;
  }

  if (settings.left === undefined && settings.right === undefined) {
    // intelligently align dropdown to edge closest to viewport boundary
    var anchor_rect = anchor.getBoundingClientRect(); 
    var dX = (anchor_rect.left + anchor_rect.right)/2;
    if (dX < window.innerWidth - dX) {
      settings.left = 0;
    }
    else {
      settings.right = 1;
    }
      
  }

  var DropdownUpdatedEmitter = @Emitter();

  var DropdownContent = @Observable(function(r) {
    settings.items .. @each.track {
      |items| 


      DropdownUpdatedEmitter.emit();

      // asynchronizing here makes sure that the
      // DropdownUpdatedEmitter call below is caught by the keyboard
      // processing code below when the dropdown is opened initially.
      // Also, it prevents certain flicker scenarios: e.g. when we want to 
      // hide the dropdown when text in a select field is empty, we want a chance to
      // do so _before_ the dropdown is refilled with suggestions:
      hold(0);


      r(@CollectStream(items .. afterFirst(-> DropdownUpdatedEmitter.emit()) .. @transform(makeDropdownItem)));
    }
  });

  anchor .. popover(
    NakedUl .. DropdownMenu_CSS ::
      DropdownContent,
    settings
  ) {
    |dropdownDOMElement|
    waitfor {
      waitforClosingClick(dropdownDOMElement);
    }
    or {
      dropdownDOMElement .. @events('!mousedown') .. @each {
        |ev|
        // prevent mousedowns from initiating blur events
        ev.preventDefault();
      }
    }
    or {
      if (!settings.keyboard) hold();
      DropdownUpdatedEmitter .. @each.track {
        ||
        var selected = dropdownDOMElement.querySelector('li');
        if (!selected) continue;
        selected.classList.add('selected');

        document .. @events('!keydown') .. @each {
          |ev|
          var code = ev.keyCode;
          if ( (code === 38 || code === 40 || code === 13) &&
               (!ev.altKey && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey)
             ) {
            ev.preventDefault();
            if (code === 13) {
              selected.click();
            }
            else {
              var new_selected;
              if (code === 38)
                new_selected = selected.previousElementSibling;
              else
                new_selected = selected.nextElementSibling;
              if (new_selected) {
                selected.classList.remove('selected');
                selected = new_selected;
                selected.classList.add('selected');
              }
            }
          }
        }

      }
    }
  }
  hold(0); // asynchronize, so that we don't act on propagating clicks again
  if (action)
    return action();
}
exports.doDropdown = doDropdown;

/**
   @function DropdownMenu
   @deprecated Use [::doDropdown]
*/
function DropdownMenu(anchor, items, settings) {
  return anchor ..
    @OnClick(ev -> doDropdown(ev.currentTarget, items, settings));
}
exports.DropdownMenu = DropdownMenu;

//----------------------------------------------------------------------
// XXX This needs some work. see e.g. https://www.smashingmagazine.com/2014/09/making-modal-windows-better-for-everyone/

/**
   @function overlay
   @altsyntax content .. overlay([settings]) { |node1, node2, ..., backdrop_node| ... }
   @summary Modal overlay
   @param {surface::HtmlFragment} [content] Overlay content
   @param {optional Object} [settings]
   @param {Function} [block]
   @setting {Integer} [zindex=1040]
   @setting {String} [backdrop_click_cmd='backdrop-click'] Name of command to emit when backdrop is clicked
   @setting {mho:surface::CSS} [css] CSS overrides
   @desc
     Displays a fixed backdrop covering the full viewport with `content` overlayed. 
     
     The overlay will be displayed for the duration of `block`, a function which will be called with
     an argument list consisting of the top-level content DOM nodes and, as last parameter, the backdrop DOM node:
     
         block(content_node1, content_node2, ..., backdrop_node) 

     `block` is called with a [mho:surface::DynamicDOMContext] set to the same list of nodes as block's arguments.
     This means that certain operations within `block` do not require an explicit context. E.g. [mho:surface/field::Field]s contained 
     in the first top-level content DOM node can be implicitly resolved. Similarly, any commands emitted by [mho:surface/cmd::On] on
     *any* of the content nodes or the backdrop node can be bound to using [mho:surface/cmd::stream].
     
     Clicks on the backdrop generate the command 'backdrop-click', customizable through the setting `backdrop_click_cmd`.

     ### CSS Customization
 
         // (use '&.mho-overlay' when applying as `css` parameter to `overlay`; '.mho-overlay' otherwise):
         &.mho-overlay {
           // overlay backdrop color:
           background-color: rgba(24,24,24,0.6);
         }
*/
function overlay(content, settings, block) {

  // untangle arguments:
  if (block === undefined && typeof settings === 'function') {
    block = settings;
    settings = undefined;
  }

  settings = {
    zindex: 1040,
    backdrop_click_cmd: 'backdrop-click',
    css: undefined
  } .. @override(settings);

  var OverlayCSS = @CSS([
    { prepend: true },
    `
    @global {
      .mho-overlay {
        z-index: ${settings.zindex};
        overflow-y: scroll;
        top: 0; 
        left: 0;
        width: 100%;
        height: 100%;
        position: fixed;
        background-color: rgba(24,24,24,0.6);
      }
      body { 
        overflow: hidden;
      }
    }
    `]);

  var html = @Div .. 
    OverlayCSS ..
    @Class('mho-overlay') .. 
    @Attrib('tabindex', '-1') .. 
    @cmd.Click(settings.backdrop_click_cmd, {filter: ev -> ev.eventPhase === 2 /* AT_TARGET */}) ::
      content;

  if (settings.css)
    html = html .. settings.css;

  document.body .. @appendContent(html) {
    |overlay_node|
    var content_nodes = overlay_node.childNodes .. @toArray;
    // append the backdrop to the end of the context, so that
    // field.Value resolves ok (field.Value only checks the first node
    // in the DOM context). Don't omit backdrop from context entirely
    // so that we can still bind to the 'backdrop-click' command.
    var backdrop_node = overlay_node;
    content_nodes.push(backdrop_node);
    @withDOMContext(content_nodes) {
      ||
      block.apply(null, content_nodes);
    }
  }
}
exports.overlay = overlay;


/**
   @function dialog
   @summary Modal 'dialog-style' overlay page
   @param {surface::HtmlFragment} [content] Page content
   @param {optional Object} [settings]
   @param {Function} [block]
   @setting {Integer} [zindex=1040]
   @setting {String} [type='small'] Type of page layout ('small', 'large', 'page') 
   @setting {mho:surface::CSS} [css] CSS overrides
   @desc
     Displays a fixed backdrop (see [::overlay]) with an overlayed dialog-style page.

     The dialog will be displayed for the duration of `block`, a function which will be called with
     an argument list consisting of the top-level page content DOM nodes and, as last parameter, the backdrop DOM node:
     
         block(page_content_node1, page_content_node2, ..., 
               dialog_close_button_node, backdrop_node)

     `block` is called with a [mho:surface::DynamicDOMContext] set to the same list of nodes as block's arguments.
     This means that certain operations within `block` do not require an explicit context. E.g. [mho:surface/field::Field]s contained 
     in the top-level content DOM nodes can be implicitly resolved. Similarly, any commands emitted by [mho:surface/cmd::On] on
     *any* of the content nodes or the backdrop node can be bound to using [mho:surface/cmd::stream].

     Clicks on the background generate command 'dialog-close'. If 'dialog-close' is active (i.e. being listened for), a 
     close button ('x') in the top right corner will also be displayed (and clicks on this button also generate 'dialog-close'). 

     ### CSS Customization
 
     - See also [::overlay]


         .mho-dialog 
         .mho-dialog--type_small
         .mho-dialog--type_large
         .mho-dialog--type_page
         .mho-dialog__close
         

*/

var SMALL_DIALOG_MARGIN_TOP = 80;
var SMALL_DIALOG_WIDTH = 600;
var SMALL_DIALOG_MIN_HEIGHT = 100;

var LARGE_DIALOG_MARGIN_TOP = 80;
var LARGE_DIALOG_WIDTH = 817;
var LARGE_DIALOG_MIN_HEIGHT = 200;

var PAGE_DIALOG_MARGIN_TOP_BOTTOM = 20;
var PAGE_DIALOG_WIDTH = 920;


var DialogCSS = @CSS([
  { prepend: true },
  `
  @global {
    .mho-dialog__close {
      position: fixed;
      top: 0;
      right: 0;
      padding-top: 10px;
      padding-right: 20px;
      color: #fff;
      opacity: 0.6;
      font-size: 36px;
      cursor: pointer;
    }

    .mho-dialog__close:hover {
      opacity: 1;
    }

    .mho-dialog__close_disabled {
      display: none;
    }

    .mho-dialog {
      position:relative;
      background-color: var(--mho-theme-background, #fff);
      ${@style_helpers.Elevation(24)}
      border-radius: 2px;
      overflow:auto;
    }

    .mho-dialog--type_small {
      width: ${SMALL_DIALOG_WIDTH}px;
      margin: ${SMALL_DIALOG_MARGIN_TOP}px auto;
      min-height: ${SMALL_DIALOG_MIN_HEIGHT}px;      
    }

    .mho-dialog--type_large {
      width: ${LARGE_DIALOG_WIDTH}px;
      margin: ${LARGE_DIALOG_MARGIN_TOP}px auto;
      min-height: ${LARGE_DIALOG_MIN_HEIGHT}px;      
    }

    .mho-dialog--type_page {
      width: ${PAGE_DIALOG_WIDTH}px;
      margin: ${PAGE_DIALOG_MARGIN_TOP_BOTTOM}px auto;
      min-height: calc(100vh - ${PAGE_DIALOG_MARGIN_TOP_BOTTOM*2}px);      
    }

    .mho-dialog__content {
      margin: 24px 24px 8px 24px;
    }

    .mho-dialog__title + .mho-dialog__content {
      margin-top: 20px;
    }

    .mho-dialog__title {
      margin: 24px 24px 0px 24px;
    }

    .mho-dialog__actions {
      margin: 32px 8px 8px 24px;
      display: flex;
      justify-content: flex-end;
    }
  }
`]);

//----------------------------------------------------------------------


function dialog(content, settings, block) {
  // untangle arguments:
  if (block === undefined && typeof settings === 'function') {
    block = settings;
    settings = undefined;
  }

  settings = {
    zindex: 1040,
    type: 'small',
    css: undefined
  } .. @override(settings);

  var css;
  if (settings.css)
    css = x -> x .. DialogCSS .. settings.css;
  else
    css = DialogCSS;

  var ui = [
    @Div .. 
      @Class('mho-dialog__close') .. 
      @Class(@cmd.Active('dialog-close') .. @transform(b -> !b ? 'mho-dialog__close_disabled' )) .. 
      @cmd.Click('dialog-close') :: `&#xd7;`,
    ResizingMaterial .. @Class("mho-dialog mho-dialog--type_#{settings.type}") :: content
  ];

  overlay(ui, {zindex: settings.zindex, css: css, backdrop_click_cmd: 'dialog-close'}) {
    |dialog_close_node, dialog_node, backdrop_node|
    // see comment in @appendContent body of @overlay
    var content_nodes = dialog_node.firstChild.children .. @toArray;
    content_nodes.push(dialog_close_node);
    content_nodes.push(backdrop_node);
    @withDOMContext(content_nodes) {
      ||
      block.apply(null, content_nodes);
    }
  }


}
exports.dialog = dialog;

/**
   @function dialog.Content
   @summary A `<div>` element with suitable styles for [::dialog] page content
   @param {surface::HtmlFragment} [content]
   @desc
     ### CSS Customization
         
         &.mho-dialog__content // (use &.mho-dialog__content' when applying directly to element; '.mho-dialog__content' otherwise)
*/
dialog.Content = content -> @Div .. @Class('mho-dialog__content mho-typo--body-1 mho-color--secondary') :: content;

/**
   @function dialog.Title
   @summary A `<div>` element with suitable styles for [::dialog] title content
   @param {surface::HtmlFragment} [content]
   @desc
     ### CSS Customization
         
         &.mho-dialog__title // (use &.mho-dialog__title' when applying directly to element; '.mho-dialog__title' otherwise)
*/
dialog.Title = content -> @Div .. @Class('mho-dialog__title mho-typo--title mho-color--primary') :: content;

/**
   @function dialog.Actions
   @summary A `<div>` element with suitable styles for [::dialog] actions section content
   @param {surface::HtmlFragment} [content]
   @desc
     ### CSS Customization
         
         &.mho-dialog__actions // (use &.mho-dialog__actions' when applying directly to element; '.mho-dialog__actions' otherwise)
*/
dialog.Actions = content -> @Div .. @Class('mho-dialog__actions') :: content;
