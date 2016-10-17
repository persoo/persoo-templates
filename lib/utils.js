'use strict';

var regExpChars = /[|\\{}()[\]^$+*?.]/g;
var _ENCODE_HTML_RULES = {
          '&': '&amp;'
        , '<': '&lt;'
        , '>': '&gt;'
        , '"': '&#34;'
        , "'": '&#39;'
    };
var _MATCH_HTML = /[&<>\'"]/g;

/**
 * Stringified version of constants used by {@link module:utils.escapeXML}.
 *
 * It is used in the process of generating {@link ClientFunction}s.
 *
 * @readonly
 * @type {String}
 */
var escapeFuncStr =
  'var _ENCODE_HTML_RULES = {\n'
+ '      "&": "&amp;"\n'
+ '    , "<": "&lt;"\n'
+ '    , ">": "&gt;"\n'
+ '    , \'"\': "&#34;"\n'
+ '    , "\'": "&#39;"\n'
+ '    };\n'
+ 'var _MATCH_HTML = /[&<>\'"]/g;\n'
+ 'function encode_char(c) {\n'
+ '  return _ENCODE_HTML_RULES[c] || c;\n'
+ '};\n';

function encode_char(c) {
    return _ENCODE_HTML_RULES[c] || c;
};

/**
 * Escape characters reserved in XML.
 *
 * If `markup` is `undefined` or `null`, the empty string is returned.
 *
 * @implements {EscapeCallback}
 * @param {String} markup Input string
 * @return {String} Escaped string
 * @static
 * @private
 */
function escapeXML(markup) {
  return markup == undefined
    ? ''
    : String(markup)
        .replace(_MATCH_HTML, encode_char);
}
escapeXML.toString = function () {
  return Function.prototype.toString.call(this) + ';\n' + escapeFuncStr
};

module.exports = {
    encode_char: encode_char,
    escapeXML: escapeXML,

    /**
     * Escape characters reserved in regular expressions.
     *
     * If `string` is `undefined` or `null`, the empty string is returned.
     *
     * @param {String} string Input string
     * @return {String} Escaped string
     * @static
     * @private
     */
    escapeRegExpChars: function (string) {
      // istanbul ignore if
      if (!string) {
        return '';
      }
      return String(string).replace(regExpChars, '\\$&');
    },

    /**
     * Copy all properties from one object to another, in a shallow fashion.
     *
     * @param  {Object} to   Destination object
     * @param  {Object} from Source object
     * @return {Object}      Destination object
     * @static
     * @private
     */
    shallowCopy: function (to, from) {
      from = from || {};
      for (var p in from) {
        to[p] = from[p];
      }
      return to;
    },

    /**
     * Simple in-process cache implementation. Does not implement limits of any
     * sort.
     *
     * @implements Cache
     * @static
     * @private
     */
    cache :{
      _data: {},
      set: function (key, val) {
        this._data[key] = val;
      },
      get: function (key) {
        return this._data[key];
      },
      reset: function () {
        this._data = {};
      }
    }
};
