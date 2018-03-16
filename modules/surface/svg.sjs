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
  @summary Basic SVG elements
  @desc
    This module defines basic SVG building blocks.
*/

var { hostenv } = require('builtin:apollo-sys');

var imports = [
  'sjs:std',
  {id:'./base', include: ['Element', 'ElementConstructor', 'looksLikeHtmlFragment']}
];

/*
if (hostenv === 'xbrowser') {
  imports = imports.concat([
    {id:'./dynamic', include: ['replaceContent']},
    {id:'./field', name:'field'},
    {id:'./nodes', include: ['getDOMITF']}
  ]);
}
*/

@ = require(imports);

//----------------------------------------------------------------------
// helpers

__js {
  function parseOptionalContentAndAttribs(args) {
    var content, attribs;
    if (args.length === 1) {
      if (args[0] .. @looksLikeHtmlFragment)
        content = args[0];
      else
        attribs = args[0];
    }
    else if (args.length > 1) {
      content = args[0];
      attribs = args[1];
    }
    return [content, attribs];
  }
}


//----------------------------------------------------------------------

/**
   @summary Basic SVG building blocks
   @desc
     This module defined basic SVG elements and supporting functions
*/

//----------------------------------------------------------------------
// Supporting functions

/**
   @function eventToSvgCoords
   @summary Converts event coordinates to coordinates of the given svg node
   @param {DOMEvent} [event] 
   @param {DOMNode}  [svg_node] An 'SVGLocatable' DOM node
   @return {SVGPoint} SVGPoint object with {x,y} members
*/
__js {
  function eventToSvgCoords(ev, svg_node) {
    var svg_svg_node = svg_node.farthestViewportElement || svg_node;
    var pt = svg_svg_node.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    return pt.matrixTransform(svg_node.getScreenCTM().inverse());
  }
  exports.eventToSvgCoords = eventToSvgCoords;
}

//----------------------------------------------------------------------
// Elements

/**
   @function Path
   @summary Create a [path](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) element
   @param {optional Object} [attributes] Attributes to set on the element (e.g. `{d:"M0 0L10 10"}`)
   @return {surface::Element}
   @desc
     This function is an [surface::ElementConstructor], i.e. it can be used as a [surface::HtmlFragment] with or without function application.
*/
__js exports.Path = @ElementConstructor :: (attribs) -> @Element('path', null, attribs);

/**
   @function G
   @summary Create a [g](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g) element
   @param {optional surface::HtmlFragment} [content]
   @param {optional Object} [attributes] Attributes to set on the element
   @return {surface::Element}
   @desc
     This function is an [surface::ElementConstructor], i.e. it can be used as a [surface::HtmlFragment] with or without function application.
*/
__js exports.G = @ElementConstructor :: function(/*content,attribs*/) {
  var content_attribs = parseOptionalContentAndAttribs(arguments);
  return @Element('g', content_attribs[0], content_attribs[1]);
}

/**
   @function Text
   @summary Create a [text](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text) element
   @param {optional surface::HtmlFragment} [content]
   @param {optional Object} [attributes] Attributes to set on the element
   @return {surface::Element}
   @desc
     This function is an [surface::ElementConstructor], i.e. it can be used as a [surface::HtmlFragment] with or without function application.
*/
__js exports.Text = @ElementConstructor :: function(/*content,attribs*/) {
  var content_attribs = parseOptionalContentAndAttribs(arguments);
  return @Element('text', content_attribs[0], content_attribs[1]);
}

/**
   @function Circle
   @summary Create a [circle](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle) element
   @param {optional Object} [attributes] Attributes to set on the element
   @return {surface::Element}
   @desc
     This function is an [surface::ElementConstructor], i.e. it can be used as a [surface::HtmlFragment] with or without function application.
*/
__js exports.Circle = @ElementConstructor :: (attribs) -> @Element('circle', null, attribs);

/**
   @function Line
   @summary Create a [line](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line) element
   @param {optional Object} [attributes] Attributes to set on the element
   @return {surface::Element}
   @desc
     This function is an [surface::ElementConstructor], i.e. it can be used as a [surface::HtmlFragment] with or without function application.
     
     ### Example

         @Line({x1:20, y1:100, x2:100, y2:20, 'stroke-width':2, stroke:'black'})

*/
__js exports.Line = @ElementConstructor :: (attribs) -> @Element('line', null, attribs);

/**
   @function Rect
   @summary Create a [rect](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect) element
   @param {optional Object} [attributes] Attributes to set on the element
   @return {surface::Element}
   @desc
     This function is an [surface::ElementConstructor], i.e. it can be used as a [surface::HtmlFragment] with or without function application.
*/
__js exports.Rect = @ElementConstructor :: (attribs) -> @Element('rect', null, attribs);



/**
   @function ClipPath
   @summary Create a [clipPath](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) element
   @param {optional surface::HtmlFragment} [content]
   @param {optional Object} [attributes] Attributes to set on the element
   @return {surface::Element}
   @desc
     This function is an [surface::ElementConstructor], i.e. it can be used as a [surface::HtmlFragment] with or without function application.
*/
__js exports.ClipPath = @ElementConstructor :: function(/*content,attribs*/) {
  var content_attribs = parseOptionalContentAndAttribs(arguments);
  return @Element('clipPath', content_attribs[0], content_attribs[1]);
}

/**
   @function Image
   @summary Create an [image](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image) element
   @param {optional Object} [attributes] Attributes to set on the element
   @return {surface::Element}
   @desc
     This function is an [surface::ElementConstructor], i.e. it can be used as a [surface::HtmlFragment] with or without function application.
*/
__js exports.Image = @ElementConstructor :: (attribs) -> @Element('image', null, attribs);
