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
   @nodoc
   @summary Helpers for mapping between tuple keys and ordered binary representation

   // XXX TODO: document; recode so that it works with ArrayBuffers too (for client-side use)



    keys are encoded as follows:

    buffer: <1> + <byte stream> + <0x00>
            <0x00> in <byte stream> is encoded as <0x00> + <0xFF>

    string: <2> + <utf8 byte stream> + <0x00>
            <0x00> in <utf 8 byte stream> is encoded as <0x00> + <0xFF>

    64 bit integer: (limited to [-Math.pow(2,53), Math.pow(2,53)-1] in JS)
            <prefix> + <MSB first byte stream>
            <prefix> in range [13,27] depending on sign & magnitude
            

    Terminator <0x00> in strings ensures that child keys sort directly after parent

*/

@ = require('sjs:std');

//----------------------------------------------------------------------
// Key encoding

// Heavily copied from the FoundationDB Node.js API, which has the
// following copyright notice:

/*
 * FoundationDB Node.js API
 * Copyright (c) 2012 FoundationDB, LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

__js {

  // sizeLimits[n] = number of bytes needed to store integer <= sizeLimits[n],
  // as per the encoding below
  var sizeLimits =
    [ 0,
      255,
      65535,
      16777215,
      4294967295,
      1099511627775,
      281474976710655,
      72057594037927940 ];

  // bounds for precisely representable integers in js:
  var maxInt = 9007199254740991; // = Math.pow(2,53)-1
  var minInt = -9007199254740992; // = -Math.pow(2,53)

  function findNullBytes(buf, pos, searchForTerminators) {
    var nullBytes = [];

    var found;
    for(pos; pos < buf.length; ++pos) {
      if(searchForTerminators && found && buf[pos] !== 0xff) {
        break;
      }

      found = false;
      if(buf[pos] === 0x00) {
        found = true;
        nullBytes.push(pos);
      }
    }

    if(!found && searchForTerminators) {
      nullBytes.push(buf.length);
    }

    return nullBytes;
  }

  var makeEncodingBuffer, encodeString, decodeString, copy, concat;
  if (@sys.hostenv === 'nodejs') {
    makeEncodingBuffer = Buffer.allocUnsafe;
    encodeString = str -> Buffer.from(str, 'utf8');
    decodeString = (buf, start, end) -> buf.toString('utf8', start, end);
    copy = function (from, to, to_start, from_start, from_end) {
      return from.copy(to, to_start, from_start, from_end);
    };
    concat = Buffer.concat;
  }
  else { // xbrowser or otherwise
    var UTF8Encoder = new TextEncoder();
    var UTF8Decoder = new TextDecoder();
    makeEncodingBuffer = n -> new Uint8Array(n);
    encodeString = str -> UTF8Encoder.encode(str);
    decodeString = function(buf, start, end) {
      if (start !== 0 || end !== buf.length)
        buf = buf.slice(start, end);
      return UTF8Decoder.decode(buf);
    };
    copy = function (from, to, to_start, from_start, from_end) {
      return to.set(from.subarray(from_start, from_end), to_start);
    };
    concat =  function(outer, len) {
      var output = new Uint8Array(len);
      var offset = 0;
      for (var i=0; i<outer.length; ++i) {
        output.set(outer[i], offset);
        offset += outer[i].length;
      }
      return output;
    }
  }
  
  function single(x) {
    var out = makeEncodingBuffer(1);
    out[0] = x;
    return out;
  }

  var Byte00 = single(0x00);
  var ByteFF = single(0xFF);

  function encode(item) {
    var encodedString;
    if(typeof item === 'undefined')
      throw new TypeError('Key component cannot be undefined');

    else if(item === null)
      return Byte00;

    //byte string or unicode
    // TODO better isArrayLike test
    else if(typeof item === 'string' || @isArrayLike(item)) {
      var unicode = typeof item === 'string';

      if (unicode) {
        item = encodeString(item);
      }

      var nullBytes = findNullBytes(item, 0);

      encodedString = makeEncodingBuffer(2 + item.length + nullBytes.length);
      encodedString[0] = unicode ? 2 : 1;

      var srcPos = 0;
      var targetPos = 1;
      for(var i = 0; i < nullBytes.length; ++i) {
        copy(item, encodedString, targetPos, srcPos, nullBytes[i] + 1);
        targetPos += nullBytes[i] + 1 - srcPos;
        srcPos = nullBytes[i] + 1;
        encodedString[targetPos++] = 0xff;
      }

      copy(item, encodedString, targetPos, srcPos, item.length);
      encodedString[encodedString.length - 1] = 0x00;

      return encodedString;
    }

    //64-bit integer
    else if(item % 1 === 0) {
      var negative = item < 0;
      var posItem = Math.abs(item);

      var length = 0;
      for(; length < sizeLimits.length; ++length) {
        if(posItem <= sizeLimits[length])
          break;
      }

      if(item > maxInt || item < minInt)
        throw new RangeError('Cannot pack signed integer larger than 54 bits');

      var prefix = negative ? 20 - length : 20 + length;

      var outBuf = makeEncodingBuffer(length+1);
      outBuf[0] = prefix;
      for(var byteIdx = length-1; byteIdx >= 0; --byteIdx) {
        var b = posItem & 0xff;
        if(negative)
          outBuf[byteIdx+1] = ~b;
        else {
          outBuf[byteIdx+1] = b;
        }

        posItem = (posItem - b) / 0x100;
      }

      return outBuf;
    }

    else
      throw new TypeError("Invalid key component of type '#{typeof(item)}'. Key components must either be a string, a buffer, an integer, or null");
  }

  /**
     @function encodeKey
     @summary XXX write me
   */
  function encodeKey(arr) {
    var totalLength = 0;
    if (arr.length === 0) throw new TypeError('Key cannot be empty');
    var outArr = new Array(arr.length);
    for (var i = 0; i < arr.length; ++i) {
      outArr[i] = encode(arr[i]);
      totalLength += outArr[i].length;
    }

    return concat(outArr, totalLength);
  }
  exports.encodeKey = encodeKey;

  function decodeNumber(buf, offset, bytes) {
    var negative = bytes < 0;
    bytes = Math.abs(bytes);

    var num = 0;
    var mult = 1;
    var odd;
    for(var i = bytes-1; i >= 0; --i) {
      var b = buf[offset+i];
      if(negative)
        b = -(~b & 0xff);

      if(i == bytes-1)
        odd = b & 0x01;

      num += b * mult;
      mult *= 0x100;
    }

    if(num > maxInt || num < minInt || (num === minInt && odd))
      throw new RangeError('Cannot unpack signed integers larger than 54 bits');

    return num;
  }

  function decode(buf, pos) {
    var code = buf[pos];
    var value;

    if(code === 0) {
      value = null;
      pos++;
    }
    else if(code === 1 || code === 2) {
      var nullBytes = findNullBytes(buf, pos+1, true);

      var start = pos+1;
      var end = nullBytes[nullBytes.length-1];

      if(code === 2 && nullBytes.length === 1) {
        value = decodeString(buf, start, end);
      }
      else {
        value = makeEncodingBuffer(end-start-(nullBytes.length-1));
        var valuePos = 0;

        for(var i=0; i < nullBytes.length && start < end; ++i) {
          copy(buf, value, valuePos, start, nullBytes[i]);
          valuePos += nullBytes[i] - start;
          start = nullBytes[i] + 2;
          if(start <= end) {
            value[valuePos++] = 0x00;
          }
        }

        if(code === 2) {
          value = decodeString(value, 0, value.length);
        }
      }

      pos = end + 1;
    }
    else if(Math.abs(code-20) <= 7) {
      if(code === 20)
        value = 0;
      else
        value = decodeNumber(buf, pos+1, code-20);

      pos += Math.abs(20-code) + 1;
    }
    else if(Math.abs(code-20) <= 8)
      throw new RangeError('Cannot unpack signed integers larger than 54 bits');
    else
      throw new TypeError('Unknown data type in DB: ' + buf + ' at ' + pos);

    return { pos: pos, value: value };
  }

  /**
     @function decodeKey
     @summary XXX write me
   */
  function decodeKey(key) {
    var res = { pos: 0 };
    var arr = [];

    while(res.pos < key.length) {
      res = decode(key, res.pos);
      arr.push(res.value);
    }

    return arr;
  }
  exports.decodeKey = decodeKey;


  // helper for encodeKeyRange:
  function encodeEndKey(key) {
    if (key.length === 1) {
      return ByteFF;
    }
    else {
      var packed = encodeKey(key.slice(0,key.length-1));
      return concat([packed, ByteFF], packed.length + 1);
    }
  }

  /**
     @function encodeKeyRange
     @summary XXX write me
   */
  function encodeKeyRange(arr) {
    // TODO code duplication with util.transformKeyRange
    if (typeof arr === 'object' && !Array.isArray(arr)) {
      if (arr.begin) {
        // [begin,end[
        return {
          begin: encodeKey(arr.begin),
          end: (arr.end !== undefined ? encodeKey(arr.end) : encodeEndKey(arr.begin)/*ByteFF*/)
        };
      }
      else if (arr.after) {
        // after
        var packed = encodeKey(arr.after);
        return {
          begin: concat([packed, ByteFF], packed.length + 1),
          end: encodeEndKey(arr.after)
        };
      }
      else if (arr.branch) {
        // branch
        var packed = encodeKey(arr.branch);
        return {
          begin: packed,
          end: concat([packed, ByteFF], packed.length + 1)
        };
      }
      else throw new Error("Invalid Key Range");
    }
    else if (arr.length === 0) {
      // RANGE_ALL
      return {
        begin: Byte00,
        end: ByteFF
      };
    }
    else {
      // children:
      var packed = encodeKey(arr);
      return {
        // TODO a specialized push function can be faster than this
        begin: concat([packed, Byte00], packed.length + 1),
        end: concat([packed, ByteFF], packed.length + 1)
      };
    }
  }
  exports.encodeKeyRange = encodeKeyRange;

  /**
     @function encodedKeyEquals
     @summary XXX write me
   */
  function encodedKeyEquals(k1,k2) {
    if (k1.length != k2.length) return false;
    for (var i=0; i<k1.length; ++i)
      if (k1[i] !== k2[i]) return false;
    return true;
  }
  exports.encodedKeyEquals = encodedKeyEquals;

  /**
     @function encodedKeyCompare
     @summary Returns -1 if k1 < k2, +1, if k1 > k2, 0 otherwise
   */
  function encodedKeyCompare(k1,k2) {
    var min_l = Math.min(k1.length, k2.length);

    for (var i=0;i<min_l;++i) {
      var diff = k1[i]-k2[i];
      if (diff > 0) return 1;
      if (diff < 0) return -1;
    }
    var diff = k1.length - k2.length;
    if (diff > 0) return 1;
    if (diff < 0) return -1;
    return 0;
  }
  exports.encodedKeyCompare = encodedKeyCompare;

  /**
     @function encodedKeyLess
     @summary XXX write me
   */
  function encodedKeyLess(k1,k2) {
    return encodedKeyCompare(k1,k2) < 0;
  }
  exports.encodedKeyLess = encodedKeyLess;

  /**
     @function encodedKeyGtEq
     @summary XXX write me
   */
  function encodedKeyGtEq(k1,k2) {
    return encodedKeyCompare(k1,k2) >= 0;
  }
  exports.encodedKeyGtEq = encodedKeyGtEq;

  /**
     @function encodedKeyGreater
     @summary XXX write me
   */
  function encodedKeyGreater(k1,k2) {
    return encodedKeyCompare(k1,k2) > 0;
  }
  exports.encodedKeyGreater = encodedKeyGreater;

  /**
     @function encodedKeyInRange
     @summary XXX write me
  */
  function encodedKeyInRange(key, begin, end) {
    if (encodedKeyCompare(key, begin) >= 0 &&
        (end === undefined ||
         encodedKeyCompare(key, end) < 0))
      return true;
    return false;
  }
  exports.encodedKeyInRange = encodedKeyInRange;
} /* __js */
