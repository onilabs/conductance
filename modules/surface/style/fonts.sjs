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
   @nodoc
*/

@ = require([
  'sjs:std'
]);

//----------------------------------------------------------------------
// CSS definitions for built-in Conductance Roboto fonts - see
// e.g. https://github.com/choffmeister/roboto-fontface-bower or 
// https://fonts.googleapis.com/css?family=Roboto:100,300,400,700 etc

var AvailableRobotoStyles = {
  '100' :        { font: 'Roboto-Thin',          weight: '100', style: 'normal' },
  '100-italic' : { font: 'Roboto-ThinItalic',    weight: '100', style: 'italic' },
  '300' :        { font: 'Roboto-Light',         weight: '300', style: 'normal' },
  '300-italic' : { font: 'Roboto-LightItalic',   weight: '300', style: 'italic' },
  '400' :        { font: 'Roboto-Regular',       weight: '400', style: 'normal' },
  '400-italic' : { font: 'Roboto-RegularItalic', weight: '400', style: 'italic' },
  '500' :        { font: 'Roboto-Medium',        weight: '500', style: 'normal' },
  '500-italic' : { font: 'Roboto-MediumItalic',  weight: '500', style: 'italic' },  
  '700' :        { font: 'Roboto-Bold',          weight: '700', style: 'normal' },
  '700-italic' : { font: 'Roboto-BoldItalic',    weight: '700', style: 'italic' },  
  '900' :        { font: 'Roboto-Black',         weight: '900', style: 'normal' },
  '900-italic' : { font: 'Roboto-BlackItalic',   weight: '900', style: 'italic' }
};

exports.Roboto = function(settings) {
  settings = {
    styles: ['400'],
    server_root: '/'
  } .. @override(settings);

  var font_dir = settings.server_root + '__mho/surface/fonts/Roboto/';

  return settings.styles .. @transform(function(style) {
    var descriptor = AvailableRobotoStyles[style];
    if (!descriptor) throw new Error("Roboto font not available in style '#{style}'");
    return `@font-face { 
              font-family: 'Roboto';
              src: local('${descriptor.font}'), local('${descriptor.font.replace("-"," ")}'), url('${font_dir+descriptor.font+".woff2"}') format('woff2'), url('${font_dir+descriptor.font+".woff"}') format('woff');
              font-weight: ${descriptor.weight};
              font-style: ${descriptor.style};
            }
`;
  }) .. @join(``);
};

//----------------------------------------------------------------------

var AvailableRobotoSlabStyles = {
  '100' :        { postfix: 'Thin',    weight: '100', style: 'normal' },
  '300' :        { postfix: 'Light',   weight: '300', style: 'normal' },
  '400' :        { postfix: 'Regular', weight: '400', style: 'normal' },
  '700' :        { postfix: 'Bold',    weight: '700', style: 'normal' }
};


exports.RobotoSlab = function(settings) {
  settings = {
    styles: ['400'],
    server_root: '/'
  } .. @override(settings);

  var font_dir = settings.server_root + '__mho/surface/fonts/Roboto/';

  return settings.styles .. @transform(function(style) {
    var descriptor = AvailableRobotoSlabStyles[style];
    if (!descriptor) throw new Error("Roboto font not available in style '#{style}'");
    return `@font-face { 
              font-family: 'Roboto Slab';
              src: local('${"Roboto Slab "+descriptor.postfix}'), local('${"RobotoSlab-"+descriptor.postfix}'), url('${font_dir+"Roboto-Slab-"+descriptor.postfix+".woff2"}') format('woff2'), url('${font_dir+"Roboto-Slab-"+descriptor.postfix+".woff"}') format('woff');
              font-weight: ${descriptor.weight};
              font-style: ${descriptor.style};
            }
`;
  }) .. @join(``);
};


// XXX TODO Roboto Condensed
