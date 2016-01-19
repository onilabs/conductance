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

@ = require([
  'sjs:std',
  'mho:surface',
  'mho:surface/html'
])

//----------------------------------------------------------------------

/**
   @function popover
   @summary document me
*/

function popover(anchor, element, settings, block) {
  settings = {
    top: undefined,
    left: undefined,
    bottom: undefined,
    right: undefined
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
      z-index: 1000;
      #{settings.left !== undefined ?  "left: #{anchor_rect.left + (anchor_rect.right-anchor_rect.left)*settings.left+window.scrollX}px;" : ''}
      #{settings.right !== undefined ?  "right: #{anchor_rect.left + (anchor_rect.right-anchor_rect.left)*settings.right+window.scrollX}px;" : ''}
      #{settings.top !== undefined ?  "top: #{anchor_rect.top + (anchor_rect.bottom-anchor_rect.top)*settings.top+window.scrollY}px;" : ''}
      #{settings.bottom !== undefined ?  "bottom: #{anchor_rect.top + (anchor_rect.bottom-anchor_rect.top)*settings.bottom+window.scrollY}px;" : ''}
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
');

function waitforClosingClick(elem) {
  waitfor {
    // we wait for clicks during the capture phase, and if they are
    // outside of the menu, we close the menu:
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
   @summary document me
*/
function doDropdown(/* anchor, items, [settings] */) {
  
  // untangle arguments
  var anchor;
  var settings = {
    items: undefined
  };
  
  anchor = arguments[0];

  if (arguments.length === 2) {
    if (Array.isArray(arguments[1]))
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

  var action;

  function makeDropdownItem(item) {
    var rv;
    // xxx this duck-typing check should be made better
    if (typeof item === 'object' && 
        !@isElement(item) && 
        !Array.isArray(item) &&
        item.content !== undefined) {
      rv = item.content;
      if (item.action) {
        rv = rv .. @OnClick(-> action = item.action);
      }
    }
    else
      rv = item;
    
    return rv;
  }


  anchor .. popover(
    @Ul(settings.items .. @transform(makeDropdownItem) .. @toArray) .. DropdownMenu_CSS,
    settings
  ) {
    |dropdownDOMElement|
    waitforClosingClick(dropdownDOMElement);
    hold(0); // asynchronize, so that we don't act on propagating clicks again
  }
  if (action)
    return action();
}
exports.doDropdown = doDropdown;

/**
   @function DropdownMenu
   @summary document me
*/
function DropdownMenu(anchor, items, settings) {
  return anchor ..
    @OnClick(ev -> doDropdown(ev.currentTarget, items, settings));
}
exports.DropdownMenu = DropdownMenu;
