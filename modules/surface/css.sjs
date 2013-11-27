var { each, map, join, toArray } = require('sjs:sequence');

/*
A coarse CSS parser, parsing into an array BLOCK, which takes elements:
   - "decl_str"
   - [ "kw_or_selector", BLOCK ]
*/
var blockRE = /\s*((?:[^\"\'\{\}\;\/]|\/[^\*])*)(\"|\'|\/\*|\{|\}|\;)/g;
var dstrRE = /(\"(?:\\.|[^"])*\")/g;
var sstrRE = /(\'(?:\\.|[^'])*\')/g;
var commentRE = /\*\//g;
var wsRE = /\s*$/g;

__js function parseCSSBlocks(src) {
  var index = 0;
  function block() {
    var matches, chunk = '', content = [];
    // parse chunk up to next 'operator':  " OR ' OR /* OR { OR } OR ; 
    blockRE.lastIndex = index;
    while ((matches = blockRE.exec(src))) {
      //console.log(matches);
      index = blockRE.lastIndex;
      if (matches[1]) chunk += matches[1];
      switch (matches[2]) {
      case '"':
        dstrRE.lastIndex = index-1;
        matches = dstrRE.exec(src);
        if (!matches) throw new Error('Invalid CSS: Unterminated string');
        chunk += matches[1];
        index = dstrRE.lastIndex;
        break;
      case "'":
        sstrRE.lastIndex = index-1;
        matches = sstrRE.exec(src);
        if (!matches) throw new Error('Invalid CSS: Unterminated string');
        chunk += matches[1];
        index = sstrRE.lastIndex;
        break;
      case '/*':
        commentRE.lastIndex = index;
        matches = commentRE.exec(src);
        if (!matches) throw new Error('Invalid CSS: Unterminated comment');
        // ignore comment
        index = commentRE.lastIndex;
        break;
      case '{':
        content.push([chunk, block()]);
        if (src.charAt(index-1) != '}') throw new Error('Invalid CSS: Unterminated block');
        chunk = '';
        break;
      case '}':
        if (chunk.length) content.push(chunk);
        return content;
        break;
      case ';':
        content.push(chunk + ';');
        chunk = '';
        break;
      }
      blockRE.lastIndex = index;
    }
    if (chunk.length) throw new Error('Invalid CSS: Trailing content in block');
    return content;
  }
  var rv = block();
  if (index != src.length) {
    // allow trailing whitespace:
    wsRE.lastIndex = index;
    if (wsRE.exec(src) == null)
      throw new Error(
        "Invalid CSS: Unparsable around '#{src.substr(Math.max(0,index-20), 40).replace(/\n/g,'\\n')}'"
      );
  }
  return rv;
}

//----------------------------------------------------------------------
// scope: Apply a parent selector to a block of css

__js var prefixWith = function(selectorStr, prefixes) {
  selectorStr = selectorStr.trim();
  var rv = [];

  selectorStr.split(",") .. each(function(sel) {
    sel = sel.trim();
    if (sel.length === 0) return;
    if (prefixes.length) {
      prefixes .. each(function(prefix) {
        // fold prefixes into selector; if selector starts with
        // '&' append without space (e.g. a class selector that
        // should apply to the top-level)
        if(sel.charAt(0) === '&') {
          rv.push("#{prefix}#{sel.substr(1)}");
        } else {
          rv.push("#{prefix} #{sel}");
        }
      });
    } else {
      rv.push(sel);
    }
  });
  return rv;
};

function scope(css, parent_class) {
  var prefixes;
  if (parent_class)
    prefixes = [".#{parent_class}"];
  else
    prefixes = [];

  var blocks = parseCSSBlocks(css);

  function processBlock(block, prefixes) {
    return block .. map(function(elem) {
      if (!Array.isArray(elem)) {
        return "#{prefixes .. join(", ")} { #{elem} }"; // a decl
      } else {
        if (elem[0].charAt(0) != '@') {
          var childPrefixes = elem[0] .. prefixWith(prefixes);
          return processBlock(elem[1], childPrefixes);
        }
        else if (elem[0].indexOf('@global') === 0) {
          // apply style globally (i.e. don't fold in prefix
          return processBlock(elem[1], []);
        }
        else if (elem[0].indexOf('keyframes') !== -1) {
          //@keyframes or similar .. don't apply prefix
          return "#{elem[0]} { #{processBlock(elem[1], prefixes)} }";
        }
        else {
          // generic '@'-rule (maybe a media query)
          return "#{elem[0]} { #{processBlock(elem[1], prefixes)} }";
        }
      }
    }) .. join('\n');
  }

  return processBlock(blocks, prefixes);
}
exports.scope = scope;

//----------------------------------------------------------------------
// color arithmetic

// partially derived from code by the less.js project (http://lesscss.org/), which
// is licensed under the Apache License V 2.0

/*
 formats:

  css:
    3 digit hex string:   #RGB
    6 digit hex string:   #RRGGBB
    rgb functional str:   rgb(num_or_num%, num_or_num%, num_or_num%)
    rgba functional str:  rgba(num_or_num%, num_or_num%, num_or_num, num)
    hsl functional str:   hsl(num, num%, num%)
    hsla functional str:  hsla(num, num%, num%, num)
    color keywords not supported!!

  rgba: [r,g,b,a] (r,g,b: 0-255, a:0-1)

  hsla: [h,s,l,a] (h:0-360, s:0-1, l:0-1, a:0-1)
*/
__js {

function rgbaToHsla(rgba) {
  var r = rgba[0]/255, g = rgba[1]/255, b = rgba[2]/255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2, d = max - min;

  if (max == min) {
    h = s = 0;
  } 
  else {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (r == max)
      h = (g - b) / d + (g < b ? 6 : 0);
    else if (g == max)
      h = (b - r) / d + 2;
    else
      h = (r - g) / d + 4;            
    h /= 6;
  }
  return [h * 360, s, l, rgba[3]];
}


var cssColorRE = /#([a-fA-F0-9]{6})|#([a-fA-F0-9]{3})|rgb\(([^\)]+)\)|rgba\(([^\)]+)\)|hsl\(([^\)]+)\)|hsla\(([^\)]+)\)/;
function cssToRgba(css_color) {
  var matches = cssColorRE.exec(css_color);
  if (!matches) throw new Error("invalid css color "+css_color);

  var rgba;
  if (matches[1]) {
    // 6 digit hex string
    rgba = matches[1].match(/.{2}/g) .. map(c => parseInt(c,16)) .. toArray;
    rgba.push(1);
  }
  else if (matches[2]) {
    // 3 digit hex string
    rgba = matches[2].split('') .. map(c => parseInt(c+c,16)) .. toArray;
    rgba.push(1);
  }
  else if (matches[3]) {
    // rgb(.)
    rgba = matches[3].split(",") .. 
      map(n => n.indexOf("%") > -1 ? parseFloat(n)*2.55 : parseFloat(n)) ..
      toArray;
    rgba.push(1);
    if (rgba.length != 4) throw new Error("invalid css color "+css_color);
  }
  else if (matches[4]) {
    // rgba(.)
    rgba = matches[4].split(",") .. 
      map(n => n.indexOf("%") > -1 ? parseFloat(n)*2.55 : parseFloat(n)) ..
      toArray;
    if (rgba.length != 4) throw new Error("invalid css color "+css_color);
  }
  else if (matches[5]) {
    throw new Error("write me");
    // hsl(.)
  }
  else if (matches[6]) {
    throw new Error("write me");
    // hsla(.)
  }

  return rgba;
}

function cssToHsla(css_color) {
  return rgbaToHsla(cssToRgba(css_color));
}

function clamp01(val) { return Math.min(1, Math.max(0,val)); }
function clamp0255(val) { return Math.min(255, Math.max(0,val)); }

function hexByte(v) {
  v = clamp0255(Math.round(v)).toString(16);
  return v.length == 1 ? "0#{v}" : v;
}

function hslaToRgba(hsla) {
  var h = (hsla[0] % 360)/360;
  var s = hsla[1];
  var l = hsla[2];
  var a = hsla[3];

  var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
  var m1 = l * 2 - m2;

  function hue(h) {
    h = h < 0 ? h + 1 : (h > 1 ? h - 1 : h);
    if      (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    else if (h * 2 < 1) return m2;
    else if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
    else                return m1;
  }
  
  return [hue(h+1/3)*255, hue(h)*255, hue(h-1/3)*255, a];
}


function rgbaToCss(rgba) {
  if (rgba[3] < 1.0) {
    return "rgba(#{ rgba .. map(c => Math.round(c)) .. join(',') })";
  }
  else {
    rgba.pop();
    return "##{ rgba .. map(hexByte) .. join('') }";
  }
}

function hslaToCss(hsla) {
  return rgbaToCss(hslaToRgba(hsla));
}

function darken(css_color, amount) {
  var hsla = cssToHsla(css_color);
  hsla[2] = clamp01(hsla[2] - amount);
  return hslaToCss(hsla);
}

function lighten(css_color, amount) {
  var hsla = cssToHsla(css_color);
  hsla[2] = clamp01(hsla[2] + amount);
  return hslaToCss(hsla);  
}

function fadein(css_color, amount) {
  var hsla = cssToHsla(css_color);
  hsla[3] = clamp01(hsla[3] + amount);
  return hslaToCss(hsla);
}

function spin(css_color, amount) {
  var hsla = cssToHsla(css_color);
  hsla[0] = (hsla[0] + amount) % 360;
  if (hsla[0] < 0) hsla[0] += 360;
  return hslaToCss(hsla);
}

//
// Copyright (c) 2006-2009 Hampton Catlin, Nathan Weizenbaum, and Chris Eppstein
// http://sass-lang.com
//
function mix(color1, color2, weight) {
  color1 = cssToRgba(color1);
  color2 = cssToRgba(color2);
  var w = weight * 2 - 1;
  var a = color1[3] - color2[3];

  var w1 = (((w * a == -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
  var w2 = 1 - w1;
  
  var rgba = [color1[0] * w1 + color2[0] * w2,
              color1[1] * w1 + color2[1] * w2,
              color1[2] * w1 + color2[2] * w2,
              color1[3] * weight + color2[3] * (1 - weight)
             ];
  
  return rgbaToCss(rgba);
};

exports.darken = darken;
exports.lighten = lighten;
exports.fadein = fadein;
exports.spin = spin;
exports.mix = mix;

} // __js

//----------------------------------------------------------------------
// css value arithmetic

__js {

var cssValueRE = /^\s*(-?\d*\.?\d*)(\D*)$/;

function parseCssValue(css_val) {
  if (typeof css_val == 'number') return [css_val, 'px'];
  // else... we assume it's a string
  var matches = cssValueRE.exec(css_val);
  if (!matches || !matches[0]) throw new Error("invalid css value #{css_val}");
  return [parseFloat(matches[1]),matches[2]];
}

function encodeCssValue(val) {
  // we'll round to 5 decimals
  val[0] = Math.round(val[0]*100000)/100000;
  return "#{val[0]}#{val[1]}";
}

function scale(css_val, factor) {
  var val = parseCssValue(css_val);
  val[0] *= factor;
  return encodeCssValue(val);
}

function add(css_val1, css_val2) {
  var val1 = parseCssValue(css_val1), val2 = parseCssValue(css_val2);
  if (val1[1] != val2[1]) 
    throw new Error("cannot add mismatching css values (#{css_val1},#{css_val2})");
  val1[0] += val2[0];
  return encodeCssValue(val1);
}

function subtract(css_val1, css_val2) {
  var val1 = parseCssValue(css_val1), val2 = parseCssValue(css_val2);
  if (val1[1] != val2[1]) 
    throw new Error("cannot subtract mismatching css values (#{css_val1},#{css_val2})");
  val1[0] -= val2[0];
  return encodeCssValue(val1);
}

exports.scale = scale;
exports.add = add;
exports.subtract = subtract;
} // __js

