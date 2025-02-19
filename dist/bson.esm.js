import buffer from 'buffer';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var require$$0 = {};

// shim for using process in browser

var performance = global.performance || {};

performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function () {
  return new Date().getTime();
}; // generate timestamp or delta

var inherits;

if (typeof Object.create === 'function') {
  inherits = function inherits(ctor, superCtor) {
    // implementation from standard node.js 'util' module
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  inherits = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;

    var TempCtor = function TempCtor() {};

    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };
}

var inherits$1 = inherits;

// Copyright Joyent, Inc. and other Node contributors.
var formatRegExp = /%[sdj%]/g;
function format(f) {
  if (!isString(f)) {
    var objects = [];

    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }

    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function (x) {
    if (x === '%%') return '%';
    if (i >= len) return x;

    switch (x) {
      case '%s':
        return String(args[i++]);

      case '%d':
        return Number(args[i++]);

      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }

      default:
        return x;
    }
  });

  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }

  return str;
}
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.

function deprecate(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function () {
      return deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;

  function deprecated() {
    if (!warned) {
      {
        console.error(msg);
      }

      warned = true;
    }

    return fn.apply(this, arguments);
  }

  return deprecated;
}
var debugs = {};
var debugEnviron;
function debuglog(set) {
  if (isUndefined(debugEnviron)) debugEnviron = '';
  set = set.toUpperCase();

  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = 0;

      debugs[set] = function () {
        var msg = format.apply(null, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function () {};
    }
  }

  return debugs[set];
}
/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */

/* legacy: obj, showHidden, depth, colors*/

function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  }; // legacy...

  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];

  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    _extend(ctx, opts);
  } // set default options


  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
} // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics

inspect.colors = {
  'bold': [1, 22],
  'italic': [3, 23],
  'underline': [4, 24],
  'inverse': [7, 27],
  'white': [37, 39],
  'grey': [90, 39],
  'black': [30, 39],
  'blue': [34, 39],
  'cyan': [36, 39],
  'green': [32, 39],
  'magenta': [35, 39],
  'red': [31, 39],
  'yellow': [33, 39]
}; // Don't use 'blue' not visible on cmd.exe

inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};

function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return "\x1B[" + inspect.colors[style][0] + 'm' + str + "\x1B[" + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}

function stylizeNoColor(str, styleType) {
  return str;
}

function arrayToHash(array) {
  var hash = {};
  array.forEach(function (val, idx) {
    hash[val] = true;
  });
  return hash;
}

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect && value && isFunction(value.inspect) && // Filter out the util module, it's inspect function is special
  value.inspect !== inspect && // Also filter out any prototype objects using the circular check.
  !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);

    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }

    return ret;
  } // Primitive types cannot have properties


  var primitive = formatPrimitive(ctx, value);

  if (primitive) {
    return primitive;
  } // Look up the keys of the object.


  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  } // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx


  if (isError(value) && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  } // Some type of object without properties can be shortcutted.


  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }

    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }

    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }

    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '',
      array = false,
      braces = ['{', '}']; // Make Array say that they are Array

  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  } // Make functions say that they are functions


  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  } // Make RegExps say that they are RegExps


  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  } // Make dates with properties first say the date


  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  } // Make error with message first say the error


  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);
  var output;

  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function (key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();
  return reduceToSingleString(output, base, braces);
}

function formatPrimitive(ctx, value) {
  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');

  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }

  if (isNumber(value)) return ctx.stylize('' + value, 'number');
  if (isBoolean(value)) return ctx.stylize('' + value, 'boolean'); // For some reason typeof null is "object", so special case here.

  if (isNull(value)) return ctx.stylize('null', 'null');
}

function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}

function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];

  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
    } else {
      output.push('');
    }
  }

  keys.forEach(function (key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}

function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || {
    value: value[key]
  };

  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }

  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }

      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function (line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function (line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }

  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }

    name = JSON.stringify('' + key);

    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}

function reduceToSingleString(output, base, braces) {
  var length = output.reduce(function (prev, cur) {
    if (cur.indexOf('\n') >= 0) ;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
} // NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.


function isArray(ar) {
  return Array.isArray(ar);
}
function isBoolean(arg) {
  return typeof arg === 'boolean';
}
function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return arg == null;
}
function isNumber(arg) {
  return typeof arg === 'number';
}
function isString(arg) {
  return typeof arg === 'string';
}
function isSymbol(arg) {
  return babelHelpers["typeof"](arg) === 'symbol';
}
function isUndefined(arg) {
  return arg === void 0;
}
function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
function isObject(arg) {
  return babelHelpers["typeof"](arg) === 'object' && arg !== null;
}
function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
function isError(e) {
  return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
}
function isFunction(arg) {
  return typeof arg === 'function';
}
function isPrimitive(arg) {
  return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || babelHelpers["typeof"](arg) === 'symbol' || // ES6 symbol
  typeof arg === 'undefined';
}
function isBuffer(maybeBuf) {
  return Buffer.isBuffer(maybeBuf);
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; // 26 Feb 16:19:34

function timestamp$1() {
  var d = new Date();
  var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
} // log is just a thin wrapper to console.log that prepends a timestamp


function log() {
  console.log('%s - %s', timestamp$1(), format.apply(null, arguments));
}
function _extend(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;
  var keys = Object.keys(add);
  var i = keys.length;

  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }

  return origin;
}

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var require$$1 = {
  inherits: inherits$1,
  _extend: _extend,
  log: log,
  isBuffer: isBuffer,
  isPrimitive: isPrimitive,
  isFunction: isFunction,
  isError: isError,
  isDate: isDate,
  isObject: isObject,
  isRegExp: isRegExp,
  isUndefined: isUndefined,
  isSymbol: isSymbol,
  isString: isString,
  isNumber: isNumber,
  isNullOrUndefined: isNullOrUndefined,
  isNull: isNull,
  isBoolean: isBoolean,
  isArray: isArray,
  inspect: inspect,
  deprecate: deprecate,
  format: format,
  debuglog: debuglog
};

var utils = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.deprecate = exports.isObjectLike = exports.isDate = exports.haveBuffer = exports.isMap = exports.isRegExp = exports.isBigUInt64Array = exports.isBigInt64Array = exports.isUint8Array = exports.isAnyArrayBuffer = exports.randomBytes = exports.normalizedFunctionString = void 0;

/**
 * Normalizes our expected stringified form of a function across versions of node
 * @param fn - The function to stringify
 */
function normalizedFunctionString(fn) {
    return fn.toString().replace('function(', 'function (');
}
exports.normalizedFunctionString = normalizedFunctionString;
var isReactNative = typeof commonjsGlobal.navigator === 'object' && commonjsGlobal.navigator.product === 'ReactNative';
var insecureWarning = isReactNative
    ? 'BSON: For React Native please polyfill crypto.getRandomValues, e.g. using: https://www.npmjs.com/package/react-native-get-random-values.'
    : 'BSON: No cryptographic implementation for random bytes present, falling back to a less secure implementation.';
var insecureRandomBytes = function insecureRandomBytes(size) {
    console.warn(insecureWarning);
    var result = buffer.Buffer.alloc(size);
    for (var i = 0; i < size; ++i)
        result[i] = Math.floor(Math.random() * 256);
    return result;
};
var detectRandomBytes = function () {
    if (typeof window !== 'undefined') {
        // browser crypto implementation(s)
        var target_1 = window.crypto || window.msCrypto; // allow for IE11
        if (target_1 && target_1.getRandomValues) {
            return function (size) { return target_1.getRandomValues(buffer.Buffer.alloc(size)); };
        }
    }
    if (typeof commonjsGlobal !== 'undefined' && commonjsGlobal.crypto && commonjsGlobal.crypto.getRandomValues) {
        // allow for RN packages such as https://www.npmjs.com/package/react-native-get-random-values to populate global
        return function (size) { return commonjsGlobal.crypto.getRandomValues(buffer.Buffer.alloc(size)); };
    }
    var requiredRandomBytes;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        requiredRandomBytes = require$$0.randomBytes;
    }
    catch (e) {
        // keep the fallback
    }
    // NOTE: in transpiled cases the above require might return null/undefined
    return requiredRandomBytes || insecureRandomBytes;
};
exports.randomBytes = detectRandomBytes();
function isAnyArrayBuffer(value) {
    return ['[object ArrayBuffer]', '[object SharedArrayBuffer]'].includes(Object.prototype.toString.call(value));
}
exports.isAnyArrayBuffer = isAnyArrayBuffer;
function isUint8Array(value) {
    return Object.prototype.toString.call(value) === '[object Uint8Array]';
}
exports.isUint8Array = isUint8Array;
function isBigInt64Array(value) {
    return Object.prototype.toString.call(value) === '[object BigInt64Array]';
}
exports.isBigInt64Array = isBigInt64Array;
function isBigUInt64Array(value) {
    return Object.prototype.toString.call(value) === '[object BigUint64Array]';
}
exports.isBigUInt64Array = isBigUInt64Array;
function isRegExp(d) {
    return Object.prototype.toString.call(d) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
function isMap(d) {
    return Object.prototype.toString.call(d) === '[object Map]';
}
exports.isMap = isMap;
/** Call to check if your environment has `Buffer` */
function haveBuffer() {
    return typeof commonjsGlobal !== 'undefined' && typeof commonjsGlobal.Buffer !== 'undefined';
}
exports.haveBuffer = haveBuffer;
// To ensure that 0.4 of node works correctly
function isDate(d) {
    return isObjectLike(d) && Object.prototype.toString.call(d) === '[object Date]';
}
exports.isDate = isDate;
/**
 * @internal
 * this is to solve the `'someKey' in x` problem where x is unknown.
 * https://github.com/typescript-eslint/typescript-eslint/issues/1071#issuecomment-541955753
 */
function isObjectLike(candidate) {
    return typeof candidate === 'object' && candidate !== null;
}
exports.isObjectLike = isObjectLike;
function deprecate(fn, message) {
    if (typeof window === 'undefined' && typeof self === 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require$$1.deprecate(fn, message);
    }
    var warned = false;
    function deprecated() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!warned) {
            console.warn(message);
            warned = true;
        }
        return fn.apply(this, args);
    }
    return deprecated;
}
exports.deprecate = deprecate;

});

unwrapExports(utils);
utils.deprecate;
utils.isObjectLike;
utils.isDate;
utils.haveBuffer;
utils.isMap;
utils.isRegExp;
utils.isBigUInt64Array;
utils.isBigInt64Array;
utils.isUint8Array;
utils.isAnyArrayBuffer;
utils.randomBytes;
utils.normalizedFunctionString;

var ensure_buffer = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBuffer = void 0;


/**
 * Makes sure that, if a Uint8Array is passed in, it is wrapped in a Buffer.
 *
 * @param potentialBuffer - The potential buffer
 * @returns Buffer the input if potentialBuffer is a buffer, or a buffer that
 * wraps a passed in Uint8Array
 * @throws TypeError If anything other than a Buffer or Uint8Array is passed in
 */
function ensureBuffer(potentialBuffer) {
    if (ArrayBuffer.isView(potentialBuffer)) {
        return buffer.Buffer.from(potentialBuffer.buffer, potentialBuffer.byteOffset, potentialBuffer.byteLength);
    }
    if (utils.isAnyArrayBuffer(potentialBuffer)) {
        return buffer.Buffer.from(potentialBuffer);
    }
    throw new TypeError('Must use either Buffer or TypedArray');
}
exports.ensureBuffer = ensureBuffer;

});

unwrapExports(ensure_buffer);
ensure_buffer.ensureBuffer;

var uuid_utils = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferToUuidHexString = exports.uuidHexStringToBuffer = exports.uuidValidateString = void 0;

// Validation regex for v4 uuid (validates with or without dashes)
var VALIDATION_REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15})$/i;
var uuidValidateString = function (str) {
    return typeof str === 'string' && VALIDATION_REGEX.test(str);
};
exports.uuidValidateString = uuidValidateString;
var uuidHexStringToBuffer = function (hexString) {
    if (!exports.uuidValidateString(hexString)) {
        throw new TypeError('UUID string representations must be a 32 or 36 character hex string (dashes excluded/included). Format: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" or "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".');
    }
    var sanitizedHexString = hexString.replace(/-/g, '');
    return buffer.Buffer.from(sanitizedHexString, 'hex');
};
exports.uuidHexStringToBuffer = uuidHexStringToBuffer;
var bufferToUuidHexString = function (buffer, includeDashes) {
    if (includeDashes === void 0) { includeDashes = true; }
    return includeDashes
        ? buffer.toString('hex', 0, 4) +
            '-' +
            buffer.toString('hex', 4, 6) +
            '-' +
            buffer.toString('hex', 6, 8) +
            '-' +
            buffer.toString('hex', 8, 10) +
            '-' +
            buffer.toString('hex', 10, 16)
        : buffer.toString('hex');
};
exports.bufferToUuidHexString = bufferToUuidHexString;

});

unwrapExports(uuid_utils);
uuid_utils.bufferToUuidHexString;
uuid_utils.uuidHexStringToBuffer;
uuid_utils.uuidValidateString;

var uuid = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUID = void 0;





var BYTE_LENGTH = 16;
var kId = Symbol('id');
/**
 * A class representation of the BSON UUID type.
 * @public
 */
var UUID = /** @class */ (function () {
    /**
     * Create an UUID type
     *
     * @param input - Can be a 32 or 36 character hex string (dashes excluded/included) or a 16 byte binary Buffer.
     */
    function UUID(input) {
        if (typeof input === 'undefined') {
            // The most common use case (blank id, new UUID() instance)
            this.id = UUID.generate();
        }
        else if (input instanceof UUID) {
            this[kId] = buffer.Buffer.from(input.id);
            this.__id = input.__id;
        }
        else if (ArrayBuffer.isView(input) && input.byteLength === BYTE_LENGTH) {
            this.id = ensure_buffer.ensureBuffer(input);
        }
        else if (typeof input === 'string') {
            this.id = uuid_utils.uuidHexStringToBuffer(input);
        }
        else {
            throw new TypeError('Argument passed in UUID constructor must be a UUID, a 16 byte Buffer or a 32/36 character hex string (dashes excluded/included, format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).');
        }
    }
    Object.defineProperty(UUID.prototype, "id", {
        /**
         * The UUID bytes
         * @readonly
         */
        get: function () {
            return this[kId];
        },
        set: function (value) {
            this[kId] = value;
            if (UUID.cacheHexString) {
                this.__id = uuid_utils.bufferToUuidHexString(value);
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Generate a 16 byte uuid v4 buffer used in UUIDs
     */
    /**
     * Returns the UUID id as a 32 or 36 character hex string representation, excluding/including dashes (defaults to 36 character dash separated)
     * @param includeDashes - should the string exclude dash-separators.
     * */
    UUID.prototype.toHexString = function (includeDashes) {
        if (includeDashes === void 0) { includeDashes = true; }
        if (UUID.cacheHexString && this.__id) {
            return this.__id;
        }
        var uuidHexString = uuid_utils.bufferToUuidHexString(this.id, includeDashes);
        if (UUID.cacheHexString) {
            this.__id = uuidHexString;
        }
        return uuidHexString;
    };
    /**
     * Converts the id into a 36 character (dashes included) hex string, unless a encoding is specified.
     * @internal
     */
    UUID.prototype.toString = function (encoding) {
        return encoding ? this.id.toString(encoding) : this.toHexString();
    };
    /**
     * Converts the id into its JSON string representation. A 36 character (dashes included) hex string in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
     * @internal
     */
    UUID.prototype.toJSON = function () {
        return this.toHexString();
    };
    /**
     * Compares the equality of this UUID with `otherID`.
     *
     * @param otherId - UUID instance to compare against.
     */
    UUID.prototype.equals = function (otherId) {
        if (!otherId) {
            return false;
        }
        if (otherId instanceof UUID) {
            return otherId.id.equals(this.id);
        }
        try {
            return new UUID(otherId).id.equals(this.id);
        }
        catch (_a) {
            return false;
        }
    };
    /**
     * Creates a Binary instance from the current UUID.
     */
    UUID.prototype.toBinary = function () {
        return new binary.Binary(this.id, binary.Binary.SUBTYPE_UUID);
    };
    /**
     * Generates a populated buffer containing a v4 uuid
     */
    UUID.generate = function () {
        var bytes = utils.randomBytes(BYTE_LENGTH);
        // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
        // Kindly borrowed from https://github.com/uuidjs/uuid/blob/master/src/v4.js
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        return buffer.Buffer.from(bytes);
    };
    /**
     * Checks if a value is a valid bson UUID
     * @param input - UUID, string or Buffer to validate.
     */
    UUID.isValid = function (input) {
        if (!input) {
            return false;
        }
        if (input instanceof UUID) {
            return true;
        }
        if (typeof input === 'string') {
            return uuid_utils.uuidValidateString(input);
        }
        if (utils.isUint8Array(input)) {
            // check for length & uuid version (https://tools.ietf.org/html/rfc4122#section-4.1.3)
            if (input.length !== BYTE_LENGTH) {
                return false;
            }
            try {
                // get this byte as hex:             xxxxxxxx-xxxx-XXxx-xxxx-xxxxxxxxxxxx
                // check first part as uuid version: xxxxxxxx-xxxx-Xxxx-xxxx-xxxxxxxxxxxx
                return parseInt(input[6].toString(16)[0], 10) === binary.Binary.SUBTYPE_UUID;
            }
            catch (_a) {
                return false;
            }
        }
        return false;
    };
    /**
     * Creates an UUID from a hex string representation of an UUID.
     * @param hexString - 32 or 36 character hex string (dashes excluded/included).
     */
    UUID.createFromHexString = function (hexString) {
        var buffer = uuid_utils.uuidHexStringToBuffer(hexString);
        return new UUID(buffer);
    };
    /**
     * Converts to a string representation of this Id.
     *
     * @returns return the 36 character hex string representation.
     * @internal
     */
    UUID.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    UUID.prototype.inspect = function () {
        return "new UUID(\"" + this.toHexString() + "\")";
    };
    return UUID;
}());
exports.UUID = UUID;
Object.defineProperty(UUID.prototype, '_bsontype', { value: 'UUID' });

});

unwrapExports(uuid);
uuid.UUID;

var binary = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Binary = void 0;




/**
 * A class representation of the BSON Binary type.
 * @public
 */
var Binary = /** @class */ (function () {
    /**
     * @param buffer - a buffer object containing the binary data.
     * @param subType - the option binary type.
     */
    function Binary(buffer$1, subType) {
        if (!(this instanceof Binary))
            return new Binary(buffer$1, subType);
        if (!(buffer$1 == null) &&
            !(typeof buffer$1 === 'string') &&
            !ArrayBuffer.isView(buffer$1) &&
            !(buffer$1 instanceof ArrayBuffer) &&
            !Array.isArray(buffer$1)) {
            throw new TypeError('Binary can only be constructed from string, Buffer, TypedArray, or Array<number>');
        }
        this.sub_type = subType !== null && subType !== void 0 ? subType : Binary.BSON_BINARY_SUBTYPE_DEFAULT;
        if (buffer$1 == null) {
            // create an empty binary buffer
            this.buffer = buffer.Buffer.alloc(Binary.BUFFER_SIZE);
            this.position = 0;
        }
        else {
            if (typeof buffer$1 === 'string') {
                // string
                this.buffer = buffer.Buffer.from(buffer$1, 'binary');
            }
            else if (Array.isArray(buffer$1)) {
                // number[]
                this.buffer = buffer.Buffer.from(buffer$1);
            }
            else {
                // Buffer | TypedArray | ArrayBuffer
                this.buffer = ensure_buffer.ensureBuffer(buffer$1);
            }
            this.position = this.buffer.byteLength;
        }
    }
    /**
     * Updates this binary with byte_value.
     *
     * @param byteValue - a single byte we wish to write.
     */
    Binary.prototype.put = function (byteValue) {
        // If it's a string and a has more than one character throw an error
        if (typeof byteValue === 'string' && byteValue.length !== 1) {
            throw new TypeError('only accepts single character String');
        }
        else if (typeof byteValue !== 'number' && byteValue.length !== 1)
            throw new TypeError('only accepts single character Uint8Array or Array');
        // Decode the byte value once
        var decodedByte;
        if (typeof byteValue === 'string') {
            decodedByte = byteValue.charCodeAt(0);
        }
        else if (typeof byteValue === 'number') {
            decodedByte = byteValue;
        }
        else {
            decodedByte = byteValue[0];
        }
        if (decodedByte < 0 || decodedByte > 255) {
            throw new TypeError('only accepts number in a valid unsigned byte range 0-255');
        }
        if (this.buffer.length > this.position) {
            this.buffer[this.position++] = decodedByte;
        }
        else {
            var buffer$1 = buffer.Buffer.alloc(Binary.BUFFER_SIZE + this.buffer.length);
            // Combine the two buffers together
            this.buffer.copy(buffer$1, 0, 0, this.buffer.length);
            this.buffer = buffer$1;
            this.buffer[this.position++] = decodedByte;
        }
    };
    /**
     * Writes a buffer or string to the binary.
     *
     * @param sequence - a string or buffer to be written to the Binary BSON object.
     * @param offset - specify the binary of where to write the content.
     */
    Binary.prototype.write = function (sequence, offset) {
        offset = typeof offset === 'number' ? offset : this.position;
        // If the buffer is to small let's extend the buffer
        if (this.buffer.length < offset + sequence.length) {
            var buffer$1 = buffer.Buffer.alloc(this.buffer.length + sequence.length);
            this.buffer.copy(buffer$1, 0, 0, this.buffer.length);
            // Assign the new buffer
            this.buffer = buffer$1;
        }
        if (ArrayBuffer.isView(sequence)) {
            this.buffer.set(ensure_buffer.ensureBuffer(sequence), offset);
            this.position =
                offset + sequence.byteLength > this.position ? offset + sequence.length : this.position;
        }
        else if (typeof sequence === 'string') {
            this.buffer.write(sequence, offset, sequence.length, 'binary');
            this.position =
                offset + sequence.length > this.position ? offset + sequence.length : this.position;
        }
    };
    /**
     * Reads **length** bytes starting at **position**.
     *
     * @param position - read from the given position in the Binary.
     * @param length - the number of bytes to read.
     */
    Binary.prototype.read = function (position, length) {
        length = length && length > 0 ? length : this.position;
        // Let's return the data based on the type we have
        return this.buffer.slice(position, position + length);
    };
    /**
     * Returns the value of this binary as a string.
     * @param asRaw - Will skip converting to a string
     * @remarks
     * This is handy when calling this function conditionally for some key value pairs and not others
     */
    Binary.prototype.value = function (asRaw) {
        asRaw = !!asRaw;
        // Optimize to serialize for the situation where the data == size of buffer
        if (asRaw && this.buffer.length === this.position) {
            return this.buffer;
        }
        // If it's a node.js buffer object
        if (asRaw) {
            return this.buffer.slice(0, this.position);
        }
        return this.buffer.toString('binary', 0, this.position);
    };
    /** the length of the binary sequence */
    Binary.prototype.length = function () {
        return this.position;
    };
    /** @internal */
    Binary.prototype.toJSON = function () {
        return this.buffer.toString('base64');
    };
    /** @internal */
    Binary.prototype.toString = function (format) {
        return this.buffer.toString(format);
    };
    /** @internal */
    Binary.prototype.toExtendedJSON = function (options) {
        options = options || {};
        var base64String = this.buffer.toString('base64');
        var subType = Number(this.sub_type).toString(16);
        if (options.legacy) {
            return {
                $binary: base64String,
                $type: subType.length === 1 ? '0' + subType : subType
            };
        }
        return {
            $binary: {
                base64: base64String,
                subType: subType.length === 1 ? '0' + subType : subType
            }
        };
    };
    /** @internal */
    Binary.prototype.toUUID = function () {
        if (this.sub_type === Binary.SUBTYPE_UUID) {
            return new uuid.UUID(this.buffer.slice(0, this.position));
        }
        throw new Error("Binary sub_type \"" + this.sub_type + "\" is not supported for converting to UUID. Only \"" + Binary.SUBTYPE_UUID + "\" is currently supported.");
    };
    /** @internal */
    Binary.fromExtendedJSON = function (doc, options) {
        options = options || {};
        var data;
        var type;
        if ('$binary' in doc) {
            if (options.legacy && typeof doc.$binary === 'string' && '$type' in doc) {
                type = doc.$type ? parseInt(doc.$type, 16) : 0;
                data = buffer.Buffer.from(doc.$binary, 'base64');
            }
            else {
                if (typeof doc.$binary !== 'string') {
                    type = doc.$binary.subType ? parseInt(doc.$binary.subType, 16) : 0;
                    data = buffer.Buffer.from(doc.$binary.base64, 'base64');
                }
            }
        }
        else if ('$uuid' in doc) {
            type = 4;
            data = uuid_utils.uuidHexStringToBuffer(doc.$uuid);
        }
        if (!data) {
            throw new TypeError("Unexpected Binary Extended JSON format " + JSON.stringify(doc));
        }
        return new Binary(data, type);
    };
    /** @internal */
    Binary.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    Binary.prototype.inspect = function () {
        var asBuffer = this.value(true);
        return "new Binary(Buffer.from(\"" + asBuffer.toString('hex') + "\", \"hex\"), " + this.sub_type + ")";
    };
    /**
     * Binary default subtype
     * @internal
     */
    Binary.BSON_BINARY_SUBTYPE_DEFAULT = 0;
    /** Initial buffer default size */
    Binary.BUFFER_SIZE = 256;
    /** Default BSON type */
    Binary.SUBTYPE_DEFAULT = 0;
    /** Function BSON type */
    Binary.SUBTYPE_FUNCTION = 1;
    /** Byte Array BSON type */
    Binary.SUBTYPE_BYTE_ARRAY = 2;
    /** Deprecated UUID BSON type @deprecated Please use SUBTYPE_UUID */
    Binary.SUBTYPE_UUID_OLD = 3;
    /** UUID BSON type */
    Binary.SUBTYPE_UUID = 4;
    /** MD5 BSON type */
    Binary.SUBTYPE_MD5 = 5;
    /** User BSON type */
    Binary.SUBTYPE_USER_DEFINED = 128;
    return Binary;
}());
exports.Binary = Binary;
Object.defineProperty(Binary.prototype, '_bsontype', { value: 'Binary' });

});

unwrapExports(binary);
binary.Binary;

var code = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Code = void 0;
/**
 * A class representation of the BSON Code type.
 * @public
 */
var Code = /** @class */ (function () {
    /**
     * @param code - a string or function.
     * @param scope - an optional scope for the function.
     */
    function Code(code, scope) {
        if (!(this instanceof Code))
            return new Code(code, scope);
        this.code = code;
        this.scope = scope;
    }
    /** @internal */
    Code.prototype.toJSON = function () {
        return { code: this.code, scope: this.scope };
    };
    /** @internal */
    Code.prototype.toExtendedJSON = function () {
        if (this.scope) {
            return { $code: this.code, $scope: this.scope };
        }
        return { $code: this.code };
    };
    /** @internal */
    Code.fromExtendedJSON = function (doc) {
        return new Code(doc.$code, doc.$scope);
    };
    /** @internal */
    Code.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    Code.prototype.inspect = function () {
        var codeJson = this.toJSON();
        return "new Code(\"" + codeJson.code + "\"" + (codeJson.scope ? ", " + JSON.stringify(codeJson.scope) : '') + ")";
    };
    return Code;
}());
exports.Code = Code;
Object.defineProperty(Code.prototype, '_bsontype', { value: 'Code' });

});

unwrapExports(code);
code.Code;

var db_ref = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBRef = exports.isDBRefLike = void 0;

/** @internal */
function isDBRefLike(value) {
    return utils.isObjectLike(value) && value['$id'] != null && value['$ref'] != null;
}
exports.isDBRefLike = isDBRefLike;
/**
 * A class representation of the BSON DBRef type.
 * @public
 */
var DBRef = /** @class */ (function () {
    /**
     * @param collection - the collection name.
     * @param oid - the reference ObjectId.
     * @param db - optional db name, if omitted the reference is local to the current db.
     */
    function DBRef(collection, oid, db, fields) {
        if (!(this instanceof DBRef))
            return new DBRef(collection, oid, db, fields);
        // check if namespace has been provided
        var parts = collection.split('.');
        if (parts.length === 2) {
            db = parts.shift();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            collection = parts.shift();
        }
        this.collection = collection;
        this.oid = oid;
        this.db = db;
        this.fields = fields || {};
    }
    Object.defineProperty(DBRef.prototype, "namespace", {
        // Property provided for compatibility with the 1.x parser
        // the 1.x parser used a "namespace" property, while 4.x uses "collection"
        /** @internal */
        get: function () {
            return this.collection;
        },
        set: function (value) {
            this.collection = value;
        },
        enumerable: false,
        configurable: true
    });
    /** @internal */
    DBRef.prototype.toJSON = function () {
        var o = Object.assign({
            $ref: this.collection,
            $id: this.oid
        }, this.fields);
        if (this.db != null)
            o.$db = this.db;
        return o;
    };
    /** @internal */
    DBRef.prototype.toExtendedJSON = function (options) {
        options = options || {};
        var o = {
            $ref: this.collection,
            $id: this.oid
        };
        if (options.legacy) {
            return o;
        }
        if (this.db)
            o.$db = this.db;
        o = Object.assign(o, this.fields);
        return o;
    };
    /** @internal */
    DBRef.fromExtendedJSON = function (doc) {
        var copy = Object.assign({}, doc);
        delete copy.$ref;
        delete copy.$id;
        delete copy.$db;
        return new DBRef(doc.$ref, doc.$id, doc.$db, copy);
    };
    /** @internal */
    DBRef.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    DBRef.prototype.inspect = function () {
        // NOTE: if OID is an ObjectId class it will just print the oid string.
        var oid = this.oid === undefined || this.oid.toString === undefined ? this.oid : this.oid.toString();
        return "new DBRef(\"" + this.namespace + "\", new ObjectId(\"" + oid + "\")" + (this.db ? ", \"" + this.db + "\"" : '') + ")";
    };
    return DBRef;
}());
exports.DBRef = DBRef;
Object.defineProperty(DBRef.prototype, '_bsontype', { value: 'DBRef' });

});

unwrapExports(db_ref);
db_ref.DBRef;
db_ref.isDBRefLike;

var long_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Long = void 0;

/**
 * wasm optimizations, to do native i64 multiplication and divide
 */
var wasm = undefined;
try {
    wasm = new WebAssembly.Instance(new WebAssembly.Module(
    // prettier-ignore
    new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11])), {}).exports;
}
catch (_a) {
    // no wasm support
}
var TWO_PWR_16_DBL = 1 << 16;
var TWO_PWR_24_DBL = 1 << 24;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
/** A cache of the Long representations of small integer values. */
var INT_CACHE = {};
/** A cache of the Long representations of small unsigned integer values. */
var UINT_CACHE = {};
/**
 * A class representing a 64-bit integer
 * @public
 * @remarks
 * The internal representation of a long is the two given signed, 32-bit values.
 * We use 32-bit pieces because these are the size of integers on which
 * Javascript performs bit-operations.  For operations like addition and
 * multiplication, we split each number into 16 bit pieces, which can easily be
 * multiplied within Javascript's floating-point representation without overflow
 * or change in sign.
 * In the algorithms below, we frequently reduce the negative case to the
 * positive case by negating the input(s) and then post-processing the result.
 * Note that we must ALWAYS check specially whether those values are MIN_VALUE
 * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
 * a positive number, it overflows back into a negative).  Not handling this
 * case would often result in infinite recursion.
 * Common constant values ZERO, ONE, NEG_ONE, etc. are found as static properties on this class.
 */
var Long = /** @class */ (function () {
    /**
     * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
     *  See the from* functions below for more convenient ways of constructing Longs.
     *
     * Acceptable signatures are:
     * - Long(low, high, unsigned?)
     * - Long(bigint, unsigned?)
     * - Long(string, unsigned?)
     *
     * @param low - The low (signed) 32 bits of the long
     * @param high - The high (signed) 32 bits of the long
     * @param unsigned - Whether unsigned or not, defaults to signed
     */
    function Long(low, high, unsigned) {
        if (low === void 0) { low = 0; }
        if (!(this instanceof Long))
            return new Long(low, high, unsigned);
        if (typeof low === 'bigint') {
            Object.assign(this, Long.fromBigInt(low, !!high));
        }
        else if (typeof low === 'string') {
            Object.assign(this, Long.fromString(low, !!high));
        }
        else {
            this.low = low | 0;
            this.high = high | 0;
            this.unsigned = !!unsigned;
        }
        Object.defineProperty(this, '__isLong__', {
            value: true,
            configurable: false,
            writable: false,
            enumerable: false
        });
    }
    /**
     * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits.
     * Each is assumed to use 32 bits.
     * @param lowBits - The low 32 bits
     * @param highBits - The high 32 bits
     * @param unsigned - Whether unsigned or not, defaults to signed
     * @returns The corresponding Long value
     */
    Long.fromBits = function (lowBits, highBits, unsigned) {
        return new Long(lowBits, highBits, unsigned);
    };
    /**
     * Returns a Long representing the given 32 bit integer value.
     * @param value - The 32 bit integer in question
     * @param unsigned - Whether unsigned or not, defaults to signed
     * @returns The corresponding Long value
     */
    Long.fromInt = function (value, unsigned) {
        var obj, cachedObj, cache;
        if (unsigned) {
            value >>>= 0;
            if ((cache = 0 <= value && value < 256)) {
                cachedObj = UINT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = Long.fromBits(value, (value | 0) < 0 ? -1 : 0, true);
            if (cache)
                UINT_CACHE[value] = obj;
            return obj;
        }
        else {
            value |= 0;
            if ((cache = -128 <= value && value < 128)) {
                cachedObj = INT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = Long.fromBits(value, value < 0 ? -1 : 0, false);
            if (cache)
                INT_CACHE[value] = obj;
            return obj;
        }
    };
    /**
     * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
     * @param value - The number in question
     * @param unsigned - Whether unsigned or not, defaults to signed
     * @returns The corresponding Long value
     */
    Long.fromNumber = function (value, unsigned) {
        if (isNaN(value))
            return unsigned ? Long.UZERO : Long.ZERO;
        if (unsigned) {
            if (value < 0)
                return Long.UZERO;
            if (value >= TWO_PWR_64_DBL)
                return Long.MAX_UNSIGNED_VALUE;
        }
        else {
            if (value <= -TWO_PWR_63_DBL)
                return Long.MIN_VALUE;
            if (value + 1 >= TWO_PWR_63_DBL)
                return Long.MAX_VALUE;
        }
        if (value < 0)
            return Long.fromNumber(-value, unsigned).neg();
        return Long.fromBits(value % TWO_PWR_32_DBL | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
    };
    /**
     * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
     * @param value - The number in question
     * @param unsigned - Whether unsigned or not, defaults to signed
     * @returns The corresponding Long value
     */
    Long.fromBigInt = function (value, unsigned) {
        return Long.fromString(value.toString(), unsigned);
    };
    /**
     * Returns a Long representation of the given string, written using the specified radix.
     * @param str - The textual representation of the Long
     * @param unsigned - Whether unsigned or not, defaults to signed
     * @param radix - The radix in which the text is written (2-36), defaults to 10
     * @returns The corresponding Long value
     */
    Long.fromString = function (str, unsigned, radix) {
        if (str.length === 0)
            throw Error('empty string');
        if (str === 'NaN' || str === 'Infinity' || str === '+Infinity' || str === '-Infinity')
            return Long.ZERO;
        if (typeof unsigned === 'number') {
            // For goog.math.long compatibility
            (radix = unsigned), (unsigned = false);
        }
        else {
            unsigned = !!unsigned;
        }
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw RangeError('radix');
        var p;
        if ((p = str.indexOf('-')) > 0)
            throw Error('interior hyphen');
        else if (p === 0) {
            return Long.fromString(str.substring(1), unsigned, radix).neg();
        }
        // Do several (8) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        var radixToPower = Long.fromNumber(Math.pow(radix, 8));
        var result = Long.ZERO;
        for (var i = 0; i < str.length; i += 8) {
            var size = Math.min(8, str.length - i), value = parseInt(str.substring(i, i + size), radix);
            if (size < 8) {
                var power = Long.fromNumber(Math.pow(radix, size));
                result = result.mul(power).add(Long.fromNumber(value));
            }
            else {
                result = result.mul(radixToPower);
                result = result.add(Long.fromNumber(value));
            }
        }
        result.unsigned = unsigned;
        return result;
    };
    /**
     * Creates a Long from its byte representation.
     * @param bytes - Byte representation
     * @param unsigned - Whether unsigned or not, defaults to signed
     * @param le - Whether little or big endian, defaults to big endian
     * @returns The corresponding Long value
     */
    Long.fromBytes = function (bytes, unsigned, le) {
        return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
    };
    /**
     * Creates a Long from its little endian byte representation.
     * @param bytes - Little endian byte representation
     * @param unsigned - Whether unsigned or not, defaults to signed
     * @returns The corresponding Long value
     */
    Long.fromBytesLE = function (bytes, unsigned) {
        return new Long(bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24), bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24), unsigned);
    };
    /**
     * Creates a Long from its big endian byte representation.
     * @param bytes - Big endian byte representation
     * @param unsigned - Whether unsigned or not, defaults to signed
     * @returns The corresponding Long value
     */
    Long.fromBytesBE = function (bytes, unsigned) {
        return new Long((bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7], (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3], unsigned);
    };
    /**
     * Tests if the specified object is a Long.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    Long.isLong = function (value) {
        return utils.isObjectLike(value) && value['__isLong__'] === true;
    };
    /**
     * Converts the specified value to a Long.
     * @param unsigned - Whether unsigned or not, defaults to signed
     */
    Long.fromValue = function (val, unsigned) {
        if (typeof val === 'number')
            return Long.fromNumber(val, unsigned);
        if (typeof val === 'string')
            return Long.fromString(val, unsigned);
        // Throws for non-objects, converts non-instanceof Long:
        return Long.fromBits(val.low, val.high, typeof unsigned === 'boolean' ? unsigned : val.unsigned);
    };
    /** Returns the sum of this and the specified Long. */
    Long.prototype.add = function (addend) {
        if (!Long.isLong(addend))
            addend = Long.fromValue(addend);
        // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
        var a48 = this.high >>> 16;
        var a32 = this.high & 0xffff;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xffff;
        var b48 = addend.high >>> 16;
        var b32 = addend.high & 0xffff;
        var b16 = addend.low >>> 16;
        var b00 = addend.low & 0xffff;
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 0xffff;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 0xffff;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 0xffff;
        c48 += a48 + b48;
        c48 &= 0xffff;
        return Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };
    /**
     * Returns the sum of this and the specified Long.
     * @returns Sum
     */
    Long.prototype.and = function (other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        return Long.fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    };
    /**
     * Compares this Long's value with the specified's.
     * @returns 0 if they are the same, 1 if the this is greater and -1 if the given one is greater
     */
    Long.prototype.compare = function (other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        if (this.eq(other))
            return 0;
        var thisNeg = this.isNegative(), otherNeg = other.isNegative();
        if (thisNeg && !otherNeg)
            return -1;
        if (!thisNeg && otherNeg)
            return 1;
        // At this point the sign bits are the same
        if (!this.unsigned)
            return this.sub(other).isNegative() ? -1 : 1;
        // Both are positive if at least one is unsigned
        return other.high >>> 0 > this.high >>> 0 ||
            (other.high === this.high && other.low >>> 0 > this.low >>> 0)
            ? -1
            : 1;
    };
    /** This is an alias of {@link Long.compare} */
    Long.prototype.comp = function (other) {
        return this.compare(other);
    };
    /**
     * Returns this Long divided by the specified. The result is signed if this Long is signed or unsigned if this Long is unsigned.
     * @returns Quotient
     */
    Long.prototype.divide = function (divisor) {
        if (!Long.isLong(divisor))
            divisor = Long.fromValue(divisor);
        if (divisor.isZero())
            throw Error('division by zero');
        // use wasm support if present
        if (wasm) {
            // guard against signed division overflow: the largest
            // negative number / -1 would be 1 larger than the largest
            // positive number, due to two's complement.
            if (!this.unsigned &&
                this.high === -0x80000000 &&
                divisor.low === -1 &&
                divisor.high === -1) {
                // be consistent with non-wasm code path
                return this;
            }
            var low = (this.unsigned ? wasm.div_u : wasm.div_s)(this.low, this.high, divisor.low, divisor.high);
            return Long.fromBits(low, wasm.get_high(), this.unsigned);
        }
        if (this.isZero())
            return this.unsigned ? Long.UZERO : Long.ZERO;
        var approx, rem, res;
        if (!this.unsigned) {
            // This section is only relevant for signed longs and is derived from the
            // closure library as a whole.
            if (this.eq(Long.MIN_VALUE)) {
                if (divisor.eq(Long.ONE) || divisor.eq(Long.NEG_ONE))
                    return Long.MIN_VALUE;
                // recall that -MIN_VALUE == MIN_VALUE
                else if (divisor.eq(Long.MIN_VALUE))
                    return Long.ONE;
                else {
                    // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                    var halfThis = this.shr(1);
                    approx = halfThis.div(divisor).shl(1);
                    if (approx.eq(Long.ZERO)) {
                        return divisor.isNegative() ? Long.ONE : Long.NEG_ONE;
                    }
                    else {
                        rem = this.sub(divisor.mul(approx));
                        res = approx.add(rem.div(divisor));
                        return res;
                    }
                }
            }
            else if (divisor.eq(Long.MIN_VALUE))
                return this.unsigned ? Long.UZERO : Long.ZERO;
            if (this.isNegative()) {
                if (divisor.isNegative())
                    return this.neg().div(divisor.neg());
                return this.neg().div(divisor).neg();
            }
            else if (divisor.isNegative())
                return this.div(divisor.neg()).neg();
            res = Long.ZERO;
        }
        else {
            // The algorithm below has not been made for unsigned longs. It's therefore
            // required to take special care of the MSB prior to running it.
            if (!divisor.unsigned)
                divisor = divisor.toUnsigned();
            if (divisor.gt(this))
                return Long.UZERO;
            if (divisor.gt(this.shru(1)))
                // 15 >>> 1 = 7 ; with divisor = 8 ; true
                return Long.UONE;
            res = Long.UZERO;
        }
        // Repeat the following until the remainder is less than other:  find a
        // floating-point that approximates remainder / other *from below*, add this
        // into the result, and subtract it from the remainder.  It is critical that
        // the approximate value is less than or equal to the real value so that the
        // remainder never becomes negative.
        rem = this;
        while (rem.gte(divisor)) {
            // Approximate the result of division. This may be a little greater or
            // smaller than the actual value.
            approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
            // We will tweak the approximate result by changing it in the 48-th digit or
            // the smallest non-fractional digit, whichever is larger.
            var log2 = Math.ceil(Math.log(approx) / Math.LN2);
            var delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48);
            // Decrease the approximation until it is smaller than the remainder.  Note
            // that if it is too large, the product overflows and is negative.
            var approxRes = Long.fromNumber(approx);
            var approxRem = approxRes.mul(divisor);
            while (approxRem.isNegative() || approxRem.gt(rem)) {
                approx -= delta;
                approxRes = Long.fromNumber(approx, this.unsigned);
                approxRem = approxRes.mul(divisor);
            }
            // We know the answer can't be zero... and actually, zero would cause
            // infinite recursion since we would make no progress.
            if (approxRes.isZero())
                approxRes = Long.ONE;
            res = res.add(approxRes);
            rem = rem.sub(approxRem);
        }
        return res;
    };
    /**This is an alias of {@link Long.divide} */
    Long.prototype.div = function (divisor) {
        return this.divide(divisor);
    };
    /**
     * Tests if this Long's value equals the specified's.
     * @param other - Other value
     */
    Long.prototype.equals = function (other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1)
            return false;
        return this.high === other.high && this.low === other.low;
    };
    /** This is an alias of {@link Long.equals} */
    Long.prototype.eq = function (other) {
        return this.equals(other);
    };
    /** Gets the high 32 bits as a signed integer. */
    Long.prototype.getHighBits = function () {
        return this.high;
    };
    /** Gets the high 32 bits as an unsigned integer. */
    Long.prototype.getHighBitsUnsigned = function () {
        return this.high >>> 0;
    };
    /** Gets the low 32 bits as a signed integer. */
    Long.prototype.getLowBits = function () {
        return this.low;
    };
    /** Gets the low 32 bits as an unsigned integer. */
    Long.prototype.getLowBitsUnsigned = function () {
        return this.low >>> 0;
    };
    /** Gets the number of bits needed to represent the absolute value of this Long. */
    Long.prototype.getNumBitsAbs = function () {
        if (this.isNegative()) {
            // Unsigned Longs are never negative
            return this.eq(Long.MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
        }
        var val = this.high !== 0 ? this.high : this.low;
        var bit;
        for (bit = 31; bit > 0; bit--)
            if ((val & (1 << bit)) !== 0)
                break;
        return this.high !== 0 ? bit + 33 : bit + 1;
    };
    /** Tests if this Long's value is greater than the specified's. */
    Long.prototype.greaterThan = function (other) {
        return this.comp(other) > 0;
    };
    /** This is an alias of {@link Long.greaterThan} */
    Long.prototype.gt = function (other) {
        return this.greaterThan(other);
    };
    /** Tests if this Long's value is greater than or equal the specified's. */
    Long.prototype.greaterThanOrEqual = function (other) {
        return this.comp(other) >= 0;
    };
    /** This is an alias of {@link Long.greaterThanOrEqual} */
    Long.prototype.gte = function (other) {
        return this.greaterThanOrEqual(other);
    };
    /** This is an alias of {@link Long.greaterThanOrEqual} */
    Long.prototype.ge = function (other) {
        return this.greaterThanOrEqual(other);
    };
    /** Tests if this Long's value is even. */
    Long.prototype.isEven = function () {
        return (this.low & 1) === 0;
    };
    /** Tests if this Long's value is negative. */
    Long.prototype.isNegative = function () {
        return !this.unsigned && this.high < 0;
    };
    /** Tests if this Long's value is odd. */
    Long.prototype.isOdd = function () {
        return (this.low & 1) === 1;
    };
    /** Tests if this Long's value is positive. */
    Long.prototype.isPositive = function () {
        return this.unsigned || this.high >= 0;
    };
    /** Tests if this Long's value equals zero. */
    Long.prototype.isZero = function () {
        return this.high === 0 && this.low === 0;
    };
    /** Tests if this Long's value is less than the specified's. */
    Long.prototype.lessThan = function (other) {
        return this.comp(other) < 0;
    };
    /** This is an alias of {@link Long#lessThan}. */
    Long.prototype.lt = function (other) {
        return this.lessThan(other);
    };
    /** Tests if this Long's value is less than or equal the specified's. */
    Long.prototype.lessThanOrEqual = function (other) {
        return this.comp(other) <= 0;
    };
    /** This is an alias of {@link Long.lessThanOrEqual} */
    Long.prototype.lte = function (other) {
        return this.lessThanOrEqual(other);
    };
    /** Returns this Long modulo the specified. */
    Long.prototype.modulo = function (divisor) {
        if (!Long.isLong(divisor))
            divisor = Long.fromValue(divisor);
        // use wasm support if present
        if (wasm) {
            var low = (this.unsigned ? wasm.rem_u : wasm.rem_s)(this.low, this.high, divisor.low, divisor.high);
            return Long.fromBits(low, wasm.get_high(), this.unsigned);
        }
        return this.sub(this.div(divisor).mul(divisor));
    };
    /** This is an alias of {@link Long.modulo} */
    Long.prototype.mod = function (divisor) {
        return this.modulo(divisor);
    };
    /** This is an alias of {@link Long.modulo} */
    Long.prototype.rem = function (divisor) {
        return this.modulo(divisor);
    };
    /**
     * Returns the product of this and the specified Long.
     * @param multiplier - Multiplier
     * @returns Product
     */
    Long.prototype.multiply = function (multiplier) {
        if (this.isZero())
            return Long.ZERO;
        if (!Long.isLong(multiplier))
            multiplier = Long.fromValue(multiplier);
        // use wasm support if present
        if (wasm) {
            var low = wasm.mul(this.low, this.high, multiplier.low, multiplier.high);
            return Long.fromBits(low, wasm.get_high(), this.unsigned);
        }
        if (multiplier.isZero())
            return Long.ZERO;
        if (this.eq(Long.MIN_VALUE))
            return multiplier.isOdd() ? Long.MIN_VALUE : Long.ZERO;
        if (multiplier.eq(Long.MIN_VALUE))
            return this.isOdd() ? Long.MIN_VALUE : Long.ZERO;
        if (this.isNegative()) {
            if (multiplier.isNegative())
                return this.neg().mul(multiplier.neg());
            else
                return this.neg().mul(multiplier).neg();
        }
        else if (multiplier.isNegative())
            return this.mul(multiplier.neg()).neg();
        // If both longs are small, use float multiplication
        if (this.lt(Long.TWO_PWR_24) && multiplier.lt(Long.TWO_PWR_24))
            return Long.fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
        // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
        // We can skip products that would overflow.
        var a48 = this.high >>> 16;
        var a32 = this.high & 0xffff;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xffff;
        var b48 = multiplier.high >>> 16;
        var b32 = multiplier.high & 0xffff;
        var b16 = multiplier.low >>> 16;
        var b00 = multiplier.low & 0xffff;
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16;
        c00 &= 0xffff;
        c16 += a16 * b00;
        c32 += c16 >>> 16;
        c16 &= 0xffff;
        c16 += a00 * b16;
        c32 += c16 >>> 16;
        c16 &= 0xffff;
        c32 += a32 * b00;
        c48 += c32 >>> 16;
        c32 &= 0xffff;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 0xffff;
        c32 += a00 * b32;
        c48 += c32 >>> 16;
        c32 &= 0xffff;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 0xffff;
        return Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };
    /** This is an alias of {@link Long.multiply} */
    Long.prototype.mul = function (multiplier) {
        return this.multiply(multiplier);
    };
    /** Returns the Negation of this Long's value. */
    Long.prototype.negate = function () {
        if (!this.unsigned && this.eq(Long.MIN_VALUE))
            return Long.MIN_VALUE;
        return this.not().add(Long.ONE);
    };
    /** This is an alias of {@link Long.negate} */
    Long.prototype.neg = function () {
        return this.negate();
    };
    /** Returns the bitwise NOT of this Long. */
    Long.prototype.not = function () {
        return Long.fromBits(~this.low, ~this.high, this.unsigned);
    };
    /** Tests if this Long's value differs from the specified's. */
    Long.prototype.notEquals = function (other) {
        return !this.equals(other);
    };
    /** This is an alias of {@link Long.notEquals} */
    Long.prototype.neq = function (other) {
        return this.notEquals(other);
    };
    /** This is an alias of {@link Long.notEquals} */
    Long.prototype.ne = function (other) {
        return this.notEquals(other);
    };
    /**
     * Returns the bitwise OR of this Long and the specified.
     */
    Long.prototype.or = function (other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        return Long.fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    };
    /**
     * Returns this Long with bits shifted to the left by the given amount.
     * @param numBits - Number of bits
     * @returns Shifted Long
     */
    Long.prototype.shiftLeft = function (numBits) {
        if (Long.isLong(numBits))
            numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return Long.fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
        else
            return Long.fromBits(0, this.low << (numBits - 32), this.unsigned);
    };
    /** This is an alias of {@link Long.shiftLeft} */
    Long.prototype.shl = function (numBits) {
        return this.shiftLeft(numBits);
    };
    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount.
     * @param numBits - Number of bits
     * @returns Shifted Long
     */
    Long.prototype.shiftRight = function (numBits) {
        if (Long.isLong(numBits))
            numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return Long.fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
        else
            return Long.fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
    };
    /** This is an alias of {@link Long.shiftRight} */
    Long.prototype.shr = function (numBits) {
        return this.shiftRight(numBits);
    };
    /**
     * Returns this Long with bits logically shifted to the right by the given amount.
     * @param numBits - Number of bits
     * @returns Shifted Long
     */
    Long.prototype.shiftRightUnsigned = function (numBits) {
        if (Long.isLong(numBits))
            numBits = numBits.toInt();
        numBits &= 63;
        if (numBits === 0)
            return this;
        else {
            var high = this.high;
            if (numBits < 32) {
                var low = this.low;
                return Long.fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
            }
            else if (numBits === 32)
                return Long.fromBits(high, 0, this.unsigned);
            else
                return Long.fromBits(high >>> (numBits - 32), 0, this.unsigned);
        }
    };
    /** This is an alias of {@link Long.shiftRightUnsigned} */
    Long.prototype.shr_u = function (numBits) {
        return this.shiftRightUnsigned(numBits);
    };
    /** This is an alias of {@link Long.shiftRightUnsigned} */
    Long.prototype.shru = function (numBits) {
        return this.shiftRightUnsigned(numBits);
    };
    /**
     * Returns the difference of this and the specified Long.
     * @param subtrahend - Subtrahend
     * @returns Difference
     */
    Long.prototype.subtract = function (subtrahend) {
        if (!Long.isLong(subtrahend))
            subtrahend = Long.fromValue(subtrahend);
        return this.add(subtrahend.neg());
    };
    /** This is an alias of {@link Long.subtract} */
    Long.prototype.sub = function (subtrahend) {
        return this.subtract(subtrahend);
    };
    /** Converts the Long to a 32 bit integer, assuming it is a 32 bit integer. */
    Long.prototype.toInt = function () {
        return this.unsigned ? this.low >>> 0 : this.low;
    };
    /** Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa). */
    Long.prototype.toNumber = function () {
        if (this.unsigned)
            return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    };
    /** Converts the Long to a BigInt (arbitrary precision). */
    Long.prototype.toBigInt = function () {
        return BigInt(this.toString());
    };
    /**
     * Converts this Long to its byte representation.
     * @param le - Whether little or big endian, defaults to big endian
     * @returns Byte representation
     */
    Long.prototype.toBytes = function (le) {
        return le ? this.toBytesLE() : this.toBytesBE();
    };
    /**
     * Converts this Long to its little endian byte representation.
     * @returns Little endian byte representation
     */
    Long.prototype.toBytesLE = function () {
        var hi = this.high, lo = this.low;
        return [
            lo & 0xff,
            (lo >>> 8) & 0xff,
            (lo >>> 16) & 0xff,
            lo >>> 24,
            hi & 0xff,
            (hi >>> 8) & 0xff,
            (hi >>> 16) & 0xff,
            hi >>> 24
        ];
    };
    /**
     * Converts this Long to its big endian byte representation.
     * @returns Big endian byte representation
     */
    Long.prototype.toBytesBE = function () {
        var hi = this.high, lo = this.low;
        return [
            hi >>> 24,
            (hi >>> 16) & 0xff,
            (hi >>> 8) & 0xff,
            hi & 0xff,
            lo >>> 24,
            (lo >>> 16) & 0xff,
            (lo >>> 8) & 0xff,
            lo & 0xff
        ];
    };
    /**
     * Converts this Long to signed.
     */
    Long.prototype.toSigned = function () {
        if (!this.unsigned)
            return this;
        return Long.fromBits(this.low, this.high, false);
    };
    /**
     * Converts the Long to a string written in the specified radix.
     * @param radix - Radix (2-36), defaults to 10
     * @throws RangeError If `radix` is out of range
     */
    Long.prototype.toString = function (radix) {
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw RangeError('radix');
        if (this.isZero())
            return '0';
        if (this.isNegative()) {
            // Unsigned Longs are never negative
            if (this.eq(Long.MIN_VALUE)) {
                // We need to change the Long value before it can be negated, so we remove
                // the bottom-most digit in this base and then recurse to do the rest.
                var radixLong = Long.fromNumber(radix), div = this.div(radixLong), rem1 = div.mul(radixLong).sub(this);
                return div.toString(radix) + rem1.toInt().toString(radix);
            }
            else
                return '-' + this.neg().toString(radix);
        }
        // Do several (6) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        var radixToPower = Long.fromNumber(Math.pow(radix, 6), this.unsigned);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var rem = this;
        var result = '';
        // eslint-disable-next-line no-constant-condition
        while (true) {
            var remDiv = rem.div(radixToPower);
            var intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0;
            var digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero()) {
                return digits + result;
            }
            else {
                while (digits.length < 6)
                    digits = '0' + digits;
                result = '' + digits + result;
            }
        }
    };
    /** Converts this Long to unsigned. */
    Long.prototype.toUnsigned = function () {
        if (this.unsigned)
            return this;
        return Long.fromBits(this.low, this.high, true);
    };
    /** Returns the bitwise XOR of this Long and the given one. */
    Long.prototype.xor = function (other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        return Long.fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    };
    /** This is an alias of {@link Long.isZero} */
    Long.prototype.eqz = function () {
        return this.isZero();
    };
    /** This is an alias of {@link Long.lessThanOrEqual} */
    Long.prototype.le = function (other) {
        return this.lessThanOrEqual(other);
    };
    /*
     ****************************************************************
     *                  BSON SPECIFIC ADDITIONS                     *
     ****************************************************************
     */
    Long.prototype.toExtendedJSON = function (options) {
        if (options && options.relaxed)
            return this.toNumber();
        return { $numberLong: this.toString() };
    };
    Long.fromExtendedJSON = function (doc, options) {
        var result = Long.fromString(doc.$numberLong);
        return options && options.relaxed ? result.toNumber() : result;
    };
    /** @internal */
    Long.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    Long.prototype.inspect = function () {
        return "new Long(\"" + this.toString() + "\"" + (this.unsigned ? ', true' : '') + ")";
    };
    Long.TWO_PWR_24 = Long.fromInt(TWO_PWR_24_DBL);
    /** Maximum unsigned value. */
    Long.MAX_UNSIGNED_VALUE = Long.fromBits(0xffffffff | 0, 0xffffffff | 0, true);
    /** Signed zero */
    Long.ZERO = Long.fromInt(0);
    /** Unsigned zero. */
    Long.UZERO = Long.fromInt(0, true);
    /** Signed one. */
    Long.ONE = Long.fromInt(1);
    /** Unsigned one. */
    Long.UONE = Long.fromInt(1, true);
    /** Signed negative one. */
    Long.NEG_ONE = Long.fromInt(-1);
    /** Maximum signed value. */
    Long.MAX_VALUE = Long.fromBits(0xffffffff | 0, 0x7fffffff | 0, false);
    /** Minimum signed value. */
    Long.MIN_VALUE = Long.fromBits(0, 0x80000000 | 0, false);
    return Long;
}());
exports.Long = Long;
Object.defineProperty(Long.prototype, '__isLong__', { value: true });
Object.defineProperty(Long.prototype, '_bsontype', { value: 'Long' });

});

unwrapExports(long_1);
long_1.Long;

var decimal128 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decimal128 = void 0;


var PARSE_STRING_REGEXP = /^(\+|-)?(\d+|(\d*\.\d*))?(E|e)?([-+])?(\d+)?$/;
var PARSE_INF_REGEXP = /^(\+|-)?(Infinity|inf)$/i;
var PARSE_NAN_REGEXP = /^(\+|-)?NaN$/i;
var EXPONENT_MAX = 6111;
var EXPONENT_MIN = -6176;
var EXPONENT_BIAS = 6176;
var MAX_DIGITS = 34;
// Nan value bits as 32 bit values (due to lack of longs)
var NAN_BUFFER = [
    0x7c,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00
].reverse();
// Infinity value bits 32 bit values (due to lack of longs)
var INF_NEGATIVE_BUFFER = [
    0xf8,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00
].reverse();
var INF_POSITIVE_BUFFER = [
    0x78,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00
].reverse();
var EXPONENT_REGEX = /^([-+])?(\d+)?$/;
// Extract least significant 5 bits
var COMBINATION_MASK = 0x1f;
// Extract least significant 14 bits
var EXPONENT_MASK = 0x3fff;
// Value of combination field for Inf
var COMBINATION_INFINITY = 30;
// Value of combination field for NaN
var COMBINATION_NAN = 31;
// Detect if the value is a digit
function isDigit(value) {
    return !isNaN(parseInt(value, 10));
}
// Divide two uint128 values
function divideu128(value) {
    var DIVISOR = long_1.Long.fromNumber(1000 * 1000 * 1000);
    var _rem = long_1.Long.fromNumber(0);
    if (!value.parts[0] && !value.parts[1] && !value.parts[2] && !value.parts[3]) {
        return { quotient: value, rem: _rem };
    }
    for (var i = 0; i <= 3; i++) {
        // Adjust remainder to match value of next dividend
        _rem = _rem.shiftLeft(32);
        // Add the divided to _rem
        _rem = _rem.add(new long_1.Long(value.parts[i], 0));
        value.parts[i] = _rem.div(DIVISOR).low;
        _rem = _rem.modulo(DIVISOR);
    }
    return { quotient: value, rem: _rem };
}
// Multiply two Long values and return the 128 bit value
function multiply64x2(left, right) {
    if (!left && !right) {
        return { high: long_1.Long.fromNumber(0), low: long_1.Long.fromNumber(0) };
    }
    var leftHigh = left.shiftRightUnsigned(32);
    var leftLow = new long_1.Long(left.getLowBits(), 0);
    var rightHigh = right.shiftRightUnsigned(32);
    var rightLow = new long_1.Long(right.getLowBits(), 0);
    var productHigh = leftHigh.multiply(rightHigh);
    var productMid = leftHigh.multiply(rightLow);
    var productMid2 = leftLow.multiply(rightHigh);
    var productLow = leftLow.multiply(rightLow);
    productHigh = productHigh.add(productMid.shiftRightUnsigned(32));
    productMid = new long_1.Long(productMid.getLowBits(), 0)
        .add(productMid2)
        .add(productLow.shiftRightUnsigned(32));
    productHigh = productHigh.add(productMid.shiftRightUnsigned(32));
    productLow = productMid.shiftLeft(32).add(new long_1.Long(productLow.getLowBits(), 0));
    // Return the 128 bit result
    return { high: productHigh, low: productLow };
}
function lessThan(left, right) {
    // Make values unsigned
    var uhleft = left.high >>> 0;
    var uhright = right.high >>> 0;
    // Compare high bits first
    if (uhleft < uhright) {
        return true;
    }
    else if (uhleft === uhright) {
        var ulleft = left.low >>> 0;
        var ulright = right.low >>> 0;
        if (ulleft < ulright)
            return true;
    }
    return false;
}
function invalidErr(string, message) {
    throw new TypeError("\"" + string + "\" is not a valid Decimal128 string - " + message);
}
/**
 * A class representation of the BSON Decimal128 type.
 * @public
 */
var Decimal128 = /** @class */ (function () {
    /**
     * @param bytes - a buffer containing the raw Decimal128 bytes in little endian order,
     *                or a string representation as returned by .toString()
     */
    function Decimal128(bytes) {
        if (!(this instanceof Decimal128))
            return new Decimal128(bytes);
        if (typeof bytes === 'string') {
            this.bytes = Decimal128.fromString(bytes).bytes;
        }
        else {
            this.bytes = bytes;
        }
    }
    /**
     * Create a Decimal128 instance from a string representation
     *
     * @param representation - a numeric string representation.
     */
    Decimal128.fromString = function (representation) {
        // Parse state tracking
        var isNegative = false;
        var sawRadix = false;
        var foundNonZero = false;
        // Total number of significant digits (no leading or trailing zero)
        var significantDigits = 0;
        // Total number of significand digits read
        var nDigitsRead = 0;
        // Total number of digits (no leading zeros)
        var nDigits = 0;
        // The number of the digits after radix
        var radixPosition = 0;
        // The index of the first non-zero in *str*
        var firstNonZero = 0;
        // Digits Array
        var digits = [0];
        // The number of digits in digits
        var nDigitsStored = 0;
        // Insertion pointer for digits
        var digitsInsert = 0;
        // The index of the first non-zero digit
        var firstDigit = 0;
        // The index of the last digit
        var lastDigit = 0;
        // Exponent
        var exponent = 0;
        // loop index over array
        var i = 0;
        // The high 17 digits of the significand
        var significandHigh = new long_1.Long(0, 0);
        // The low 17 digits of the significand
        var significandLow = new long_1.Long(0, 0);
        // The biased exponent
        var biasedExponent = 0;
        // Read index
        var index = 0;
        // Naively prevent against REDOS attacks.
        // TODO: implementing a custom parsing for this, or refactoring the regex would yield
        //       further gains.
        if (representation.length >= 7000) {
            throw new TypeError('' + representation + ' not a valid Decimal128 string');
        }
        // Results
        var stringMatch = representation.match(PARSE_STRING_REGEXP);
        var infMatch = representation.match(PARSE_INF_REGEXP);
        var nanMatch = representation.match(PARSE_NAN_REGEXP);
        // Validate the string
        if ((!stringMatch && !infMatch && !nanMatch) || representation.length === 0) {
            throw new TypeError('' + representation + ' not a valid Decimal128 string');
        }
        if (stringMatch) {
            // full_match = stringMatch[0]
            // sign = stringMatch[1]
            var unsignedNumber = stringMatch[2];
            // stringMatch[3] is undefined if a whole number (ex "1", 12")
            // but defined if a number w/ decimal in it (ex "1.0, 12.2")
            var e = stringMatch[4];
            var expSign = stringMatch[5];
            var expNumber = stringMatch[6];
            // they provided e, but didn't give an exponent number. for ex "1e"
            if (e && expNumber === undefined)
                invalidErr(representation, 'missing exponent power');
            // they provided e, but didn't give a number before it. for ex "e1"
            if (e && unsignedNumber === undefined)
                invalidErr(representation, 'missing exponent base');
            if (e === undefined && (expSign || expNumber)) {
                invalidErr(representation, 'missing e before exponent');
            }
        }
        // Get the negative or positive sign
        if (representation[index] === '+' || representation[index] === '-') {
            isNegative = representation[index++] === '-';
        }
        // Check if user passed Infinity or NaN
        if (!isDigit(representation[index]) && representation[index] !== '.') {
            if (representation[index] === 'i' || representation[index] === 'I') {
                return new Decimal128(buffer.Buffer.from(isNegative ? INF_NEGATIVE_BUFFER : INF_POSITIVE_BUFFER));
            }
            else if (representation[index] === 'N') {
                return new Decimal128(buffer.Buffer.from(NAN_BUFFER));
            }
        }
        // Read all the digits
        while (isDigit(representation[index]) || representation[index] === '.') {
            if (representation[index] === '.') {
                if (sawRadix)
                    invalidErr(representation, 'contains multiple periods');
                sawRadix = true;
                index = index + 1;
                continue;
            }
            if (nDigitsStored < 34) {
                if (representation[index] !== '0' || foundNonZero) {
                    if (!foundNonZero) {
                        firstNonZero = nDigitsRead;
                    }
                    foundNonZero = true;
                    // Only store 34 digits
                    digits[digitsInsert++] = parseInt(representation[index], 10);
                    nDigitsStored = nDigitsStored + 1;
                }
            }
            if (foundNonZero)
                nDigits = nDigits + 1;
            if (sawRadix)
                radixPosition = radixPosition + 1;
            nDigitsRead = nDigitsRead + 1;
            index = index + 1;
        }
        if (sawRadix && !nDigitsRead)
            throw new TypeError('' + representation + ' not a valid Decimal128 string');
        // Read exponent if exists
        if (representation[index] === 'e' || representation[index] === 'E') {
            // Read exponent digits
            var match = representation.substr(++index).match(EXPONENT_REGEX);
            // No digits read
            if (!match || !match[2])
                return new Decimal128(buffer.Buffer.from(NAN_BUFFER));
            // Get exponent
            exponent = parseInt(match[0], 10);
            // Adjust the index
            index = index + match[0].length;
        }
        // Return not a number
        if (representation[index])
            return new Decimal128(buffer.Buffer.from(NAN_BUFFER));
        // Done reading input
        // Find first non-zero digit in digits
        firstDigit = 0;
        if (!nDigitsStored) {
            firstDigit = 0;
            lastDigit = 0;
            digits[0] = 0;
            nDigits = 1;
            nDigitsStored = 1;
            significantDigits = 0;
        }
        else {
            lastDigit = nDigitsStored - 1;
            significantDigits = nDigits;
            if (significantDigits !== 1) {
                while (representation[firstNonZero + significantDigits - 1] === '0') {
                    significantDigits = significantDigits - 1;
                }
            }
        }
        // Normalization of exponent
        // Correct exponent based on radix position, and shift significand as needed
        // to represent user input
        // Overflow prevention
        if (exponent <= radixPosition && radixPosition - exponent > 1 << 14) {
            exponent = EXPONENT_MIN;
        }
        else {
            exponent = exponent - radixPosition;
        }
        // Attempt to normalize the exponent
        while (exponent > EXPONENT_MAX) {
            // Shift exponent to significand and decrease
            lastDigit = lastDigit + 1;
            if (lastDigit - firstDigit > MAX_DIGITS) {
                // Check if we have a zero then just hard clamp, otherwise fail
                var digitsString = digits.join('');
                if (digitsString.match(/^0+$/)) {
                    exponent = EXPONENT_MAX;
                    break;
                }
                invalidErr(representation, 'overflow');
            }
            exponent = exponent - 1;
        }
        while (exponent < EXPONENT_MIN || nDigitsStored < nDigits) {
            // Shift last digit. can only do this if < significant digits than # stored.
            if (lastDigit === 0 && significantDigits < nDigitsStored) {
                exponent = EXPONENT_MIN;
                significantDigits = 0;
                break;
            }
            if (nDigitsStored < nDigits) {
                // adjust to match digits not stored
                nDigits = nDigits - 1;
            }
            else {
                // adjust to round
                lastDigit = lastDigit - 1;
            }
            if (exponent < EXPONENT_MAX) {
                exponent = exponent + 1;
            }
            else {
                // Check if we have a zero then just hard clamp, otherwise fail
                var digitsString = digits.join('');
                if (digitsString.match(/^0+$/)) {
                    exponent = EXPONENT_MAX;
                    break;
                }
                invalidErr(representation, 'overflow');
            }
        }
        // Round
        // We've normalized the exponent, but might still need to round.
        if (lastDigit - firstDigit + 1 < significantDigits) {
            var endOfString = nDigitsRead;
            // If we have seen a radix point, 'string' is 1 longer than we have
            // documented with ndigits_read, so inc the position of the first nonzero
            // digit and the position that digits are read to.
            if (sawRadix) {
                firstNonZero = firstNonZero + 1;
                endOfString = endOfString + 1;
            }
            // if negative, we need to increment again to account for - sign at start.
            if (isNegative) {
                firstNonZero = firstNonZero + 1;
                endOfString = endOfString + 1;
            }
            var roundDigit = parseInt(representation[firstNonZero + lastDigit + 1], 10);
            var roundBit = 0;
            if (roundDigit >= 5) {
                roundBit = 1;
                if (roundDigit === 5) {
                    roundBit = digits[lastDigit] % 2 === 1 ? 1 : 0;
                    for (i = firstNonZero + lastDigit + 2; i < endOfString; i++) {
                        if (parseInt(representation[i], 10)) {
                            roundBit = 1;
                            break;
                        }
                    }
                }
            }
            if (roundBit) {
                var dIdx = lastDigit;
                for (; dIdx >= 0; dIdx--) {
                    if (++digits[dIdx] > 9) {
                        digits[dIdx] = 0;
                        // overflowed most significant digit
                        if (dIdx === 0) {
                            if (exponent < EXPONENT_MAX) {
                                exponent = exponent + 1;
                                digits[dIdx] = 1;
                            }
                            else {
                                return new Decimal128(buffer.Buffer.from(isNegative ? INF_NEGATIVE_BUFFER : INF_POSITIVE_BUFFER));
                            }
                        }
                    }
                }
            }
        }
        // Encode significand
        // The high 17 digits of the significand
        significandHigh = long_1.Long.fromNumber(0);
        // The low 17 digits of the significand
        significandLow = long_1.Long.fromNumber(0);
        // read a zero
        if (significantDigits === 0) {
            significandHigh = long_1.Long.fromNumber(0);
            significandLow = long_1.Long.fromNumber(0);
        }
        else if (lastDigit - firstDigit < 17) {
            var dIdx = firstDigit;
            significandLow = long_1.Long.fromNumber(digits[dIdx++]);
            significandHigh = new long_1.Long(0, 0);
            for (; dIdx <= lastDigit; dIdx++) {
                significandLow = significandLow.multiply(long_1.Long.fromNumber(10));
                significandLow = significandLow.add(long_1.Long.fromNumber(digits[dIdx]));
            }
        }
        else {
            var dIdx = firstDigit;
            significandHigh = long_1.Long.fromNumber(digits[dIdx++]);
            for (; dIdx <= lastDigit - 17; dIdx++) {
                significandHigh = significandHigh.multiply(long_1.Long.fromNumber(10));
                significandHigh = significandHigh.add(long_1.Long.fromNumber(digits[dIdx]));
            }
            significandLow = long_1.Long.fromNumber(digits[dIdx++]);
            for (; dIdx <= lastDigit; dIdx++) {
                significandLow = significandLow.multiply(long_1.Long.fromNumber(10));
                significandLow = significandLow.add(long_1.Long.fromNumber(digits[dIdx]));
            }
        }
        var significand = multiply64x2(significandHigh, long_1.Long.fromString('100000000000000000'));
        significand.low = significand.low.add(significandLow);
        if (lessThan(significand.low, significandLow)) {
            significand.high = significand.high.add(long_1.Long.fromNumber(1));
        }
        // Biased exponent
        biasedExponent = exponent + EXPONENT_BIAS;
        var dec = { low: long_1.Long.fromNumber(0), high: long_1.Long.fromNumber(0) };
        // Encode combination, exponent, and significand.
        if (significand.high.shiftRightUnsigned(49).and(long_1.Long.fromNumber(1)).equals(long_1.Long.fromNumber(1))) {
            // Encode '11' into bits 1 to 3
            dec.high = dec.high.or(long_1.Long.fromNumber(0x3).shiftLeft(61));
            dec.high = dec.high.or(long_1.Long.fromNumber(biasedExponent).and(long_1.Long.fromNumber(0x3fff).shiftLeft(47)));
            dec.high = dec.high.or(significand.high.and(long_1.Long.fromNumber(0x7fffffffffff)));
        }
        else {
            dec.high = dec.high.or(long_1.Long.fromNumber(biasedExponent & 0x3fff).shiftLeft(49));
            dec.high = dec.high.or(significand.high.and(long_1.Long.fromNumber(0x1ffffffffffff)));
        }
        dec.low = significand.low;
        // Encode sign
        if (isNegative) {
            dec.high = dec.high.or(long_1.Long.fromString('9223372036854775808'));
        }
        // Encode into a buffer
        var buffer$1 = buffer.Buffer.alloc(16);
        index = 0;
        // Encode the low 64 bits of the decimal
        // Encode low bits
        buffer$1[index++] = dec.low.low & 0xff;
        buffer$1[index++] = (dec.low.low >> 8) & 0xff;
        buffer$1[index++] = (dec.low.low >> 16) & 0xff;
        buffer$1[index++] = (dec.low.low >> 24) & 0xff;
        // Encode high bits
        buffer$1[index++] = dec.low.high & 0xff;
        buffer$1[index++] = (dec.low.high >> 8) & 0xff;
        buffer$1[index++] = (dec.low.high >> 16) & 0xff;
        buffer$1[index++] = (dec.low.high >> 24) & 0xff;
        // Encode the high 64 bits of the decimal
        // Encode low bits
        buffer$1[index++] = dec.high.low & 0xff;
        buffer$1[index++] = (dec.high.low >> 8) & 0xff;
        buffer$1[index++] = (dec.high.low >> 16) & 0xff;
        buffer$1[index++] = (dec.high.low >> 24) & 0xff;
        // Encode high bits
        buffer$1[index++] = dec.high.high & 0xff;
        buffer$1[index++] = (dec.high.high >> 8) & 0xff;
        buffer$1[index++] = (dec.high.high >> 16) & 0xff;
        buffer$1[index++] = (dec.high.high >> 24) & 0xff;
        // Return the new Decimal128
        return new Decimal128(buffer$1);
    };
    /** Create a string representation of the raw Decimal128 value */
    Decimal128.prototype.toString = function () {
        // Note: bits in this routine are referred to starting at 0,
        // from the sign bit, towards the coefficient.
        // decoded biased exponent (14 bits)
        var biased_exponent;
        // the number of significand digits
        var significand_digits = 0;
        // the base-10 digits in the significand
        var significand = new Array(36);
        for (var i = 0; i < significand.length; i++)
            significand[i] = 0;
        // read pointer into significand
        var index = 0;
        // true if the number is zero
        var is_zero = false;
        // the most significant significand bits (50-46)
        var significand_msb;
        // temporary storage for significand decoding
        var significand128 = { parts: [0, 0, 0, 0] };
        // indexing variables
        var j, k;
        // Output string
        var string = [];
        // Unpack index
        index = 0;
        // Buffer reference
        var buffer = this.bytes;
        // Unpack the low 64bits into a long
        // bits 96 - 127
        var low = buffer[index++] | (buffer[index++] << 8) | (buffer[index++] << 16) | (buffer[index++] << 24);
        // bits 64 - 95
        var midl = buffer[index++] | (buffer[index++] << 8) | (buffer[index++] << 16) | (buffer[index++] << 24);
        // Unpack the high 64bits into a long
        // bits 32 - 63
        var midh = buffer[index++] | (buffer[index++] << 8) | (buffer[index++] << 16) | (buffer[index++] << 24);
        // bits 0 - 31
        var high = buffer[index++] | (buffer[index++] << 8) | (buffer[index++] << 16) | (buffer[index++] << 24);
        // Unpack index
        index = 0;
        // Create the state of the decimal
        var dec = {
            low: new long_1.Long(low, midl),
            high: new long_1.Long(midh, high)
        };
        if (dec.high.lessThan(long_1.Long.ZERO)) {
            string.push('-');
        }
        // Decode combination field and exponent
        // bits 1 - 5
        var combination = (high >> 26) & COMBINATION_MASK;
        if (combination >> 3 === 3) {
            // Check for 'special' values
            if (combination === COMBINATION_INFINITY) {
                return string.join('') + 'Infinity';
            }
            else if (combination === COMBINATION_NAN) {
                return 'NaN';
            }
            else {
                biased_exponent = (high >> 15) & EXPONENT_MASK;
                significand_msb = 0x08 + ((high >> 14) & 0x01);
            }
        }
        else {
            significand_msb = (high >> 14) & 0x07;
            biased_exponent = (high >> 17) & EXPONENT_MASK;
        }
        // unbiased exponent
        var exponent = biased_exponent - EXPONENT_BIAS;
        // Create string of significand digits
        // Convert the 114-bit binary number represented by
        // (significand_high, significand_low) to at most 34 decimal
        // digits through modulo and division.
        significand128.parts[0] = (high & 0x3fff) + ((significand_msb & 0xf) << 14);
        significand128.parts[1] = midh;
        significand128.parts[2] = midl;
        significand128.parts[3] = low;
        if (significand128.parts[0] === 0 &&
            significand128.parts[1] === 0 &&
            significand128.parts[2] === 0 &&
            significand128.parts[3] === 0) {
            is_zero = true;
        }
        else {
            for (k = 3; k >= 0; k--) {
                var least_digits = 0;
                // Perform the divide
                var result = divideu128(significand128);
                significand128 = result.quotient;
                least_digits = result.rem.low;
                // We now have the 9 least significant digits (in base 2).
                // Convert and output to string.
                if (!least_digits)
                    continue;
                for (j = 8; j >= 0; j--) {
                    // significand[k * 9 + j] = Math.round(least_digits % 10);
                    significand[k * 9 + j] = least_digits % 10;
                    // least_digits = Math.round(least_digits / 10);
                    least_digits = Math.floor(least_digits / 10);
                }
            }
        }
        // Output format options:
        // Scientific - [-]d.dddE(+/-)dd or [-]dE(+/-)dd
        // Regular    - ddd.ddd
        if (is_zero) {
            significand_digits = 1;
            significand[index] = 0;
        }
        else {
            significand_digits = 36;
            while (!significand[index]) {
                significand_digits = significand_digits - 1;
                index = index + 1;
            }
        }
        // the exponent if scientific notation is used
        var scientific_exponent = significand_digits - 1 + exponent;
        // The scientific exponent checks are dictated by the string conversion
        // specification and are somewhat arbitrary cutoffs.
        //
        // We must check exponent > 0, because if this is the case, the number
        // has trailing zeros.  However, we *cannot* output these trailing zeros,
        // because doing so would change the precision of the value, and would
        // change stored data if the string converted number is round tripped.
        if (scientific_exponent >= 34 || scientific_exponent <= -7 || exponent > 0) {
            // Scientific format
            // if there are too many significant digits, we should just be treating numbers
            // as + or - 0 and using the non-scientific exponent (this is for the "invalid
            // representation should be treated as 0/-0" spec cases in decimal128-1.json)
            if (significand_digits > 34) {
                string.push("" + 0);
                if (exponent > 0)
                    string.push('E+' + exponent);
                else if (exponent < 0)
                    string.push('E' + exponent);
                return string.join('');
            }
            string.push("" + significand[index++]);
            significand_digits = significand_digits - 1;
            if (significand_digits) {
                string.push('.');
            }
            for (var i = 0; i < significand_digits; i++) {
                string.push("" + significand[index++]);
            }
            // Exponent
            string.push('E');
            if (scientific_exponent > 0) {
                string.push('+' + scientific_exponent);
            }
            else {
                string.push("" + scientific_exponent);
            }
        }
        else {
            // Regular format with no decimal place
            if (exponent >= 0) {
                for (var i = 0; i < significand_digits; i++) {
                    string.push("" + significand[index++]);
                }
            }
            else {
                var radix_position = significand_digits + exponent;
                // non-zero digits before radix
                if (radix_position > 0) {
                    for (var i = 0; i < radix_position; i++) {
                        string.push("" + significand[index++]);
                    }
                }
                else {
                    string.push('0');
                }
                string.push('.');
                // add leading zeros after radix
                while (radix_position++ < 0) {
                    string.push('0');
                }
                for (var i = 0; i < significand_digits - Math.max(radix_position - 1, 0); i++) {
                    string.push("" + significand[index++]);
                }
            }
        }
        return string.join('');
    };
    Decimal128.prototype.toJSON = function () {
        return { $numberDecimal: this.toString() };
    };
    /** @internal */
    Decimal128.prototype.toExtendedJSON = function () {
        return { $numberDecimal: this.toString() };
    };
    /** @internal */
    Decimal128.fromExtendedJSON = function (doc) {
        return Decimal128.fromString(doc.$numberDecimal);
    };
    /** @internal */
    Decimal128.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    Decimal128.prototype.inspect = function () {
        return "new Decimal128(\"" + this.toString() + "\")";
    };
    return Decimal128;
}());
exports.Decimal128 = Decimal128;
Object.defineProperty(Decimal128.prototype, '_bsontype', { value: 'Decimal128' });

});

unwrapExports(decimal128);
decimal128.Decimal128;

var double_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Double = void 0;
/**
 * A class representation of the BSON Double type.
 * @public
 */
var Double = /** @class */ (function () {
    /**
     * Create a Double type
     *
     * @param value - the number we want to represent as a double.
     */
    function Double(value) {
        if (!(this instanceof Double))
            return new Double(value);
        if (value instanceof Number) {
            value = value.valueOf();
        }
        this.value = +value;
    }
    /**
     * Access the number value.
     *
     * @returns returns the wrapped double number.
     */
    Double.prototype.valueOf = function () {
        return this.value;
    };
    /** @internal */
    Double.prototype.toJSON = function () {
        return this.value;
    };
    /** @internal */
    Double.prototype.toExtendedJSON = function (options) {
        if (options && (options.legacy || (options.relaxed && isFinite(this.value)))) {
            return this.value;
        }
        // NOTE: JavaScript has +0 and -0, apparently to model limit calculations. If a user
        // explicitly provided `-0` then we need to ensure the sign makes it into the output
        if (Object.is(Math.sign(this.value), -0)) {
            return { $numberDouble: "-" + this.value.toFixed(1) };
        }
        var $numberDouble;
        if (Number.isInteger(this.value)) {
            $numberDouble = this.value.toFixed(1);
            if ($numberDouble.length >= 13) {
                $numberDouble = this.value.toExponential(13).toUpperCase();
            }
        }
        else {
            $numberDouble = this.value.toString();
        }
        return { $numberDouble: $numberDouble };
    };
    /** @internal */
    Double.fromExtendedJSON = function (doc, options) {
        var doubleValue = parseFloat(doc.$numberDouble);
        return options && options.relaxed ? doubleValue : new Double(doubleValue);
    };
    /** @internal */
    Double.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    Double.prototype.inspect = function () {
        var eJSON = this.toExtendedJSON();
        return "new Double(" + eJSON.$numberDouble + ")";
    };
    return Double;
}());
exports.Double = Double;
Object.defineProperty(Double.prototype, '_bsontype', { value: 'Double' });

});

unwrapExports(double_1);
double_1.Double;

var int_32 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Int32 = void 0;
/**
 * A class representation of a BSON Int32 type.
 * @public
 */
var Int32 = /** @class */ (function () {
    /**
     * Create an Int32 type
     *
     * @param value - the number we want to represent as an int32.
     */
    function Int32(value) {
        if (!(this instanceof Int32))
            return new Int32(value);
        if (value instanceof Number) {
            value = value.valueOf();
        }
        this.value = +value;
    }
    /**
     * Access the number value.
     *
     * @returns returns the wrapped int32 number.
     */
    Int32.prototype.valueOf = function () {
        return this.value;
    };
    /** @internal */
    Int32.prototype.toJSON = function () {
        return this.value;
    };
    /** @internal */
    Int32.prototype.toExtendedJSON = function (options) {
        if (options && (options.relaxed || options.legacy))
            return this.value;
        return { $numberInt: this.value.toString() };
    };
    /** @internal */
    Int32.fromExtendedJSON = function (doc, options) {
        return options && options.relaxed ? parseInt(doc.$numberInt, 10) : new Int32(doc.$numberInt);
    };
    /** @internal */
    Int32.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    Int32.prototype.inspect = function () {
        return "new Int32(" + this.valueOf() + ")";
    };
    return Int32;
}());
exports.Int32 = Int32;
Object.defineProperty(Int32.prototype, '_bsontype', { value: 'Int32' });

});

unwrapExports(int_32);
int_32.Int32;

var max_key = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxKey = void 0;
/**
 * A class representation of the BSON MaxKey type.
 * @public
 */
var MaxKey = /** @class */ (function () {
    function MaxKey() {
        if (!(this instanceof MaxKey))
            return new MaxKey();
    }
    /** @internal */
    MaxKey.prototype.toExtendedJSON = function () {
        return { $maxKey: 1 };
    };
    /** @internal */
    MaxKey.fromExtendedJSON = function () {
        return new MaxKey();
    };
    /** @internal */
    MaxKey.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    MaxKey.prototype.inspect = function () {
        return 'new MaxKey()';
    };
    return MaxKey;
}());
exports.MaxKey = MaxKey;
Object.defineProperty(MaxKey.prototype, '_bsontype', { value: 'MaxKey' });

});

unwrapExports(max_key);
max_key.MaxKey;

var min_key = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinKey = void 0;
/**
 * A class representation of the BSON MinKey type.
 * @public
 */
var MinKey = /** @class */ (function () {
    function MinKey() {
        if (!(this instanceof MinKey))
            return new MinKey();
    }
    /** @internal */
    MinKey.prototype.toExtendedJSON = function () {
        return { $minKey: 1 };
    };
    /** @internal */
    MinKey.fromExtendedJSON = function () {
        return new MinKey();
    };
    /** @internal */
    MinKey.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    MinKey.prototype.inspect = function () {
        return 'new MinKey()';
    };
    return MinKey;
}());
exports.MinKey = MinKey;
Object.defineProperty(MinKey.prototype, '_bsontype', { value: 'MinKey' });

});

unwrapExports(min_key);
min_key.MinKey;

var objectid = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectId = void 0;



// Regular expression that checks for hex value
var checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
// Unique sequence for the current process (initialized on first use)
var PROCESS_UNIQUE = null;
var kId = Symbol('id');
/**
 * A class representation of the BSON ObjectId type.
 * @public
 */
var ObjectId = /** @class */ (function () {
    /**
     * Create an ObjectId type
     *
     * @param id - Can be a 24 character hex string, 12 byte binary Buffer, or a number.
     */
    function ObjectId(id) {
        if (!(this instanceof ObjectId))
            return new ObjectId(id);
        // Duck-typing to support ObjectId from different npm packages
        if (id instanceof ObjectId) {
            this[kId] = id.id;
            this.__id = id.__id;
        }
        if (typeof id === 'object' && id && 'id' in id) {
            if ('toHexString' in id && typeof id.toHexString === 'function') {
                this[kId] = buffer.Buffer.from(id.toHexString(), 'hex');
            }
            else {
                this[kId] = typeof id.id === 'string' ? buffer.Buffer.from(id.id) : id.id;
            }
        }
        // The most common use case (blank id, new objectId instance)
        if (id == null || typeof id === 'number') {
            // Generate a new id
            this[kId] = ObjectId.generate(typeof id === 'number' ? id : undefined);
            // If we are caching the hex string
            if (ObjectId.cacheHexString) {
                this.__id = this.id.toString('hex');
            }
        }
        if (ArrayBuffer.isView(id) && id.byteLength === 12) {
            this[kId] = ensure_buffer.ensureBuffer(id);
        }
        if (typeof id === 'string') {
            if (id.length === 12) {
                var bytes = buffer.Buffer.from(id);
                if (bytes.byteLength === 12) {
                    this[kId] = bytes;
                }
            }
            else if (id.length === 24 && checkForHexRegExp.test(id)) {
                this[kId] = buffer.Buffer.from(id, 'hex');
            }
            else {
                throw new TypeError('Argument passed in must be a Buffer or string of 12 bytes or a string of 24 hex characters');
            }
        }
        if (ObjectId.cacheHexString) {
            this.__id = this.id.toString('hex');
        }
    }
    Object.defineProperty(ObjectId.prototype, "id", {
        /**
         * The ObjectId bytes
         * @readonly
         */
        get: function () {
            return this[kId];
        },
        set: function (value) {
            this[kId] = value;
            if (ObjectId.cacheHexString) {
                this.__id = value.toString('hex');
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObjectId.prototype, "generationTime", {
        /**
         * The generation time of this ObjectId instance
         * @deprecated Please use getTimestamp / createFromTime which returns an int32 epoch
         */
        get: function () {
            return this.id.readInt32BE(0);
        },
        set: function (value) {
            // Encode time into first 4 bytes
            this.id.writeUInt32BE(value, 0);
        },
        enumerable: false,
        configurable: true
    });
    /** Returns the ObjectId id as a 24 character hex string representation */
    ObjectId.prototype.toHexString = function () {
        if (ObjectId.cacheHexString && this.__id) {
            return this.__id;
        }
        var hexString = this.id.toString('hex');
        if (ObjectId.cacheHexString && !this.__id) {
            this.__id = hexString;
        }
        return hexString;
    };
    /**
     * Update the ObjectId index
     * @privateRemarks
     * Used in generating new ObjectId's on the driver
     * @internal
     */
    ObjectId.getInc = function () {
        return (ObjectId.index = (ObjectId.index + 1) % 0xffffff);
    };
    /**
     * Generate a 12 byte id buffer used in ObjectId's
     *
     * @param time - pass in a second based timestamp.
     */
    ObjectId.generate = function (time) {
        if ('number' !== typeof time) {
            time = ~~(Date.now() / 1000);
        }
        var inc = ObjectId.getInc();
        var buffer$1 = buffer.Buffer.alloc(12);
        // 4-byte timestamp
        buffer$1.writeUInt32BE(time, 0);
        // set PROCESS_UNIQUE if yet not initialized
        if (PROCESS_UNIQUE === null) {
            PROCESS_UNIQUE = utils.randomBytes(5);
        }
        // 5-byte process unique
        buffer$1[4] = PROCESS_UNIQUE[0];
        buffer$1[5] = PROCESS_UNIQUE[1];
        buffer$1[6] = PROCESS_UNIQUE[2];
        buffer$1[7] = PROCESS_UNIQUE[3];
        buffer$1[8] = PROCESS_UNIQUE[4];
        // 3-byte counter
        buffer$1[11] = inc & 0xff;
        buffer$1[10] = (inc >> 8) & 0xff;
        buffer$1[9] = (inc >> 16) & 0xff;
        return buffer$1;
    };
    /**
     * Converts the id into a 24 character hex string for printing
     *
     * @param format - The Buffer toString format parameter.
     * @internal
     */
    ObjectId.prototype.toString = function (format) {
        // Is the id a buffer then use the buffer toString method to return the format
        if (format)
            return this.id.toString(format);
        return this.toHexString();
    };
    /**
     * Converts to its JSON the 24 character hex string representation.
     * @internal
     */
    ObjectId.prototype.toJSON = function () {
        return this.toHexString();
    };
    /**
     * Compares the equality of this ObjectId with `otherID`.
     *
     * @param otherId - ObjectId instance to compare against.
     */
    ObjectId.prototype.equals = function (otherId) {
        if (otherId === undefined || otherId === null) {
            return false;
        }
        if (otherId instanceof ObjectId) {
            return this.toString() === otherId.toString();
        }
        if (typeof otherId === 'string' &&
            ObjectId.isValid(otherId) &&
            otherId.length === 12 &&
            utils.isUint8Array(this.id)) {
            return otherId === buffer.Buffer.prototype.toString.call(this.id, 'latin1');
        }
        if (typeof otherId === 'string' && ObjectId.isValid(otherId) && otherId.length === 24) {
            return otherId.toLowerCase() === this.toHexString();
        }
        if (typeof otherId === 'string' && ObjectId.isValid(otherId) && otherId.length === 12) {
            return buffer.Buffer.from(otherId).equals(this.id);
        }
        if (typeof otherId === 'object' &&
            'toHexString' in otherId &&
            typeof otherId.toHexString === 'function') {
            return otherId.toHexString() === this.toHexString();
        }
        return false;
    };
    /** Returns the generation date (accurate up to the second) that this ID was generated. */
    ObjectId.prototype.getTimestamp = function () {
        var timestamp = new Date();
        var time = this.id.readUInt32BE(0);
        timestamp.setTime(Math.floor(time) * 1000);
        return timestamp;
    };
    /** @internal */
    ObjectId.createPk = function () {
        return new ObjectId();
    };
    /**
     * Creates an ObjectId from a second based number, with the rest of the ObjectId zeroed out. Used for comparisons or sorting the ObjectId.
     *
     * @param time - an integer number representing a number of seconds.
     */
    ObjectId.createFromTime = function (time) {
        var buffer$1 = buffer.Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        // Encode time into first 4 bytes
        buffer$1.writeUInt32BE(time, 0);
        // Return the new objectId
        return new ObjectId(buffer$1);
    };
    /**
     * Creates an ObjectId from a hex string representation of an ObjectId.
     *
     * @param hexString - create a ObjectId from a passed in 24 character hexstring.
     */
    ObjectId.createFromHexString = function (hexString) {
        // Throw an error if it's not a valid setup
        if (typeof hexString === 'undefined' || (hexString != null && hexString.length !== 24)) {
            throw new TypeError('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters');
        }
        return new ObjectId(buffer.Buffer.from(hexString, 'hex'));
    };
    /**
     * Checks if a value is a valid bson ObjectId
     *
     * @param id - ObjectId instance to validate.
     */
    ObjectId.isValid = function (id) {
        if (id == null)
            return false;
        if (typeof id === 'number') {
            return true;
        }
        if (typeof id === 'string') {
            return id.length === 12 || (id.length === 24 && checkForHexRegExp.test(id));
        }
        if (id instanceof ObjectId) {
            return true;
        }
        if (utils.isUint8Array(id) && id.length === 12) {
            return true;
        }
        // Duck-Typing detection of ObjectId like objects
        if (typeof id === 'object' && 'toHexString' in id && typeof id.toHexString === 'function') {
            if (typeof id.id === 'string') {
                return id.id.length === 12;
            }
            return id.toHexString().length === 24 && checkForHexRegExp.test(id.id.toString('hex'));
        }
        return false;
    };
    /** @internal */
    ObjectId.prototype.toExtendedJSON = function () {
        if (this.toHexString)
            return { $oid: this.toHexString() };
        return { $oid: this.toString('hex') };
    };
    /** @internal */
    ObjectId.fromExtendedJSON = function (doc) {
        return new ObjectId(doc.$oid);
    };
    /**
     * Converts to a string representation of this Id.
     *
     * @returns return the 24 character hex string representation.
     * @internal
     */
    ObjectId.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    ObjectId.prototype.inspect = function () {
        return "new ObjectId(\"" + this.toHexString() + "\")";
    };
    /** @internal */
    ObjectId.index = ~~(Math.random() * 0xffffff);
    return ObjectId;
}());
exports.ObjectId = ObjectId;
// Deprecated methods
Object.defineProperty(ObjectId.prototype, 'generate', {
    value: utils.deprecate(function (time) { return ObjectId.generate(time); }, 'Please use the static `ObjectId.generate(time)` instead')
});
Object.defineProperty(ObjectId.prototype, 'getInc', {
    value: utils.deprecate(function () { return ObjectId.getInc(); }, 'Please use the static `ObjectId.getInc()` instead')
});
Object.defineProperty(ObjectId.prototype, 'get_inc', {
    value: utils.deprecate(function () { return ObjectId.getInc(); }, 'Please use the static `ObjectId.getInc()` instead')
});
Object.defineProperty(ObjectId, 'get_inc', {
    value: utils.deprecate(function () { return ObjectId.getInc(); }, 'Please use the static `ObjectId.getInc()` instead')
});
Object.defineProperty(ObjectId.prototype, '_bsontype', { value: 'ObjectID' });

});

unwrapExports(objectid);
objectid.ObjectId;

var regexp = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.BSONRegExp = void 0;
function alphabetize(str) {
    return str.split('').sort().join('');
}
/**
 * A class representation of the BSON RegExp type.
 * @public
 */
var BSONRegExp = /** @class */ (function () {
    /**
     * @param pattern - The regular expression pattern to match
     * @param options - The regular expression options
     */
    function BSONRegExp(pattern, options) {
        if (!(this instanceof BSONRegExp))
            return new BSONRegExp(pattern, options);
        this.pattern = pattern;
        this.options = options !== null && options !== void 0 ? options : '';
        // Execute
        alphabetize(this.options);
        // Validate options
        for (var i = 0; i < this.options.length; i++) {
            if (!(this.options[i] === 'i' ||
                this.options[i] === 'm' ||
                this.options[i] === 'x' ||
                this.options[i] === 'l' ||
                this.options[i] === 's' ||
                this.options[i] === 'u')) {
                throw new Error("The regular expression option [" + this.options[i] + "] is not supported");
            }
        }
    }
    BSONRegExp.parseOptions = function (options) {
        return options ? options.split('').sort().join('') : '';
    };
    /** @internal */
    BSONRegExp.prototype.toExtendedJSON = function (options) {
        options = options || {};
        if (options.legacy) {
            return { $regex: this.pattern, $options: this.options };
        }
        return { $regularExpression: { pattern: this.pattern, options: this.options } };
    };
    /** @internal */
    BSONRegExp.fromExtendedJSON = function (doc) {
        if ('$regex' in doc) {
            if (typeof doc.$regex !== 'string') {
                // This is for $regex query operators that have extended json values.
                if (doc.$regex._bsontype === 'BSONRegExp') {
                    return doc;
                }
            }
            else {
                return new BSONRegExp(doc.$regex, BSONRegExp.parseOptions(doc.$options));
            }
        }
        if ('$regularExpression' in doc) {
            return new BSONRegExp(doc.$regularExpression.pattern, BSONRegExp.parseOptions(doc.$regularExpression.options));
        }
        throw new TypeError("Unexpected BSONRegExp EJSON object form: " + JSON.stringify(doc));
    };
    return BSONRegExp;
}());
exports.BSONRegExp = BSONRegExp;
Object.defineProperty(BSONRegExp.prototype, '_bsontype', { value: 'BSONRegExp' });

});

unwrapExports(regexp);
regexp.BSONRegExp;

var symbol = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.BSONSymbol = void 0;
/**
 * A class representation of the BSON Symbol type.
 * @public
 */
var BSONSymbol = /** @class */ (function () {
    /**
     * @param value - the string representing the symbol.
     */
    function BSONSymbol(value) {
        if (!(this instanceof BSONSymbol))
            return new BSONSymbol(value);
        this.value = value;
    }
    /** Access the wrapped string value. */
    BSONSymbol.prototype.valueOf = function () {
        return this.value;
    };
    /** @internal */
    BSONSymbol.prototype.toString = function () {
        return this.value;
    };
    /** @internal */
    BSONSymbol.prototype.inspect = function () {
        return "new BSONSymbol(\"" + this.value + "\")";
    };
    /** @internal */
    BSONSymbol.prototype.toJSON = function () {
        return this.value;
    };
    /** @internal */
    BSONSymbol.prototype.toExtendedJSON = function () {
        return { $symbol: this.value };
    };
    /** @internal */
    BSONSymbol.fromExtendedJSON = function (doc) {
        return new BSONSymbol(doc.$symbol);
    };
    /** @internal */
    BSONSymbol.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    return BSONSymbol;
}());
exports.BSONSymbol = BSONSymbol;
Object.defineProperty(BSONSymbol.prototype, '_bsontype', { value: 'Symbol' });

});

unwrapExports(symbol);
symbol.BSONSymbol;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

/* global Reflect, Promise */
var _extendStatics = function extendStatics(d, b) {
  _extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) {
      if (b.hasOwnProperty(p)) d[p] = b[p];
    }
  };

  return _extendStatics(d, b);
};

function __extends(d, b) {
  _extendStatics(d, b);

  function __() {
    this.constructor = d;
  }

  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var _assign = function __assign() {
  _assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return _assign.apply(this, arguments);
};
function __rest(s, e) {
  var t = {};

  for (var p in s) {
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  }

  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
}
function __decorate(decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if ((typeof Reflect === "undefined" ? "undefined" : babelHelpers["typeof"](Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
    if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  }
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex);
  };
}
function __metadata(metadataKey, metadataValue) {
  if ((typeof Reflect === "undefined" ? "undefined" : babelHelpers["typeof"](Reflect)) === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
}
function __createBinding(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
}
function __exportStar(m, exports) {
  for (var p in m) {
    if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
  }
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator,
      m = s && o[s],
      i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function next() {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
      r,
      ar = [],
      e;

  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
      ar.push(r.value);
    }
  } catch (error) {
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }

  return ar;
}
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++) {
    ar = ar.concat(__read(arguments[i]));
  }

  return ar;
}
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) {
    s += arguments[i].length;
  }

  for (var r = Array(s), k = 0, i = 0; i < il; i++) {
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) {
      r[k] = a[j];
    }
  }

  return r;
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []),
      i,
      q = [];
  return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () {
    return this;
  }, i;

  function verb(n) {
    if (g[n]) i[n] = function (v) {
      return new Promise(function (a, b) {
        q.push([n, v, a, b]) > 1 || resume(n, v);
      });
    };
  }

  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }

  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }

  function fulfill(value) {
    resume("next", value);
  }

  function reject(value) {
    resume("throw", value);
  }

  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
}
function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) {
    throw e;
  }), verb("return"), i[Symbol.iterator] = function () {
    return this;
  }, i;

  function verb(n, f) {
    i[n] = o[n] ? function (v) {
      return (p = !p) ? {
        value: __await(o[n](v)),
        done: n === "return"
      } : f ? f(v) : v;
    } : f;
  }
}
function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator],
      i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () {
    return this;
  }, i);

  function verb(n) {
    i[n] = o[n] && function (v) {
      return new Promise(function (resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }

  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function (v) {
      resolve({
        value: v,
        done: d
      });
    }, reject);
  }
}
function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) {
    Object.defineProperty(cooked, "raw", {
      value: raw
    });
  } else {
    cooked.raw = raw;
  }

  return cooked;
}
function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  }
  result["default"] = mod;
  return result;
}
function __importDefault(mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
}
function __classPrivateFieldGet(receiver, privateMap) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to get private field on non-instance");
  }

  return privateMap.get(receiver);
}
function __classPrivateFieldSet(receiver, privateMap, value) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to set private field on non-instance");
  }

  privateMap.set(receiver, value);
  return value;
}

var tslib_es6 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	__extends: __extends,
	get __assign () { return _assign; },
	__rest: __rest,
	__decorate: __decorate,
	__param: __param,
	__metadata: __metadata,
	__awaiter: __awaiter,
	__generator: __generator,
	__createBinding: __createBinding,
	__exportStar: __exportStar,
	__values: __values,
	__read: __read,
	__spread: __spread,
	__spreadArrays: __spreadArrays,
	__await: __await,
	__asyncGenerator: __asyncGenerator,
	__asyncDelegator: __asyncDelegator,
	__asyncValues: __asyncValues,
	__makeTemplateObject: __makeTemplateObject,
	__importStar: __importStar,
	__importDefault: __importDefault,
	__classPrivateFieldGet: __classPrivateFieldGet,
	__classPrivateFieldSet: __classPrivateFieldSet
});

var timestamp = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timestamp = exports.LongWithoutOverridesClass = void 0;


/** @public */
exports.LongWithoutOverridesClass = long_1.Long;
/** @public */
var Timestamp = /** @class */ (function (_super) {
    tslib_es6.__extends(Timestamp, _super);
    function Timestamp(low, high) {
        var _this = this;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        ///@ts-expect-error
        if (!(_this instanceof Timestamp))
            return new Timestamp(low, high);
        if (long_1.Long.isLong(low)) {
            _this = _super.call(this, low.low, low.high, true) || this;
        }
        else {
            _this = _super.call(this, low, high, true) || this;
        }
        Object.defineProperty(_this, '_bsontype', {
            value: 'Timestamp',
            writable: false,
            configurable: false,
            enumerable: false
        });
        return _this;
    }
    Timestamp.prototype.toJSON = function () {
        return {
            $timestamp: this.toString()
        };
    };
    /** Returns a Timestamp represented by the given (32-bit) integer value. */
    Timestamp.fromInt = function (value) {
        return new Timestamp(long_1.Long.fromInt(value, true));
    };
    /** Returns a Timestamp representing the given number value, provided that it is a finite number. Otherwise, zero is returned. */
    Timestamp.fromNumber = function (value) {
        return new Timestamp(long_1.Long.fromNumber(value, true));
    };
    /**
     * Returns a Timestamp for the given high and low bits. Each is assumed to use 32 bits.
     *
     * @param lowBits - the low 32-bits.
     * @param highBits - the high 32-bits.
     */
    Timestamp.fromBits = function (lowBits, highBits) {
        return new Timestamp(lowBits, highBits);
    };
    /**
     * Returns a Timestamp from the given string, optionally using the given radix.
     *
     * @param str - the textual representation of the Timestamp.
     * @param optRadix - the radix in which the text is written.
     */
    Timestamp.fromString = function (str, optRadix) {
        return new Timestamp(long_1.Long.fromString(str, true, optRadix));
    };
    /** @internal */
    Timestamp.prototype.toExtendedJSON = function () {
        return { $timestamp: { t: this.high >>> 0, i: this.low >>> 0 } };
    };
    /** @internal */
    Timestamp.fromExtendedJSON = function (doc) {
        return new Timestamp(doc.$timestamp.i, doc.$timestamp.t);
    };
    /** @internal */
    Timestamp.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
        return this.inspect();
    };
    Timestamp.prototype.inspect = function () {
        return "new Timestamp(" + this.getLowBits().toString() + ", " + this.getHighBits().toString() + ")";
    };
    Timestamp.MAX_VALUE = long_1.Long.MAX_UNSIGNED_VALUE;
    return Timestamp;
}(exports.LongWithoutOverridesClass));
exports.Timestamp = Timestamp;

});

unwrapExports(timestamp);
timestamp.Timestamp;
timestamp.LongWithoutOverridesClass;

var extended_json = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.EJSON = exports.isBSONType = void 0;














function isBSONType(value) {
    return (utils.isObjectLike(value) && Reflect.has(value, '_bsontype') && typeof value._bsontype === 'string');
}
exports.isBSONType = isBSONType;
// INT32 boundaries
var BSON_INT32_MAX = 0x7fffffff;
var BSON_INT32_MIN = -0x80000000;
// INT64 boundaries
var BSON_INT64_MAX = 0x7fffffffffffffff;
var BSON_INT64_MIN = -0x8000000000000000;
// all the types where we don't need to do any special processing and can just pass the EJSON
//straight to type.fromExtendedJSON
var keysToCodecs = {
    $oid: objectid.ObjectId,
    $binary: binary.Binary,
    $uuid: binary.Binary,
    $symbol: symbol.BSONSymbol,
    $numberInt: int_32.Int32,
    $numberDecimal: decimal128.Decimal128,
    $numberDouble: double_1.Double,
    $numberLong: long_1.Long,
    $minKey: min_key.MinKey,
    $maxKey: max_key.MaxKey,
    $regex: regexp.BSONRegExp,
    $regularExpression: regexp.BSONRegExp,
    $timestamp: timestamp.Timestamp
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deserializeValue(value, options) {
    if (options === void 0) { options = {}; }
    if (typeof value === 'number') {
        if (options.relaxed || options.legacy) {
            return value;
        }
        // if it's an integer, should interpret as smallest BSON integer
        // that can represent it exactly. (if out of range, interpret as double.)
        if (Math.floor(value) === value) {
            if (value >= BSON_INT32_MIN && value <= BSON_INT32_MAX)
                return new int_32.Int32(value);
            if (value >= BSON_INT64_MIN && value <= BSON_INT64_MAX)
                return long_1.Long.fromNumber(value);
        }
        // If the number is a non-integer or out of integer range, should interpret as BSON Double.
        return new double_1.Double(value);
    }
    // from here on out we're looking for bson types, so bail if its not an object
    if (value == null || typeof value !== 'object')
        return value;
    // upgrade deprecated undefined to null
    if (value.$undefined)
        return null;
    var keys = Object.keys(value).filter(function (k) { return k.startsWith('$') && value[k] != null; });
    for (var i = 0; i < keys.length; i++) {
        var c = keysToCodecs[keys[i]];
        if (c)
            return c.fromExtendedJSON(value, options);
    }
    if (value.$date != null) {
        var d = value.$date;
        var date = new Date();
        if (options.legacy) {
            if (typeof d === 'number')
                date.setTime(d);
            else if (typeof d === 'string')
                date.setTime(Date.parse(d));
        }
        else {
            if (typeof d === 'string')
                date.setTime(Date.parse(d));
            else if (long_1.Long.isLong(d))
                date.setTime(d.toNumber());
            else if (typeof d === 'number' && options.relaxed)
                date.setTime(d);
        }
        return date;
    }
    if (value.$code != null) {
        var copy = Object.assign({}, value);
        if (value.$scope) {
            copy.$scope = deserializeValue(value.$scope);
        }
        return code.Code.fromExtendedJSON(value);
    }
    if (value.$ref != null || value.$dbPointer != null) {
        var v = value.$ref ? value : value.$dbPointer;
        // we run into this in a "degenerate EJSON" case (with $id and $ref order flipped)
        // because of the order JSON.parse goes through the document
        if (v instanceof db_ref.DBRef)
            return v;
        var dollarKeys = Object.keys(v).filter(function (k) { return k.startsWith('$'); });
        var valid_1 = true;
        dollarKeys.forEach(function (k) {
            if (['$ref', '$id', '$db'].indexOf(k) === -1)
                valid_1 = false;
        });
        // only make DBRef if $ keys are all valid
        if (valid_1)
            return db_ref.DBRef.fromExtendedJSON(v);
    }
    return value;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeArray(array, options) {
    return array.map(function (v, index) {
        options.seenObjects.push({ propertyName: "index " + index, obj: null });
        try {
            return serializeValue(v, options);
        }
        finally {
            options.seenObjects.pop();
        }
    });
}
function getISOString(date) {
    var isoStr = date.toISOString();
    // we should only show milliseconds in timestamp if they're non-zero
    return date.getUTCMilliseconds() !== 0 ? isoStr : isoStr.slice(0, -5) + 'Z';
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeValue(value, options) {
    if ((typeof value === 'object' || typeof value === 'function') && value !== null) {
        var index = options.seenObjects.findIndex(function (entry) { return entry.obj === value; });
        if (index !== -1) {
            var props = options.seenObjects.map(function (entry) { return entry.propertyName; });
            var leadingPart = props
                .slice(0, index)
                .map(function (prop) { return prop + " -> "; })
                .join('');
            var alreadySeen = props[index];
            var circularPart = ' -> ' +
                props
                    .slice(index + 1, props.length - 1)
                    .map(function (prop) { return prop + " -> "; })
                    .join('');
            var current = props[props.length - 1];
            var leadingSpace = ' '.repeat(leadingPart.length + alreadySeen.length / 2);
            var dashes = '-'.repeat(circularPart.length + (alreadySeen.length + current.length) / 2 - 1);
            throw new TypeError('Converting circular structure to EJSON:\n' +
                ("    " + leadingPart + alreadySeen + circularPart + current + "\n") +
                ("    " + leadingSpace + "\\" + dashes + "/"));
        }
        options.seenObjects[options.seenObjects.length - 1].obj = value;
    }
    if (Array.isArray(value))
        return serializeArray(value, options);
    if (value === undefined)
        return null;
    if (value instanceof Date || utils.isDate(value)) {
        var dateNum = value.getTime(), 
        // is it in year range 1970-9999?
        inRange = dateNum > -1 && dateNum < 253402318800000;
        if (options.legacy) {
            return options.relaxed && inRange
                ? { $date: value.getTime() }
                : { $date: getISOString(value) };
        }
        return options.relaxed && inRange
            ? { $date: getISOString(value) }
            : { $date: { $numberLong: value.getTime().toString() } };
    }
    if (typeof value === 'number' && !options.relaxed) {
        // it's an integer
        if (Math.floor(value) === value) {
            var int32Range = value >= BSON_INT32_MIN && value <= BSON_INT32_MAX, int64Range = value >= BSON_INT64_MIN && value <= BSON_INT64_MAX;
            // interpret as being of the smallest BSON integer type that can represent the number exactly
            if (int32Range)
                return { $numberInt: value.toString() };
            if (int64Range)
                return { $numberLong: value.toString() };
        }
        return { $numberDouble: value.toString() };
    }
    if (value instanceof RegExp || utils.isRegExp(value)) {
        var flags = value.flags;
        if (flags === undefined) {
            var match = value.toString().match(/[gimuy]*$/);
            if (match) {
                flags = match[0];
            }
        }
        var rx = new regexp.BSONRegExp(value.source, flags);
        return rx.toExtendedJSON(options);
    }
    if (value != null && typeof value === 'object')
        return serializeDocument(value, options);
    return value;
}
var BSON_TYPE_MAPPINGS = {
    Binary: function (o) { return new binary.Binary(o.value(), o.sub_type); },
    Code: function (o) { return new code.Code(o.code, o.scope); },
    DBRef: function (o) { return new db_ref.DBRef(o.collection || o.namespace, o.oid, o.db, o.fields); },
    Decimal128: function (o) { return new decimal128.Decimal128(o.bytes); },
    Double: function (o) { return new double_1.Double(o.value); },
    Int32: function (o) { return new int_32.Int32(o.value); },
    Long: function (o) {
        return long_1.Long.fromBits(
        // underscore variants for 1.x backwards compatibility
        o.low != null ? o.low : o.low_, o.low != null ? o.high : o.high_, o.low != null ? o.unsigned : o.unsigned_);
    },
    MaxKey: function () { return new max_key.MaxKey(); },
    MinKey: function () { return new min_key.MinKey(); },
    ObjectID: function (o) { return new objectid.ObjectId(o); },
    ObjectId: function (o) { return new objectid.ObjectId(o); },
    BSONRegExp: function (o) { return new regexp.BSONRegExp(o.pattern, o.options); },
    Symbol: function (o) { return new symbol.BSONSymbol(o.value); },
    Timestamp: function (o) { return timestamp.Timestamp.fromBits(o.low, o.high); }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeDocument(doc, options) {
    if (doc == null || typeof doc !== 'object')
        throw new Error('not an object instance');
    var bsontype = doc._bsontype;
    if (typeof bsontype === 'undefined') {
        // It's a regular object. Recursively serialize its property values.
        var _doc = {};
        for (var name in doc) {
            options.seenObjects.push({ propertyName: name, obj: null });
            try {
                _doc[name] = serializeValue(doc[name], options);
            }
            finally {
                options.seenObjects.pop();
            }
        }
        return _doc;
    }
    else if (isBSONType(doc)) {
        // the "document" is really just a BSON type object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var outDoc = doc;
        if (typeof outDoc.toExtendedJSON !== 'function') {
            // There's no EJSON serialization function on the object. It's probably an
            // object created by a previous version of this library (or another library)
            // that's duck-typing objects to look like they were generated by this library).
            // Copy the object into this library's version of that type.
            var mapper = BSON_TYPE_MAPPINGS[doc._bsontype];
            if (!mapper) {
                throw new TypeError('Unrecognized or invalid _bsontype: ' + doc._bsontype);
            }
            outDoc = mapper(outDoc);
        }
        // Two BSON types may have nested objects that may need to be serialized too
        if (bsontype === 'Code' && outDoc.scope) {
            outDoc = new code.Code(outDoc.code, serializeValue(outDoc.scope, options));
        }
        else if (bsontype === 'DBRef' && outDoc.oid) {
            outDoc = new db_ref.DBRef(outDoc.collection, serializeValue(outDoc.oid, options), outDoc.db, outDoc.fields);
        }
        return outDoc.toExtendedJSON(options);
    }
    else {
        throw new Error('_bsontype must be a string, but was: ' + typeof bsontype);
    }
}
(function (EJSON) {
    /**
     * Parse an Extended JSON string, constructing the JavaScript value or object described by that
     * string.
     *
     * @example
     * ```js
     * const { EJSON } = require('bson');
     * const text = '{ "int32": { "$numberInt": "10" } }';
     *
     * // prints { int32: { [String: '10'] _bsontype: 'Int32', value: '10' } }
     * console.log(EJSON.parse(text, { relaxed: false }));
     *
     * // prints { int32: 10 }
     * console.log(EJSON.parse(text));
     * ```
     */
    function parse(text, options) {
        var finalOptions = Object.assign({}, { relaxed: true, legacy: false }, options);
        // relaxed implies not strict
        if (typeof finalOptions.relaxed === 'boolean')
            finalOptions.strict = !finalOptions.relaxed;
        if (typeof finalOptions.strict === 'boolean')
            finalOptions.relaxed = !finalOptions.strict;
        return JSON.parse(text, function (_key, value) { return deserializeValue(value, finalOptions); });
    }
    EJSON.parse = parse;
    /**
     * Converts a BSON document to an Extended JSON string, optionally replacing values if a replacer
     * function is specified or optionally including only the specified properties if a replacer array
     * is specified.
     *
     * @param value - The value to convert to extended JSON
     * @param replacer - A function that alters the behavior of the stringification process, or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON string. If this value is null or not provided, all properties of the object are included in the resulting JSON string
     * @param space - A String or Number object that's used to insert white space into the output JSON string for readability purposes.
     * @param options - Optional settings
     *
     * @example
     * ```js
     * const { EJSON } = require('bson');
     * const Int32 = require('mongodb').Int32;
     * const doc = { int32: new Int32(10) };
     *
     * // prints '{"int32":{"$numberInt":"10"}}'
     * console.log(EJSON.stringify(doc, { relaxed: false }));
     *
     * // prints '{"int32":10}'
     * console.log(EJSON.stringify(doc));
     * ```
     */
    function stringify(value, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    replacer, space, options) {
        if (space != null && typeof space === 'object') {
            options = space;
            space = 0;
        }
        if (replacer != null && typeof replacer === 'object' && !Array.isArray(replacer)) {
            options = replacer;
            replacer = undefined;
            space = 0;
        }
        var serializeOptions = Object.assign({ relaxed: true, legacy: false }, options, {
            seenObjects: [{ propertyName: '(root)', obj: null }]
        });
        var doc = serializeValue(value, serializeOptions);
        return JSON.stringify(doc, replacer, space);
    }
    EJSON.stringify = stringify;
    /**
     * Serializes an object to an Extended JSON string, and reparse it as a JavaScript object.
     *
     * @param value - The object to serialize
     * @param options - Optional settings passed to the `stringify` function
     */
    function serialize(value, options) {
        options = options || {};
        return JSON.parse(stringify(value, options));
    }
    EJSON.serialize = serialize;
    /**
     * Deserializes an Extended JSON object into a plain JavaScript object with native/BSON types
     *
     * @param ejson - The Extended JSON object to deserialize
     * @param options - Optional settings passed to the parse method
     */
    function deserialize(ejson, options) {
        options = options || {};
        return parse(JSON.stringify(ejson), options);
    }
    EJSON.deserialize = deserialize;
})(exports.EJSON || (exports.EJSON = {}));

});

unwrapExports(extended_json);
extended_json.EJSON;
extended_json.isBSONType;

var map = createCommonjsModule(function (module, exports) {
/* eslint-disable @typescript-eslint/no-explicit-any */
// We have an ES6 Map available, return the native instance
Object.defineProperty(exports, "__esModule", { value: true });
exports.Map = void 0;
/** @public */
var bsonMap;
exports.Map = bsonMap;
var check = function (potentialGlobal) {
    // eslint-disable-next-line eqeqeq
    return potentialGlobal && potentialGlobal.Math == Math && potentialGlobal;
};
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
function getGlobal() {
    // eslint-disable-next-line no-undef
    return (check(typeof globalThis === 'object' && globalThis) ||
        check(typeof window === 'object' && window) ||
        check(typeof self === 'object' && self) ||
        check(typeof commonjsGlobal === 'object' && commonjsGlobal) ||
        Function('return this')());
}
var bsonGlobal = getGlobal();
if (Object.prototype.hasOwnProperty.call(bsonGlobal, 'Map')) {
    exports.Map = bsonMap = bsonGlobal.Map;
}
else {
    // We will return a polyfill
    exports.Map = bsonMap = /** @class */ (function () {
        function Map(array) {
            if (array === void 0) { array = []; }
            this._keys = [];
            this._values = {};
            for (var i = 0; i < array.length; i++) {
                if (array[i] == null)
                    continue; // skip null and undefined
                var entry = array[i];
                var key = entry[0];
                var value = entry[1];
                // Add the key to the list of keys in order
                this._keys.push(key);
                // Add the key and value to the values dictionary with a point
                // to the location in the ordered keys list
                this._values[key] = { v: value, i: this._keys.length - 1 };
            }
        }
        Map.prototype.clear = function () {
            this._keys = [];
            this._values = {};
        };
        Map.prototype.delete = function (key) {
            var value = this._values[key];
            if (value == null)
                return false;
            // Delete entry
            delete this._values[key];
            // Remove the key from the ordered keys list
            this._keys.splice(value.i, 1);
            return true;
        };
        Map.prototype.entries = function () {
            var _this = this;
            var index = 0;
            return {
                next: function () {
                    var key = _this._keys[index++];
                    return {
                        value: key !== undefined ? [key, _this._values[key].v] : undefined,
                        done: key !== undefined ? false : true
                    };
                }
            };
        };
        Map.prototype.forEach = function (callback, self) {
            self = self || this;
            for (var i = 0; i < this._keys.length; i++) {
                var key = this._keys[i];
                // Call the forEach callback
                callback.call(self, this._values[key].v, key, self);
            }
        };
        Map.prototype.get = function (key) {
            return this._values[key] ? this._values[key].v : undefined;
        };
        Map.prototype.has = function (key) {
            return this._values[key] != null;
        };
        Map.prototype.keys = function () {
            var _this = this;
            var index = 0;
            return {
                next: function () {
                    var key = _this._keys[index++];
                    return {
                        value: key !== undefined ? key : undefined,
                        done: key !== undefined ? false : true
                    };
                }
            };
        };
        Map.prototype.set = function (key, value) {
            if (this._values[key]) {
                this._values[key].v = value;
                return this;
            }
            // Add the key to the list of keys in order
            this._keys.push(key);
            // Add the key and value to the values dictionary with a point
            // to the location in the ordered keys list
            this._values[key] = { v: value, i: this._keys.length - 1 };
            return this;
        };
        Map.prototype.values = function () {
            var _this = this;
            var index = 0;
            return {
                next: function () {
                    var key = _this._keys[index++];
                    return {
                        value: key !== undefined ? _this._values[key].v : undefined,
                        done: key !== undefined ? false : true
                    };
                }
            };
        };
        Object.defineProperty(Map.prototype, "size", {
            get: function () {
                return this._keys.length;
            },
            enumerable: false,
            configurable: true
        });
        return Map;
    }());
}

});

unwrapExports(map);
map.Map;

var constants = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.BSON_BINARY_SUBTYPE_USER_DEFINED = exports.BSON_BINARY_SUBTYPE_MD5 = exports.BSON_BINARY_SUBTYPE_UUID_NEW = exports.BSON_BINARY_SUBTYPE_UUID = exports.BSON_BINARY_SUBTYPE_BYTE_ARRAY = exports.BSON_BINARY_SUBTYPE_FUNCTION = exports.BSON_BINARY_SUBTYPE_DEFAULT = exports.BSON_DATA_MAX_KEY = exports.BSON_DATA_MIN_KEY = exports.BSON_DATA_DECIMAL128 = exports.BSON_DATA_LONG = exports.BSON_DATA_TIMESTAMP = exports.BSON_DATA_INT = exports.BSON_DATA_CODE_W_SCOPE = exports.BSON_DATA_SYMBOL = exports.BSON_DATA_CODE = exports.BSON_DATA_DBPOINTER = exports.BSON_DATA_REGEXP = exports.BSON_DATA_NULL = exports.BSON_DATA_DATE = exports.BSON_DATA_BOOLEAN = exports.BSON_DATA_OID = exports.BSON_DATA_UNDEFINED = exports.BSON_DATA_BINARY = exports.BSON_DATA_ARRAY = exports.BSON_DATA_OBJECT = exports.BSON_DATA_STRING = exports.BSON_DATA_NUMBER = exports.JS_INT_MIN = exports.JS_INT_MAX = exports.BSON_INT64_MIN = exports.BSON_INT64_MAX = exports.BSON_INT32_MIN = exports.BSON_INT32_MAX = void 0;
/** @internal */
exports.BSON_INT32_MAX = 0x7fffffff;
/** @internal */
exports.BSON_INT32_MIN = -0x80000000;
/** @internal */
exports.BSON_INT64_MAX = Math.pow(2, 63) - 1;
/** @internal */
exports.BSON_INT64_MIN = -Math.pow(2, 63);
/**
 * Any integer up to 2^53 can be precisely represented by a double.
 * @internal
 */
exports.JS_INT_MAX = Math.pow(2, 53);
/**
 * Any integer down to -2^53 can be precisely represented by a double.
 * @internal
 */
exports.JS_INT_MIN = -Math.pow(2, 53);
/** Number BSON Type @internal */
exports.BSON_DATA_NUMBER = 1;
/** String BSON Type @internal */
exports.BSON_DATA_STRING = 2;
/** Object BSON Type @internal */
exports.BSON_DATA_OBJECT = 3;
/** Array BSON Type @internal */
exports.BSON_DATA_ARRAY = 4;
/** Binary BSON Type @internal */
exports.BSON_DATA_BINARY = 5;
/** Binary BSON Type @internal */
exports.BSON_DATA_UNDEFINED = 6;
/** ObjectId BSON Type @internal */
exports.BSON_DATA_OID = 7;
/** Boolean BSON Type @internal */
exports.BSON_DATA_BOOLEAN = 8;
/** Date BSON Type @internal */
exports.BSON_DATA_DATE = 9;
/** null BSON Type @internal */
exports.BSON_DATA_NULL = 10;
/** RegExp BSON Type @internal */
exports.BSON_DATA_REGEXP = 11;
/** Code BSON Type @internal */
exports.BSON_DATA_DBPOINTER = 12;
/** Code BSON Type @internal */
exports.BSON_DATA_CODE = 13;
/** Symbol BSON Type @internal */
exports.BSON_DATA_SYMBOL = 14;
/** Code with Scope BSON Type @internal */
exports.BSON_DATA_CODE_W_SCOPE = 15;
/** 32 bit Integer BSON Type @internal */
exports.BSON_DATA_INT = 16;
/** Timestamp BSON Type @internal */
exports.BSON_DATA_TIMESTAMP = 17;
/** Long BSON Type @internal */
exports.BSON_DATA_LONG = 18;
/** Decimal128 BSON Type @internal */
exports.BSON_DATA_DECIMAL128 = 19;
/** MinKey BSON Type @internal */
exports.BSON_DATA_MIN_KEY = 0xff;
/** MaxKey BSON Type @internal */
exports.BSON_DATA_MAX_KEY = 0x7f;
/** Binary Default Type @internal */
exports.BSON_BINARY_SUBTYPE_DEFAULT = 0;
/** Binary Function Type @internal */
exports.BSON_BINARY_SUBTYPE_FUNCTION = 1;
/** Binary Byte Array Type @internal */
exports.BSON_BINARY_SUBTYPE_BYTE_ARRAY = 2;
/** Binary Deprecated UUID Type @deprecated Please use BSON_BINARY_SUBTYPE_UUID_NEW @internal */
exports.BSON_BINARY_SUBTYPE_UUID = 3;
/** Binary UUID Type @internal */
exports.BSON_BINARY_SUBTYPE_UUID_NEW = 4;
/** Binary MD5 Type @internal */
exports.BSON_BINARY_SUBTYPE_MD5 = 5;
/** Binary User Defined Type @internal */
exports.BSON_BINARY_SUBTYPE_USER_DEFINED = 128;

});

unwrapExports(constants);
constants.BSON_BINARY_SUBTYPE_USER_DEFINED;
constants.BSON_BINARY_SUBTYPE_MD5;
constants.BSON_BINARY_SUBTYPE_UUID_NEW;
constants.BSON_BINARY_SUBTYPE_UUID;
constants.BSON_BINARY_SUBTYPE_BYTE_ARRAY;
constants.BSON_BINARY_SUBTYPE_FUNCTION;
constants.BSON_BINARY_SUBTYPE_DEFAULT;
constants.BSON_DATA_MAX_KEY;
constants.BSON_DATA_MIN_KEY;
constants.BSON_DATA_DECIMAL128;
constants.BSON_DATA_LONG;
constants.BSON_DATA_TIMESTAMP;
constants.BSON_DATA_INT;
constants.BSON_DATA_CODE_W_SCOPE;
constants.BSON_DATA_SYMBOL;
constants.BSON_DATA_CODE;
constants.BSON_DATA_DBPOINTER;
constants.BSON_DATA_REGEXP;
constants.BSON_DATA_NULL;
constants.BSON_DATA_DATE;
constants.BSON_DATA_BOOLEAN;
constants.BSON_DATA_OID;
constants.BSON_DATA_UNDEFINED;
constants.BSON_DATA_BINARY;
constants.BSON_DATA_ARRAY;
constants.BSON_DATA_OBJECT;
constants.BSON_DATA_STRING;
constants.BSON_DATA_NUMBER;
constants.JS_INT_MIN;
constants.JS_INT_MAX;
constants.BSON_INT64_MIN;
constants.BSON_INT64_MAX;
constants.BSON_INT32_MIN;
constants.BSON_INT32_MAX;

var calculate_size = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateObjectSize = void 0;




function calculateObjectSize(object, serializeFunctions, ignoreUndefined) {
    var totalLength = 4 + 1;
    if (Array.isArray(object)) {
        for (var i = 0; i < object.length; i++) {
            totalLength += calculateElement(i.toString(), object[i], serializeFunctions, true, ignoreUndefined);
        }
    }
    else {
        // If we have toBSON defined, override the current object
        if (object.toBSON) {
            object = object.toBSON();
        }
        // Calculate size
        for (var key in object) {
            totalLength += calculateElement(key, object[key], serializeFunctions, false, ignoreUndefined);
        }
    }
    return totalLength;
}
exports.calculateObjectSize = calculateObjectSize;
/** @internal */
function calculateElement(name, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
value, serializeFunctions, isArray, ignoreUndefined) {
    if (serializeFunctions === void 0) { serializeFunctions = false; }
    if (isArray === void 0) { isArray = false; }
    if (ignoreUndefined === void 0) { ignoreUndefined = false; }
    // If we have toBSON defined, override the current object
    if (value && value.toBSON) {
        value = value.toBSON();
    }
    switch (typeof value) {
        case 'string':
            return 1 + buffer.Buffer.byteLength(name, 'utf8') + 1 + 4 + buffer.Buffer.byteLength(value, 'utf8') + 1;
        case 'number':
            if (Math.floor(value) === value &&
                value >= constants.JS_INT_MIN &&
                value <= constants.JS_INT_MAX) {
                if (value >= constants.BSON_INT32_MIN && value <= constants.BSON_INT32_MAX) {
                    // 32 bit
                    return (name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) + (4 + 1);
                }
                else {
                    return (name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) + (8 + 1);
                }
            }
            else {
                // 64 bit
                return (name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) + (8 + 1);
            }
        case 'undefined':
            if (isArray || !ignoreUndefined)
                return (name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) + 1;
            return 0;
        case 'boolean':
            return (name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) + (1 + 1);
        case 'object':
            if (value == null || value['_bsontype'] === 'MinKey' || value['_bsontype'] === 'MaxKey') {
                return (name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) + 1;
            }
            else if (value['_bsontype'] === 'ObjectId' || value['_bsontype'] === 'ObjectID') {
                return (name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) + (12 + 1);
            }
            else if (value instanceof Date || utils.isDate(value)) {
                return (name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) + (8 + 1);
            }
            else if (ArrayBuffer.isView(value) ||
                value instanceof ArrayBuffer ||
                utils.isAnyArrayBuffer(value)) {
                return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) + (1 + 4 + 1) + value.byteLength);
            }
            else if (value['_bsontype'] === 'Long' ||
                value['_bsontype'] === 'Double' ||
                value['_bsontype'] === 'Timestamp') {
                return (name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) + (8 + 1);
            }
            else if (value['_bsontype'] === 'Decimal128') {
                return (name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) + (16 + 1);
            }
            else if (value['_bsontype'] === 'Code') {
                // Calculate size depending on the availability of a scope
                if (value.scope != null && Object.keys(value.scope).length > 0) {
                    return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) +
                        1 +
                        4 +
                        4 +
                        buffer.Buffer.byteLength(value.code.toString(), 'utf8') +
                        1 +
                        calculateObjectSize(value.scope, serializeFunctions, ignoreUndefined));
                }
                else {
                    return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) +
                        1 +
                        4 +
                        buffer.Buffer.byteLength(value.code.toString(), 'utf8') +
                        1);
                }
            }
            else if (value['_bsontype'] === 'Binary') {
                // Check what kind of subtype we have
                if (value.sub_type === binary.Binary.SUBTYPE_BYTE_ARRAY) {
                    return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) +
                        (value.position + 1 + 4 + 1 + 4));
                }
                else {
                    return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) + (value.position + 1 + 4 + 1));
                }
            }
            else if (value['_bsontype'] === 'Symbol') {
                return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) +
                    buffer.Buffer.byteLength(value.value, 'utf8') +
                    4 +
                    1 +
                    1);
            }
            else if (value['_bsontype'] === 'DBRef') {
                // Set up correct object for serialization
                var ordered_values = Object.assign({
                    $ref: value.collection,
                    $id: value.oid
                }, value.fields);
                // Add db reference if it exists
                if (value.db != null) {
                    ordered_values['$db'] = value.db;
                }
                return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) +
                    1 +
                    calculateObjectSize(ordered_values, serializeFunctions, ignoreUndefined));
            }
            else if (value instanceof RegExp || utils.isRegExp(value)) {
                return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) +
                    1 +
                    buffer.Buffer.byteLength(value.source, 'utf8') +
                    1 +
                    (value.global ? 1 : 0) +
                    (value.ignoreCase ? 1 : 0) +
                    (value.multiline ? 1 : 0) +
                    1);
            }
            else if (value['_bsontype'] === 'BSONRegExp') {
                return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) +
                    1 +
                    buffer.Buffer.byteLength(value.pattern, 'utf8') +
                    1 +
                    buffer.Buffer.byteLength(value.options, 'utf8') +
                    1);
            }
            else {
                return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) +
                    calculateObjectSize(value, serializeFunctions, ignoreUndefined) +
                    1);
            }
        case 'function':
            // WTF for 0.4.X where typeof /someregexp/ === 'function'
            if (value instanceof RegExp || utils.isRegExp(value) || String.call(value) === '[object RegExp]') {
                return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) +
                    1 +
                    buffer.Buffer.byteLength(value.source, 'utf8') +
                    1 +
                    (value.global ? 1 : 0) +
                    (value.ignoreCase ? 1 : 0) +
                    (value.multiline ? 1 : 0) +
                    1);
            }
            else {
                if (serializeFunctions && value.scope != null && Object.keys(value.scope).length > 0) {
                    return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) +
                        1 +
                        4 +
                        4 +
                        buffer.Buffer.byteLength(utils.normalizedFunctionString(value), 'utf8') +
                        1 +
                        calculateObjectSize(value.scope, serializeFunctions, ignoreUndefined));
                }
                else if (serializeFunctions) {
                    return ((name != null ? buffer.Buffer.byteLength(name, 'utf8') + 1 : 0) +
                        1 +
                        4 +
                        buffer.Buffer.byteLength(utils.normalizedFunctionString(value), 'utf8') +
                        1);
                }
            }
    }
    return 0;
}

});

unwrapExports(calculate_size);
calculate_size.calculateObjectSize;

var validate_utf8 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUtf8 = void 0;
var FIRST_BIT = 0x80;
var FIRST_TWO_BITS = 0xc0;
var FIRST_THREE_BITS = 0xe0;
var FIRST_FOUR_BITS = 0xf0;
var FIRST_FIVE_BITS = 0xf8;
var TWO_BIT_CHAR = 0xc0;
var THREE_BIT_CHAR = 0xe0;
var FOUR_BIT_CHAR = 0xf0;
var CONTINUING_CHAR = 0x80;
/**
 * Determines if the passed in bytes are valid utf8
 * @param bytes - An array of 8-bit bytes. Must be indexable and have length property
 * @param start - The index to start validating
 * @param end - The index to end validating
 */
function validateUtf8(bytes, start, end) {
    var continuation = 0;
    for (var i = start; i < end; i += 1) {
        var byte = bytes[i];
        if (continuation) {
            if ((byte & FIRST_TWO_BITS) !== CONTINUING_CHAR) {
                return false;
            }
            continuation -= 1;
        }
        else if (byte & FIRST_BIT) {
            if ((byte & FIRST_THREE_BITS) === TWO_BIT_CHAR) {
                continuation = 1;
            }
            else if ((byte & FIRST_FOUR_BITS) === THREE_BIT_CHAR) {
                continuation = 2;
            }
            else if ((byte & FIRST_FIVE_BITS) === FOUR_BIT_CHAR) {
                continuation = 3;
            }
            else {
                return false;
            }
        }
    }
    return !continuation;
}
exports.validateUtf8 = validateUtf8;

});

unwrapExports(validate_utf8);
validate_utf8.validateUtf8;

var deserializer = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserialize = void 0;
















// Internal long versions
var JS_INT_MAX_LONG = long_1.Long.fromNumber(constants.JS_INT_MAX);
var JS_INT_MIN_LONG = long_1.Long.fromNumber(constants.JS_INT_MIN);
var functionCache = {};
function deserialize(buffer, options, isArray) {
    options = options == null ? {} : options;
    var index = options && options.index ? options.index : 0;
    // Read the document size
    var size = buffer[index] |
        (buffer[index + 1] << 8) |
        (buffer[index + 2] << 16) |
        (buffer[index + 3] << 24);
    if (size < 5) {
        throw new Error("bson size must be >= 5, is " + size);
    }
    if (options.allowObjectSmallerThanBufferSize && buffer.length < size) {
        throw new Error("buffer length " + buffer.length + " must be >= bson size " + size);
    }
    if (!options.allowObjectSmallerThanBufferSize && buffer.length !== size) {
        throw new Error("buffer length " + buffer.length + " must === bson size " + size);
    }
    if (size + index > buffer.byteLength) {
        throw new Error("(bson size " + size + " + options.index " + index + " must be <= buffer length " + buffer.byteLength + ")");
    }
    // Illegal end value
    if (buffer[index + size - 1] !== 0) {
        throw new Error("One object, sized correctly, with a spot for an EOO, but the EOO isn't 0x00");
    }
    // Start deserializtion
    return deserializeObject(buffer, index, options, isArray);
}
exports.deserialize = deserialize;
function deserializeObject(buffer$1, index, options, isArray) {
    if (isArray === void 0) { isArray = false; }
    var evalFunctions = options['evalFunctions'] == null ? false : options['evalFunctions'];
    var cacheFunctions = options['cacheFunctions'] == null ? false : options['cacheFunctions'];
    var fieldsAsRaw = options['fieldsAsRaw'] == null ? null : options['fieldsAsRaw'];
    // Return raw bson buffer instead of parsing it
    var raw = options['raw'] == null ? false : options['raw'];
    // Return BSONRegExp objects instead of native regular expressions
    var bsonRegExp = typeof options['bsonRegExp'] === 'boolean' ? options['bsonRegExp'] : false;
    // Controls the promotion of values vs wrapper classes
    var promoteBuffers = options['promoteBuffers'] == null ? false : options['promoteBuffers'];
    var promoteLongs = options['promoteLongs'] == null ? true : options['promoteLongs'];
    var promoteValues = options['promoteValues'] == null ? true : options['promoteValues'];
    // Set the start index
    var startIndex = index;
    // Validate that we have at least 4 bytes of buffer
    if (buffer$1.length < 5)
        throw new Error('corrupt bson message < 5 bytes long');
    // Read the document size
    var size = buffer$1[index++] | (buffer$1[index++] << 8) | (buffer$1[index++] << 16) | (buffer$1[index++] << 24);
    // Ensure buffer is valid size
    if (size < 5 || size > buffer$1.length)
        throw new Error('corrupt bson message');
    // Create holding object
    var object = isArray ? [] : {};
    // Used for arrays to skip having to perform utf8 decoding
    var arrayIndex = 0;
    var done = false;
    // While we have more left data left keep parsing
    while (!done) {
        // Read the type
        var elementType = buffer$1[index++];
        // If we get a zero it's the last byte, exit
        if (elementType === 0)
            break;
        // Get the start search index
        var i = index;
        // Locate the end of the c string
        while (buffer$1[i] !== 0x00 && i < buffer$1.length) {
            i++;
        }
        // If are at the end of the buffer there is a problem with the document
        if (i >= buffer$1.byteLength)
            throw new Error('Bad BSON Document: illegal CString');
        var name = isArray ? arrayIndex++ : buffer$1.toString('utf8', index, i);
        var value = void 0;
        index = i + 1;
        if (elementType === constants.BSON_DATA_STRING) {
            var stringSize = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            if (stringSize <= 0 ||
                stringSize > buffer$1.length - index ||
                buffer$1[index + stringSize - 1] !== 0)
                throw new Error('bad string length in bson');
            if (!validate_utf8.validateUtf8(buffer$1, index, index + stringSize - 1)) {
                throw new Error('Invalid UTF-8 string in BSON document');
            }
            value = buffer$1.toString('utf8', index, index + stringSize - 1);
            index = index + stringSize;
        }
        else if (elementType === constants.BSON_DATA_OID) {
            var oid = buffer.Buffer.alloc(12);
            buffer$1.copy(oid, 0, index, index + 12);
            value = new objectid.ObjectId(oid);
            index = index + 12;
        }
        else if (elementType === constants.BSON_DATA_INT && promoteValues === false) {
            value = new int_32.Int32(buffer$1[index++] | (buffer$1[index++] << 8) | (buffer$1[index++] << 16) | (buffer$1[index++] << 24));
        }
        else if (elementType === constants.BSON_DATA_INT) {
            value =
                buffer$1[index++] |
                    (buffer$1[index++] << 8) |
                    (buffer$1[index++] << 16) |
                    (buffer$1[index++] << 24);
        }
        else if (elementType === constants.BSON_DATA_NUMBER && promoteValues === false) {
            value = new double_1.Double(buffer$1.readDoubleLE(index));
            index = index + 8;
        }
        else if (elementType === constants.BSON_DATA_NUMBER) {
            value = buffer$1.readDoubleLE(index);
            index = index + 8;
        }
        else if (elementType === constants.BSON_DATA_DATE) {
            var lowBits = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            var highBits = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            value = new Date(new long_1.Long(lowBits, highBits).toNumber());
        }
        else if (elementType === constants.BSON_DATA_BOOLEAN) {
            if (buffer$1[index] !== 0 && buffer$1[index] !== 1)
                throw new Error('illegal boolean type value');
            value = buffer$1[index++] === 1;
        }
        else if (elementType === constants.BSON_DATA_OBJECT) {
            var _index = index;
            var objectSize = buffer$1[index] |
                (buffer$1[index + 1] << 8) |
                (buffer$1[index + 2] << 16) |
                (buffer$1[index + 3] << 24);
            if (objectSize <= 0 || objectSize > buffer$1.length - index)
                throw new Error('bad embedded document length in bson');
            // We have a raw value
            if (raw) {
                value = buffer$1.slice(index, index + objectSize);
            }
            else {
                value = deserializeObject(buffer$1, _index, options, false);
            }
            index = index + objectSize;
        }
        else if (elementType === constants.BSON_DATA_ARRAY) {
            var _index = index;
            var objectSize = buffer$1[index] |
                (buffer$1[index + 1] << 8) |
                (buffer$1[index + 2] << 16) |
                (buffer$1[index + 3] << 24);
            var arrayOptions = options;
            // Stop index
            var stopIndex = index + objectSize;
            // All elements of array to be returned as raw bson
            if (fieldsAsRaw && fieldsAsRaw[name]) {
                arrayOptions = {};
                for (var n in options) {
                    arrayOptions[n] = options[n];
                }
                arrayOptions['raw'] = true;
            }
            value = deserializeObject(buffer$1, _index, arrayOptions, true);
            index = index + objectSize;
            if (buffer$1[index - 1] !== 0)
                throw new Error('invalid array terminator byte');
            if (index !== stopIndex)
                throw new Error('corrupted array bson');
        }
        else if (elementType === constants.BSON_DATA_UNDEFINED) {
            value = undefined;
        }
        else if (elementType === constants.BSON_DATA_NULL) {
            value = null;
        }
        else if (elementType === constants.BSON_DATA_LONG) {
            // Unpack the low and high bits
            var lowBits = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            var highBits = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            var long = new long_1.Long(lowBits, highBits);
            // Promote the long if possible
            if (promoteLongs && promoteValues === true) {
                value =
                    long.lessThanOrEqual(JS_INT_MAX_LONG) && long.greaterThanOrEqual(JS_INT_MIN_LONG)
                        ? long.toNumber()
                        : long;
            }
            else {
                value = long;
            }
        }
        else if (elementType === constants.BSON_DATA_DECIMAL128) {
            // Buffer to contain the decimal bytes
            var bytes = buffer.Buffer.alloc(16);
            // Copy the next 16 bytes into the bytes buffer
            buffer$1.copy(bytes, 0, index, index + 16);
            // Update index
            index = index + 16;
            // Assign the new Decimal128 value
            var decimal128$1 = new decimal128.Decimal128(bytes);
            // If we have an alternative mapper use that
            if ('toObject' in decimal128$1 && typeof decimal128$1.toObject === 'function') {
                value = decimal128$1.toObject();
            }
            else {
                value = decimal128$1;
            }
        }
        else if (elementType === constants.BSON_DATA_BINARY) {
            var binarySize = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            var totalBinarySize = binarySize;
            var subType = buffer$1[index++];
            // Did we have a negative binary size, throw
            if (binarySize < 0)
                throw new Error('Negative binary type element size found');
            // Is the length longer than the document
            if (binarySize > buffer$1.byteLength)
                throw new Error('Binary type size larger than document size');
            // Decode as raw Buffer object if options specifies it
            if (buffer$1['slice'] != null) {
                // If we have subtype 2 skip the 4 bytes for the size
                if (subType === binary.Binary.SUBTYPE_BYTE_ARRAY) {
                    binarySize =
                        buffer$1[index++] |
                            (buffer$1[index++] << 8) |
                            (buffer$1[index++] << 16) |
                            (buffer$1[index++] << 24);
                    if (binarySize < 0)
                        throw new Error('Negative binary type element size found for subtype 0x02');
                    if (binarySize > totalBinarySize - 4)
                        throw new Error('Binary type with subtype 0x02 contains too long binary size');
                    if (binarySize < totalBinarySize - 4)
                        throw new Error('Binary type with subtype 0x02 contains too short binary size');
                }
                if (promoteBuffers && promoteValues) {
                    value = buffer$1.slice(index, index + binarySize);
                }
                else {
                    value = new binary.Binary(buffer$1.slice(index, index + binarySize), subType);
                }
            }
            else {
                var _buffer = buffer.Buffer.alloc(binarySize);
                // If we have subtype 2 skip the 4 bytes for the size
                if (subType === binary.Binary.SUBTYPE_BYTE_ARRAY) {
                    binarySize =
                        buffer$1[index++] |
                            (buffer$1[index++] << 8) |
                            (buffer$1[index++] << 16) |
                            (buffer$1[index++] << 24);
                    if (binarySize < 0)
                        throw new Error('Negative binary type element size found for subtype 0x02');
                    if (binarySize > totalBinarySize - 4)
                        throw new Error('Binary type with subtype 0x02 contains too long binary size');
                    if (binarySize < totalBinarySize - 4)
                        throw new Error('Binary type with subtype 0x02 contains too short binary size');
                }
                // Copy the data
                for (i = 0; i < binarySize; i++) {
                    _buffer[i] = buffer$1[index + i];
                }
                if (promoteBuffers && promoteValues) {
                    value = _buffer;
                }
                else {
                    value = new binary.Binary(_buffer, subType);
                }
            }
            // Update the index
            index = index + binarySize;
        }
        else if (elementType === constants.BSON_DATA_REGEXP && bsonRegExp === false) {
            // Get the start search index
            i = index;
            // Locate the end of the c string
            while (buffer$1[i] !== 0x00 && i < buffer$1.length) {
                i++;
            }
            // If are at the end of the buffer there is a problem with the document
            if (i >= buffer$1.length)
                throw new Error('Bad BSON Document: illegal CString');
            // Return the C string
            var source = buffer$1.toString('utf8', index, i);
            // Create the regexp
            index = i + 1;
            // Get the start search index
            i = index;
            // Locate the end of the c string
            while (buffer$1[i] !== 0x00 && i < buffer$1.length) {
                i++;
            }
            // If are at the end of the buffer there is a problem with the document
            if (i >= buffer$1.length)
                throw new Error('Bad BSON Document: illegal CString');
            // Return the C string
            var regExpOptions = buffer$1.toString('utf8', index, i);
            index = i + 1;
            // For each option add the corresponding one for javascript
            var optionsArray = new Array(regExpOptions.length);
            // Parse options
            for (i = 0; i < regExpOptions.length; i++) {
                switch (regExpOptions[i]) {
                    case 'm':
                        optionsArray[i] = 'm';
                        break;
                    case 's':
                        optionsArray[i] = 'g';
                        break;
                    case 'i':
                        optionsArray[i] = 'i';
                        break;
                }
            }
            value = new RegExp(source, optionsArray.join(''));
        }
        else if (elementType === constants.BSON_DATA_REGEXP && bsonRegExp === true) {
            // Get the start search index
            i = index;
            // Locate the end of the c string
            while (buffer$1[i] !== 0x00 && i < buffer$1.length) {
                i++;
            }
            // If are at the end of the buffer there is a problem with the document
            if (i >= buffer$1.length)
                throw new Error('Bad BSON Document: illegal CString');
            // Return the C string
            var source = buffer$1.toString('utf8', index, i);
            index = i + 1;
            // Get the start search index
            i = index;
            // Locate the end of the c string
            while (buffer$1[i] !== 0x00 && i < buffer$1.length) {
                i++;
            }
            // If are at the end of the buffer there is a problem with the document
            if (i >= buffer$1.length)
                throw new Error('Bad BSON Document: illegal CString');
            // Return the C string
            var regExpOptions = buffer$1.toString('utf8', index, i);
            index = i + 1;
            // Set the object
            value = new regexp.BSONRegExp(source, regExpOptions);
        }
        else if (elementType === constants.BSON_DATA_SYMBOL) {
            var stringSize = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            if (stringSize <= 0 ||
                stringSize > buffer$1.length - index ||
                buffer$1[index + stringSize - 1] !== 0)
                throw new Error('bad string length in bson');
            var symbol$1 = buffer$1.toString('utf8', index, index + stringSize - 1);
            value = promoteValues ? symbol$1 : new symbol.BSONSymbol(symbol$1);
            index = index + stringSize;
        }
        else if (elementType === constants.BSON_DATA_TIMESTAMP) {
            var lowBits = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            var highBits = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            value = new timestamp.Timestamp(lowBits, highBits);
        }
        else if (elementType === constants.BSON_DATA_MIN_KEY) {
            value = new min_key.MinKey();
        }
        else if (elementType === constants.BSON_DATA_MAX_KEY) {
            value = new max_key.MaxKey();
        }
        else if (elementType === constants.BSON_DATA_CODE) {
            var stringSize = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            if (stringSize <= 0 ||
                stringSize > buffer$1.length - index ||
                buffer$1[index + stringSize - 1] !== 0)
                throw new Error('bad string length in bson');
            var functionString = buffer$1.toString('utf8', index, index + stringSize - 1);
            // If we are evaluating the functions
            if (evalFunctions) {
                // If we have cache enabled let's look for the md5 of the function in the cache
                if (cacheFunctions) {
                    // Got to do this to avoid V8 deoptimizing the call due to finding eval
                    value = isolateEval(functionString, functionCache, object);
                }
                else {
                    value = isolateEval(functionString);
                }
            }
            else {
                value = new code.Code(functionString);
            }
            // Update parse index position
            index = index + stringSize;
        }
        else if (elementType === constants.BSON_DATA_CODE_W_SCOPE) {
            var totalSize = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            // Element cannot be shorter than totalSize + stringSize + documentSize + terminator
            if (totalSize < 4 + 4 + 4 + 1) {
                throw new Error('code_w_scope total size shorter minimum expected length');
            }
            // Get the code string size
            var stringSize = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            // Check if we have a valid string
            if (stringSize <= 0 ||
                stringSize > buffer$1.length - index ||
                buffer$1[index + stringSize - 1] !== 0)
                throw new Error('bad string length in bson');
            // Javascript function
            var functionString = buffer$1.toString('utf8', index, index + stringSize - 1);
            // Update parse index position
            index = index + stringSize;
            // Parse the element
            var _index = index;
            // Decode the size of the object document
            var objectSize = buffer$1[index] |
                (buffer$1[index + 1] << 8) |
                (buffer$1[index + 2] << 16) |
                (buffer$1[index + 3] << 24);
            // Decode the scope object
            var scopeObject = deserializeObject(buffer$1, _index, options, false);
            // Adjust the index
            index = index + objectSize;
            // Check if field length is too short
            if (totalSize < 4 + 4 + objectSize + stringSize) {
                throw new Error('code_w_scope total size is too short, truncating scope');
            }
            // Check if totalSize field is too long
            if (totalSize > 4 + 4 + objectSize + stringSize) {
                throw new Error('code_w_scope total size is too long, clips outer document');
            }
            // If we are evaluating the functions
            if (evalFunctions) {
                // If we have cache enabled let's look for the md5 of the function in the cache
                if (cacheFunctions) {
                    // Got to do this to avoid V8 deoptimizing the call due to finding eval
                    value = isolateEval(functionString, functionCache, object);
                }
                else {
                    value = isolateEval(functionString);
                }
                value.scope = scopeObject;
            }
            else {
                value = new code.Code(functionString, scopeObject);
            }
        }
        else if (elementType === constants.BSON_DATA_DBPOINTER) {
            // Get the code string size
            var stringSize = buffer$1[index++] |
                (buffer$1[index++] << 8) |
                (buffer$1[index++] << 16) |
                (buffer$1[index++] << 24);
            // Check if we have a valid string
            if (stringSize <= 0 ||
                stringSize > buffer$1.length - index ||
                buffer$1[index + stringSize - 1] !== 0)
                throw new Error('bad string length in bson');
            // Namespace
            if (!validate_utf8.validateUtf8(buffer$1, index, index + stringSize - 1)) {
                throw new Error('Invalid UTF-8 string in BSON document');
            }
            var namespace = buffer$1.toString('utf8', index, index + stringSize - 1);
            // Update parse index position
            index = index + stringSize;
            // Read the oid
            var oidBuffer = buffer.Buffer.alloc(12);
            buffer$1.copy(oidBuffer, 0, index, index + 12);
            var oid = new objectid.ObjectId(oidBuffer);
            // Update the index
            index = index + 12;
            // Upgrade to DBRef type
            value = new db_ref.DBRef(namespace, oid);
        }
        else {
            throw new Error('Detected unknown BSON type ' + elementType.toString(16) + ' for fieldname "' + name + '"');
        }
        if (name === '__proto__') {
            Object.defineProperty(object, name, {
                value: value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
        else {
            object[name] = value;
        }
    }
    // Check if the deserialization was against a valid array/object
    if (size !== index - startIndex) {
        if (isArray)
            throw new Error('corrupt array bson');
        throw new Error('corrupt object bson');
    }
    // check if object's $ keys are those of a DBRef
    var dollarKeys = Object.keys(object).filter(function (k) { return k.startsWith('$'); });
    var valid = true;
    dollarKeys.forEach(function (k) {
        if (['$ref', '$id', '$db'].indexOf(k) === -1)
            valid = false;
    });
    // if a $key not in "$ref", "$id", "$db", don't make a DBRef
    if (!valid)
        return object;
    if (db_ref.isDBRefLike(object)) {
        var copy = Object.assign({}, object);
        delete copy.$ref;
        delete copy.$id;
        delete copy.$db;
        return new db_ref.DBRef(object.$ref, object.$id, object.$db, copy);
    }
    return object;
}
/**
 * Ensure eval is isolated, store the result in functionCache.
 *
 * @internal
 */
function isolateEval(functionString, functionCache, object) {
    if (!functionCache)
        return new Function(functionString);
    // Check for cache hit, eval if missing and return cached function
    if (functionCache[functionString] == null) {
        functionCache[functionString] = new Function(functionString);
    }
    // Set the object
    return functionCache[functionString].bind(object);
}

});

unwrapExports(deserializer);
deserializer.deserialize;

var float_parser = createCommonjsModule(function (module, exports) {
// Copyright (c) 2008, Fair Oaks Labs, Inc.
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//  * Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//
//  * Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
//  * Neither the name of Fair Oaks Labs, Inc. nor the names of its contributors
//    may be used to endorse or promote products derived from this software
//    without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
//
//
// Modifications to writeIEEE754 to support negative zeroes made by Brian White
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeIEEE754 = exports.readIEEE754 = void 0;
function readIEEE754(buffer, offset, endian, mLen, nBytes) {
    var e;
    var m;
    var bBE = endian === 'big';
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = bBE ? 0 : nBytes - 1;
    var d = bBE ? 1 : -1;
    var s = buffer[offset + i];
    i += d;
    e = s & ((1 << -nBits) - 1);
    s >>= -nBits;
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8)
        ;
    m = e & ((1 << -nBits) - 1);
    e >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8)
        ;
    if (e === 0) {
        e = 1 - eBias;
    }
    else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
    }
    else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}
exports.readIEEE754 = readIEEE754;
function writeIEEE754(buffer, value, offset, endian, mLen, nBytes) {
    var e;
    var m;
    var c;
    var bBE = endian === 'big';
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i = bBE ? nBytes - 1 : 0;
    var d = bBE ? -1 : 1;
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
    }
    else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
        }
        if (e + eBias >= 1) {
            value += rt / c;
        }
        else {
            value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
            e++;
            c /= 2;
        }
        if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
        }
        else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
        }
        else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
        }
    }
    if (isNaN(value))
        m = 0;
    while (mLen >= 8) {
        buffer[offset + i] = m & 0xff;
        i += d;
        m /= 256;
        mLen -= 8;
    }
    e = (e << mLen) | m;
    if (isNaN(value))
        e += 8;
    eLen += mLen;
    while (eLen > 0) {
        buffer[offset + i] = e & 0xff;
        i += d;
        e /= 256;
        eLen -= 8;
    }
    buffer[offset + i - d] |= s * 128;
}
exports.writeIEEE754 = writeIEEE754;

});

unwrapExports(float_parser);
float_parser.writeIEEE754;
float_parser.readIEEE754;

var serializer = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeInto = void 0;








var regexp = /\x00/; // eslint-disable-line no-control-regex
var ignoreKeys = new Set(['$db', '$ref', '$id', '$clusterTime']);
/*
 * isArray indicates if we are writing to a BSON array (type 0x04)
 * which forces the "key" which really an array index as a string to be written as ascii
 * This will catch any errors in index as a string generation
 */
function serializeString(buffer, key, value, index, isArray) {
    // Encode String type
    buffer[index++] = constants.BSON_DATA_STRING;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes + 1;
    buffer[index - 1] = 0;
    // Write the string
    var size = buffer.write(value, index + 4, undefined, 'utf8');
    // Write the size of the string to buffer
    buffer[index + 3] = ((size + 1) >> 24) & 0xff;
    buffer[index + 2] = ((size + 1) >> 16) & 0xff;
    buffer[index + 1] = ((size + 1) >> 8) & 0xff;
    buffer[index] = (size + 1) & 0xff;
    // Update index
    index = index + 4 + size;
    // Write zero
    buffer[index++] = 0;
    return index;
}
function serializeNumber(buffer, key, value, index, isArray) {
    // We have an integer value
    // TODO(NODE-2529): Add support for big int
    if (Number.isInteger(value) &&
        value >= constants.BSON_INT32_MIN &&
        value <= constants.BSON_INT32_MAX) {
        // If the value fits in 32 bits encode as int32
        // Set int type 32 bits or less
        buffer[index++] = constants.BSON_DATA_INT;
        // Number of written bytes
        var numberOfWrittenBytes = !isArray
            ? buffer.write(key, index, undefined, 'utf8')
            : buffer.write(key, index, undefined, 'ascii');
        // Encode the name
        index = index + numberOfWrittenBytes;
        buffer[index++] = 0;
        // Write the int value
        buffer[index++] = value & 0xff;
        buffer[index++] = (value >> 8) & 0xff;
        buffer[index++] = (value >> 16) & 0xff;
        buffer[index++] = (value >> 24) & 0xff;
    }
    else {
        // Encode as double
        buffer[index++] = constants.BSON_DATA_NUMBER;
        // Number of written bytes
        var numberOfWrittenBytes = !isArray
            ? buffer.write(key, index, undefined, 'utf8')
            : buffer.write(key, index, undefined, 'ascii');
        // Encode the name
        index = index + numberOfWrittenBytes;
        buffer[index++] = 0;
        // Write float
        float_parser.writeIEEE754(buffer, value, index, 'little', 52, 8);
        // Adjust index
        index = index + 8;
    }
    return index;
}
function serializeNull(buffer, key, _, index, isArray) {
    // Set long type
    buffer[index++] = constants.BSON_DATA_NULL;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    return index;
}
function serializeBoolean(buffer, key, value, index, isArray) {
    // Write the type
    buffer[index++] = constants.BSON_DATA_BOOLEAN;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Encode the boolean value
    buffer[index++] = value ? 1 : 0;
    return index;
}
function serializeDate(buffer, key, value, index, isArray) {
    // Write the type
    buffer[index++] = constants.BSON_DATA_DATE;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Write the date
    var dateInMilis = long_1.Long.fromNumber(value.getTime());
    var lowBits = dateInMilis.getLowBits();
    var highBits = dateInMilis.getHighBits();
    // Encode low bits
    buffer[index++] = lowBits & 0xff;
    buffer[index++] = (lowBits >> 8) & 0xff;
    buffer[index++] = (lowBits >> 16) & 0xff;
    buffer[index++] = (lowBits >> 24) & 0xff;
    // Encode high bits
    buffer[index++] = highBits & 0xff;
    buffer[index++] = (highBits >> 8) & 0xff;
    buffer[index++] = (highBits >> 16) & 0xff;
    buffer[index++] = (highBits >> 24) & 0xff;
    return index;
}
function serializeRegExp(buffer, key, value, index, isArray) {
    // Write the type
    buffer[index++] = constants.BSON_DATA_REGEXP;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    if (value.source && value.source.match(regexp) != null) {
        throw Error('value ' + value.source + ' must not contain null bytes');
    }
    // Adjust the index
    index = index + buffer.write(value.source, index, undefined, 'utf8');
    // Write zero
    buffer[index++] = 0x00;
    // Write the parameters
    if (value.ignoreCase)
        buffer[index++] = 0x69; // i
    if (value.global)
        buffer[index++] = 0x73; // s
    if (value.multiline)
        buffer[index++] = 0x6d; // m
    // Add ending zero
    buffer[index++] = 0x00;
    return index;
}
function serializeBSONRegExp(buffer, key, value, index, isArray) {
    // Write the type
    buffer[index++] = constants.BSON_DATA_REGEXP;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Check the pattern for 0 bytes
    if (value.pattern.match(regexp) != null) {
        // The BSON spec doesn't allow keys with null bytes because keys are
        // null-terminated.
        throw Error('pattern ' + value.pattern + ' must not contain null bytes');
    }
    // Adjust the index
    index = index + buffer.write(value.pattern, index, undefined, 'utf8');
    // Write zero
    buffer[index++] = 0x00;
    // Write the options
    index = index + buffer.write(value.options.split('').sort().join(''), index, undefined, 'utf8');
    // Add ending zero
    buffer[index++] = 0x00;
    return index;
}
function serializeMinMax(buffer, key, value, index, isArray) {
    // Write the type of either min or max key
    if (value === null) {
        buffer[index++] = constants.BSON_DATA_NULL;
    }
    else if (value._bsontype === 'MinKey') {
        buffer[index++] = constants.BSON_DATA_MIN_KEY;
    }
    else {
        buffer[index++] = constants.BSON_DATA_MAX_KEY;
    }
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    return index;
}
function serializeObjectId(buffer, key, value, index, isArray) {
    // Write the type
    buffer[index++] = constants.BSON_DATA_OID;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Write the objectId into the shared buffer
    if (typeof value.id === 'string') {
        buffer.write(value.id, index, undefined, 'binary');
    }
    else if (value.id && value.id.copy) {
        value.id.copy(buffer, index, 0, 12);
    }
    else {
        throw new TypeError('object [' + JSON.stringify(value) + '] is not a valid ObjectId');
    }
    // Adjust index
    return index + 12;
}
function serializeBuffer(buffer, key, value, index, isArray) {
    // Write the type
    buffer[index++] = constants.BSON_DATA_BINARY;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Get size of the buffer (current write point)
    var size = value.length;
    // Write the size of the string to buffer
    buffer[index++] = size & 0xff;
    buffer[index++] = (size >> 8) & 0xff;
    buffer[index++] = (size >> 16) & 0xff;
    buffer[index++] = (size >> 24) & 0xff;
    // Write the default subtype
    buffer[index++] = constants.BSON_BINARY_SUBTYPE_DEFAULT;
    // Copy the content form the binary field to the buffer
    buffer.set(ensure_buffer.ensureBuffer(value), index);
    // Adjust the index
    index = index + size;
    return index;
}
function serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, isArray, path) {
    if (checkKeys === void 0) { checkKeys = false; }
    if (depth === void 0) { depth = 0; }
    if (serializeFunctions === void 0) { serializeFunctions = false; }
    if (ignoreUndefined === void 0) { ignoreUndefined = true; }
    if (isArray === void 0) { isArray = false; }
    if (path === void 0) { path = []; }
    for (var i = 0; i < path.length; i++) {
        if (path[i] === value)
            throw new Error('cyclic dependency detected');
    }
    // Push value to stack
    path.push(value);
    // Write the type
    buffer[index++] = Array.isArray(value) ? constants.BSON_DATA_ARRAY : constants.BSON_DATA_OBJECT;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    var endIndex = serializeInto(buffer, value, checkKeys, index, depth + 1, serializeFunctions, ignoreUndefined, path);
    // Pop stack
    path.pop();
    return endIndex;
}
function serializeDecimal128(buffer, key, value, index, isArray) {
    buffer[index++] = constants.BSON_DATA_DECIMAL128;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Write the data from the value
    value.bytes.copy(buffer, index, 0, 16);
    return index + 16;
}
function serializeLong(buffer, key, value, index, isArray) {
    // Write the type
    buffer[index++] =
        value._bsontype === 'Long' ? constants.BSON_DATA_LONG : constants.BSON_DATA_TIMESTAMP;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Write the date
    var lowBits = value.getLowBits();
    var highBits = value.getHighBits();
    // Encode low bits
    buffer[index++] = lowBits & 0xff;
    buffer[index++] = (lowBits >> 8) & 0xff;
    buffer[index++] = (lowBits >> 16) & 0xff;
    buffer[index++] = (lowBits >> 24) & 0xff;
    // Encode high bits
    buffer[index++] = highBits & 0xff;
    buffer[index++] = (highBits >> 8) & 0xff;
    buffer[index++] = (highBits >> 16) & 0xff;
    buffer[index++] = (highBits >> 24) & 0xff;
    return index;
}
function serializeInt32(buffer, key, value, index, isArray) {
    value = value.valueOf();
    // Set int type 32 bits or less
    buffer[index++] = constants.BSON_DATA_INT;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Write the int value
    buffer[index++] = value & 0xff;
    buffer[index++] = (value >> 8) & 0xff;
    buffer[index++] = (value >> 16) & 0xff;
    buffer[index++] = (value >> 24) & 0xff;
    return index;
}
function serializeDouble(buffer, key, value, index, isArray) {
    // Encode as double
    buffer[index++] = constants.BSON_DATA_NUMBER;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Write float
    float_parser.writeIEEE754(buffer, value.value, index, 'little', 52, 8);
    // Adjust index
    index = index + 8;
    return index;
}
function serializeFunction(buffer, key, value, index, _checkKeys, _depth, isArray) {
    buffer[index++] = constants.BSON_DATA_CODE;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Function string
    var functionString = utils.normalizedFunctionString(value);
    // Write the string
    var size = buffer.write(functionString, index + 4, undefined, 'utf8') + 1;
    // Write the size of the string to buffer
    buffer[index] = size & 0xff;
    buffer[index + 1] = (size >> 8) & 0xff;
    buffer[index + 2] = (size >> 16) & 0xff;
    buffer[index + 3] = (size >> 24) & 0xff;
    // Update index
    index = index + 4 + size - 1;
    // Write zero
    buffer[index++] = 0;
    return index;
}
function serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, isArray) {
    if (checkKeys === void 0) { checkKeys = false; }
    if (depth === void 0) { depth = 0; }
    if (serializeFunctions === void 0) { serializeFunctions = false; }
    if (ignoreUndefined === void 0) { ignoreUndefined = true; }
    if (isArray === void 0) { isArray = false; }
    if (value.scope && typeof value.scope === 'object') {
        // Write the type
        buffer[index++] = constants.BSON_DATA_CODE_W_SCOPE;
        // Number of written bytes
        var numberOfWrittenBytes = !isArray
            ? buffer.write(key, index, undefined, 'utf8')
            : buffer.write(key, index, undefined, 'ascii');
        // Encode the name
        index = index + numberOfWrittenBytes;
        buffer[index++] = 0;
        // Starting index
        var startIndex = index;
        // Serialize the function
        // Get the function string
        var functionString = typeof value.code === 'string' ? value.code : value.code.toString();
        // Index adjustment
        index = index + 4;
        // Write string into buffer
        var codeSize = buffer.write(functionString, index + 4, undefined, 'utf8') + 1;
        // Write the size of the string to buffer
        buffer[index] = codeSize & 0xff;
        buffer[index + 1] = (codeSize >> 8) & 0xff;
        buffer[index + 2] = (codeSize >> 16) & 0xff;
        buffer[index + 3] = (codeSize >> 24) & 0xff;
        // Write end 0
        buffer[index + 4 + codeSize - 1] = 0;
        // Write the
        index = index + codeSize + 4;
        //
        // Serialize the scope value
        var endIndex = serializeInto(buffer, value.scope, checkKeys, index, depth + 1, serializeFunctions, ignoreUndefined);
        index = endIndex - 1;
        // Writ the total
        var totalSize = endIndex - startIndex;
        // Write the total size of the object
        buffer[startIndex++] = totalSize & 0xff;
        buffer[startIndex++] = (totalSize >> 8) & 0xff;
        buffer[startIndex++] = (totalSize >> 16) & 0xff;
        buffer[startIndex++] = (totalSize >> 24) & 0xff;
        // Write trailing zero
        buffer[index++] = 0;
    }
    else {
        buffer[index++] = constants.BSON_DATA_CODE;
        // Number of written bytes
        var numberOfWrittenBytes = !isArray
            ? buffer.write(key, index, undefined, 'utf8')
            : buffer.write(key, index, undefined, 'ascii');
        // Encode the name
        index = index + numberOfWrittenBytes;
        buffer[index++] = 0;
        // Function string
        var functionString = value.code.toString();
        // Write the string
        var size = buffer.write(functionString, index + 4, undefined, 'utf8') + 1;
        // Write the size of the string to buffer
        buffer[index] = size & 0xff;
        buffer[index + 1] = (size >> 8) & 0xff;
        buffer[index + 2] = (size >> 16) & 0xff;
        buffer[index + 3] = (size >> 24) & 0xff;
        // Update index
        index = index + 4 + size - 1;
        // Write zero
        buffer[index++] = 0;
    }
    return index;
}
function serializeBinary(buffer, key, value, index, isArray) {
    // Write the type
    buffer[index++] = constants.BSON_DATA_BINARY;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Extract the buffer
    var data = value.value(true);
    // Calculate size
    var size = value.position;
    // Add the deprecated 02 type 4 bytes of size to total
    if (value.sub_type === binary.Binary.SUBTYPE_BYTE_ARRAY)
        size = size + 4;
    // Write the size of the string to buffer
    buffer[index++] = size & 0xff;
    buffer[index++] = (size >> 8) & 0xff;
    buffer[index++] = (size >> 16) & 0xff;
    buffer[index++] = (size >> 24) & 0xff;
    // Write the subtype to the buffer
    buffer[index++] = value.sub_type;
    // If we have binary type 2 the 4 first bytes are the size
    if (value.sub_type === binary.Binary.SUBTYPE_BYTE_ARRAY) {
        size = size - 4;
        buffer[index++] = size & 0xff;
        buffer[index++] = (size >> 8) & 0xff;
        buffer[index++] = (size >> 16) & 0xff;
        buffer[index++] = (size >> 24) & 0xff;
    }
    // Write the data to the object
    buffer.set(data, index);
    // Adjust the index
    index = index + value.position;
    return index;
}
function serializeSymbol(buffer, key, value, index, isArray) {
    // Write the type
    buffer[index++] = constants.BSON_DATA_SYMBOL;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Write the string
    var size = buffer.write(value.value, index + 4, undefined, 'utf8') + 1;
    // Write the size of the string to buffer
    buffer[index] = size & 0xff;
    buffer[index + 1] = (size >> 8) & 0xff;
    buffer[index + 2] = (size >> 16) & 0xff;
    buffer[index + 3] = (size >> 24) & 0xff;
    // Update index
    index = index + 4 + size - 1;
    // Write zero
    buffer[index++] = 0x00;
    return index;
}
function serializeDBRef(buffer, key, value, index, depth, serializeFunctions, isArray) {
    // Write the type
    buffer[index++] = constants.BSON_DATA_OBJECT;
    // Number of written bytes
    var numberOfWrittenBytes = !isArray
        ? buffer.write(key, index, undefined, 'utf8')
        : buffer.write(key, index, undefined, 'ascii');
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    var startIndex = index;
    var output = {
        $ref: value.collection || value.namespace,
        $id: value.oid
    };
    if (value.db != null) {
        output.$db = value.db;
    }
    output = Object.assign(output, value.fields);
    var endIndex = serializeInto(buffer, output, false, index, depth + 1, serializeFunctions);
    // Calculate object size
    var size = endIndex - startIndex;
    // Write the size
    buffer[startIndex++] = size & 0xff;
    buffer[startIndex++] = (size >> 8) & 0xff;
    buffer[startIndex++] = (size >> 16) & 0xff;
    buffer[startIndex++] = (size >> 24) & 0xff;
    // Set index
    return endIndex;
}
function serializeInto(buffer, object, checkKeys, startingIndex, depth, serializeFunctions, ignoreUndefined, path) {
    if (checkKeys === void 0) { checkKeys = false; }
    if (startingIndex === void 0) { startingIndex = 0; }
    if (depth === void 0) { depth = 0; }
    if (serializeFunctions === void 0) { serializeFunctions = false; }
    if (ignoreUndefined === void 0) { ignoreUndefined = true; }
    if (path === void 0) { path = []; }
    startingIndex = startingIndex || 0;
    path = path || [];
    // Push the object to the path
    path.push(object);
    // Start place to serialize into
    var index = startingIndex + 4;
    // Special case isArray
    if (Array.isArray(object)) {
        // Get object keys
        for (var i = 0; i < object.length; i++) {
            var key = '' + i;
            var value = object[i];
            // Is there an override value
            if (value && value.toBSON) {
                if (typeof value.toBSON !== 'function')
                    throw new TypeError('toBSON is not a function');
                value = value.toBSON();
            }
            if (typeof value === 'string') {
                index = serializeString(buffer, key, value, index, true);
            }
            else if (typeof value === 'number') {
                index = serializeNumber(buffer, key, value, index, true);
            }
            else if (typeof value === 'bigint') {
                throw new TypeError('Unsupported type BigInt, please use Decimal128');
            }
            else if (typeof value === 'boolean') {
                index = serializeBoolean(buffer, key, value, index, true);
            }
            else if (value instanceof Date || utils.isDate(value)) {
                index = serializeDate(buffer, key, value, index, true);
            }
            else if (value === undefined) {
                index = serializeNull(buffer, key, value, index, true);
            }
            else if (value === null) {
                index = serializeNull(buffer, key, value, index, true);
            }
            else if (value['_bsontype'] === 'ObjectId' || value['_bsontype'] === 'ObjectID') {
                index = serializeObjectId(buffer, key, value, index, true);
            }
            else if (utils.isUint8Array(value)) {
                index = serializeBuffer(buffer, key, value, index, true);
            }
            else if (value instanceof RegExp || utils.isRegExp(value)) {
                index = serializeRegExp(buffer, key, value, index, true);
            }
            else if (typeof value === 'object' && value['_bsontype'] == null) {
                index = serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, true, path);
            }
            else if (typeof value === 'object' &&
                extended_json.isBSONType(value) &&
                value._bsontype === 'Decimal128') {
                index = serializeDecimal128(buffer, key, value, index, true);
            }
            else if (value['_bsontype'] === 'Long' || value['_bsontype'] === 'Timestamp') {
                index = serializeLong(buffer, key, value, index, true);
            }
            else if (value['_bsontype'] === 'Double') {
                index = serializeDouble(buffer, key, value, index, true);
            }
            else if (typeof value === 'function' && serializeFunctions) {
                index = serializeFunction(buffer, key, value, index, checkKeys, depth, true);
            }
            else if (value['_bsontype'] === 'Code') {
                index = serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, true);
            }
            else if (value['_bsontype'] === 'Binary') {
                index = serializeBinary(buffer, key, value, index, true);
            }
            else if (value['_bsontype'] === 'Symbol') {
                index = serializeSymbol(buffer, key, value, index, true);
            }
            else if (value['_bsontype'] === 'DBRef') {
                index = serializeDBRef(buffer, key, value, index, depth, serializeFunctions, true);
            }
            else if (value['_bsontype'] === 'BSONRegExp') {
                index = serializeBSONRegExp(buffer, key, value, index, true);
            }
            else if (value['_bsontype'] === 'Int32') {
                index = serializeInt32(buffer, key, value, index, true);
            }
            else if (value['_bsontype'] === 'MinKey' || value['_bsontype'] === 'MaxKey') {
                index = serializeMinMax(buffer, key, value, index, true);
            }
            else if (typeof value['_bsontype'] !== 'undefined') {
                throw new TypeError('Unrecognized or invalid _bsontype: ' + value['_bsontype']);
            }
        }
    }
    else if (object instanceof map.Map || utils.isMap(object)) {
        var iterator = object.entries();
        var done = false;
        while (!done) {
            // Unpack the next entry
            var entry = iterator.next();
            done = !!entry.done;
            // Are we done, then skip and terminate
            if (done)
                continue;
            // Get the entry values
            var key = entry.value[0];
            var value = entry.value[1];
            // Check the type of the value
            var type = typeof value;
            // Check the key and throw error if it's illegal
            if (typeof key === 'string' && !ignoreKeys.has(key)) {
                if (key.match(regexp) != null) {
                    // The BSON spec doesn't allow keys with null bytes because keys are
                    // null-terminated.
                    throw Error('key ' + key + ' must not contain null bytes');
                }
                if (checkKeys) {
                    if ('$' === key[0]) {
                        throw Error('key ' + key + " must not start with '$'");
                    }
                    else if (~key.indexOf('.')) {
                        throw Error('key ' + key + " must not contain '.'");
                    }
                }
            }
            if (type === 'string') {
                index = serializeString(buffer, key, value, index);
            }
            else if (type === 'number') {
                index = serializeNumber(buffer, key, value, index);
            }
            else if (type === 'bigint' || utils.isBigInt64Array(value) || utils.isBigUInt64Array(value)) {
                throw new TypeError('Unsupported type BigInt, please use Decimal128');
            }
            else if (type === 'boolean') {
                index = serializeBoolean(buffer, key, value, index);
            }
            else if (value instanceof Date || utils.isDate(value)) {
                index = serializeDate(buffer, key, value, index);
            }
            else if (value === null || (value === undefined && ignoreUndefined === false)) {
                index = serializeNull(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'ObjectId' || value['_bsontype'] === 'ObjectID') {
                index = serializeObjectId(buffer, key, value, index);
            }
            else if (utils.isUint8Array(value)) {
                index = serializeBuffer(buffer, key, value, index);
            }
            else if (value instanceof RegExp || utils.isRegExp(value)) {
                index = serializeRegExp(buffer, key, value, index);
            }
            else if (type === 'object' && value['_bsontype'] == null) {
                index = serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, false, path);
            }
            else if (type === 'object' && value['_bsontype'] === 'Decimal128') {
                index = serializeDecimal128(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'Long' || value['_bsontype'] === 'Timestamp') {
                index = serializeLong(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'Double') {
                index = serializeDouble(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'Code') {
                index = serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined);
            }
            else if (typeof value === 'function' && serializeFunctions) {
                index = serializeFunction(buffer, key, value, index, checkKeys, depth, serializeFunctions);
            }
            else if (value['_bsontype'] === 'Binary') {
                index = serializeBinary(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'Symbol') {
                index = serializeSymbol(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'DBRef') {
                index = serializeDBRef(buffer, key, value, index, depth, serializeFunctions);
            }
            else if (value['_bsontype'] === 'BSONRegExp') {
                index = serializeBSONRegExp(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'Int32') {
                index = serializeInt32(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'MinKey' || value['_bsontype'] === 'MaxKey') {
                index = serializeMinMax(buffer, key, value, index);
            }
            else if (typeof value['_bsontype'] !== 'undefined') {
                throw new TypeError('Unrecognized or invalid _bsontype: ' + value['_bsontype']);
            }
        }
    }
    else {
        // Did we provide a custom serialization method
        if (object.toBSON) {
            if (typeof object.toBSON !== 'function')
                throw new TypeError('toBSON is not a function');
            object = object.toBSON();
            if (object != null && typeof object !== 'object')
                throw new TypeError('toBSON function did not return an object');
        }
        // Iterate over all the keys
        for (var key in object) {
            var value = object[key];
            // Is there an override value
            if (value && value.toBSON) {
                if (typeof value.toBSON !== 'function')
                    throw new TypeError('toBSON is not a function');
                value = value.toBSON();
            }
            // Check the type of the value
            var type = typeof value;
            // Check the key and throw error if it's illegal
            if (typeof key === 'string' && !ignoreKeys.has(key)) {
                if (key.match(regexp) != null) {
                    // The BSON spec doesn't allow keys with null bytes because keys are
                    // null-terminated.
                    throw Error('key ' + key + ' must not contain null bytes');
                }
                if (checkKeys) {
                    if ('$' === key[0]) {
                        throw Error('key ' + key + " must not start with '$'");
                    }
                    else if (~key.indexOf('.')) {
                        throw Error('key ' + key + " must not contain '.'");
                    }
                }
            }
            if (type === 'string') {
                index = serializeString(buffer, key, value, index);
            }
            else if (type === 'number') {
                index = serializeNumber(buffer, key, value, index);
            }
            else if (type === 'bigint') {
                throw new TypeError('Unsupported type BigInt, please use Decimal128');
            }
            else if (type === 'boolean') {
                index = serializeBoolean(buffer, key, value, index);
            }
            else if (value instanceof Date || utils.isDate(value)) {
                index = serializeDate(buffer, key, value, index);
            }
            else if (value === undefined) {
                if (ignoreUndefined === false)
                    index = serializeNull(buffer, key, value, index);
            }
            else if (value === null) {
                index = serializeNull(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'ObjectId' || value['_bsontype'] === 'ObjectID') {
                index = serializeObjectId(buffer, key, value, index);
            }
            else if (utils.isUint8Array(value)) {
                index = serializeBuffer(buffer, key, value, index);
            }
            else if (value instanceof RegExp || utils.isRegExp(value)) {
                index = serializeRegExp(buffer, key, value, index);
            }
            else if (type === 'object' && value['_bsontype'] == null) {
                index = serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, false, path);
            }
            else if (type === 'object' && value['_bsontype'] === 'Decimal128') {
                index = serializeDecimal128(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'Long' || value['_bsontype'] === 'Timestamp') {
                index = serializeLong(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'Double') {
                index = serializeDouble(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'Code') {
                index = serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined);
            }
            else if (typeof value === 'function' && serializeFunctions) {
                index = serializeFunction(buffer, key, value, index, checkKeys, depth, serializeFunctions);
            }
            else if (value['_bsontype'] === 'Binary') {
                index = serializeBinary(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'Symbol') {
                index = serializeSymbol(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'DBRef') {
                index = serializeDBRef(buffer, key, value, index, depth, serializeFunctions);
            }
            else if (value['_bsontype'] === 'BSONRegExp') {
                index = serializeBSONRegExp(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'Int32') {
                index = serializeInt32(buffer, key, value, index);
            }
            else if (value['_bsontype'] === 'MinKey' || value['_bsontype'] === 'MaxKey') {
                index = serializeMinMax(buffer, key, value, index);
            }
            else if (typeof value['_bsontype'] !== 'undefined') {
                throw new TypeError('Unrecognized or invalid _bsontype: ' + value['_bsontype']);
            }
        }
    }
    // Remove the path
    path.pop();
    // Final padding byte for object
    buffer[index++] = 0x00;
    // Final size
    var size = index - startingIndex;
    // Write the size of the object
    buffer[startingIndex++] = size & 0xff;
    buffer[startingIndex++] = (size >> 8) & 0xff;
    buffer[startingIndex++] = (size >> 16) & 0xff;
    buffer[startingIndex++] = (size >> 24) & 0xff;
    return index;
}
exports.serializeInto = serializeInto;

});

unwrapExports(serializer);
serializer.serializeInto;

var bson = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectID = exports.Decimal128 = exports.BSONRegExp = exports.MaxKey = exports.MinKey = exports.Int32 = exports.Double = exports.Timestamp = exports.Long = exports.UUID = exports.ObjectId = exports.Binary = exports.DBRef = exports.BSONSymbol = exports.Map = exports.Code = exports.LongWithoutOverridesClass = exports.EJSON = exports.BSON_INT64_MIN = exports.BSON_INT64_MAX = exports.BSON_INT32_MIN = exports.BSON_INT32_MAX = exports.BSON_DATA_UNDEFINED = exports.BSON_DATA_TIMESTAMP = exports.BSON_DATA_SYMBOL = exports.BSON_DATA_STRING = exports.BSON_DATA_REGEXP = exports.BSON_DATA_OID = exports.BSON_DATA_OBJECT = exports.BSON_DATA_NUMBER = exports.BSON_DATA_NULL = exports.BSON_DATA_MIN_KEY = exports.BSON_DATA_MAX_KEY = exports.BSON_DATA_LONG = exports.BSON_DATA_INT = exports.BSON_DATA_DECIMAL128 = exports.BSON_DATA_DBPOINTER = exports.BSON_DATA_DATE = exports.BSON_DATA_CODE_W_SCOPE = exports.BSON_DATA_CODE = exports.BSON_DATA_BOOLEAN = exports.BSON_DATA_BINARY = exports.BSON_DATA_ARRAY = exports.BSON_BINARY_SUBTYPE_UUID_NEW = exports.BSON_BINARY_SUBTYPE_UUID = exports.BSON_BINARY_SUBTYPE_USER_DEFINED = exports.BSON_BINARY_SUBTYPE_MD5 = exports.BSON_BINARY_SUBTYPE_FUNCTION = exports.BSON_BINARY_SUBTYPE_DEFAULT = exports.BSON_BINARY_SUBTYPE_BYTE_ARRAY = void 0;
exports.deserializeStream = exports.calculateObjectSize = exports.deserialize = exports.serializeWithBufferAndIndex = exports.serialize = exports.setInternalBufferSize = void 0;


Object.defineProperty(exports, "Binary", { enumerable: true, get: function () { return binary.Binary; } });

Object.defineProperty(exports, "Code", { enumerable: true, get: function () { return code.Code; } });

Object.defineProperty(exports, "DBRef", { enumerable: true, get: function () { return db_ref.DBRef; } });

Object.defineProperty(exports, "Decimal128", { enumerable: true, get: function () { return decimal128.Decimal128; } });

Object.defineProperty(exports, "Double", { enumerable: true, get: function () { return double_1.Double; } });



Object.defineProperty(exports, "Int32", { enumerable: true, get: function () { return int_32.Int32; } });

Object.defineProperty(exports, "Long", { enumerable: true, get: function () { return long_1.Long; } });

Object.defineProperty(exports, "Map", { enumerable: true, get: function () { return map.Map; } });

Object.defineProperty(exports, "MaxKey", { enumerable: true, get: function () { return max_key.MaxKey; } });

Object.defineProperty(exports, "MinKey", { enumerable: true, get: function () { return min_key.MinKey; } });

Object.defineProperty(exports, "ObjectId", { enumerable: true, get: function () { return objectid.ObjectId; } });
Object.defineProperty(exports, "ObjectID", { enumerable: true, get: function () { return objectid.ObjectId; } });

// Parts of the parser



Object.defineProperty(exports, "BSONRegExp", { enumerable: true, get: function () { return regexp.BSONRegExp; } });

Object.defineProperty(exports, "BSONSymbol", { enumerable: true, get: function () { return symbol.BSONSymbol; } });

Object.defineProperty(exports, "Timestamp", { enumerable: true, get: function () { return timestamp.Timestamp; } });

Object.defineProperty(exports, "UUID", { enumerable: true, get: function () { return uuid.UUID; } });

Object.defineProperty(exports, "BSON_BINARY_SUBTYPE_BYTE_ARRAY", { enumerable: true, get: function () { return constants.BSON_BINARY_SUBTYPE_BYTE_ARRAY; } });
Object.defineProperty(exports, "BSON_BINARY_SUBTYPE_DEFAULT", { enumerable: true, get: function () { return constants.BSON_BINARY_SUBTYPE_DEFAULT; } });
Object.defineProperty(exports, "BSON_BINARY_SUBTYPE_FUNCTION", { enumerable: true, get: function () { return constants.BSON_BINARY_SUBTYPE_FUNCTION; } });
Object.defineProperty(exports, "BSON_BINARY_SUBTYPE_MD5", { enumerable: true, get: function () { return constants.BSON_BINARY_SUBTYPE_MD5; } });
Object.defineProperty(exports, "BSON_BINARY_SUBTYPE_USER_DEFINED", { enumerable: true, get: function () { return constants.BSON_BINARY_SUBTYPE_USER_DEFINED; } });
Object.defineProperty(exports, "BSON_BINARY_SUBTYPE_UUID", { enumerable: true, get: function () { return constants.BSON_BINARY_SUBTYPE_UUID; } });
Object.defineProperty(exports, "BSON_BINARY_SUBTYPE_UUID_NEW", { enumerable: true, get: function () { return constants.BSON_BINARY_SUBTYPE_UUID_NEW; } });
Object.defineProperty(exports, "BSON_DATA_ARRAY", { enumerable: true, get: function () { return constants.BSON_DATA_ARRAY; } });
Object.defineProperty(exports, "BSON_DATA_BINARY", { enumerable: true, get: function () { return constants.BSON_DATA_BINARY; } });
Object.defineProperty(exports, "BSON_DATA_BOOLEAN", { enumerable: true, get: function () { return constants.BSON_DATA_BOOLEAN; } });
Object.defineProperty(exports, "BSON_DATA_CODE", { enumerable: true, get: function () { return constants.BSON_DATA_CODE; } });
Object.defineProperty(exports, "BSON_DATA_CODE_W_SCOPE", { enumerable: true, get: function () { return constants.BSON_DATA_CODE_W_SCOPE; } });
Object.defineProperty(exports, "BSON_DATA_DATE", { enumerable: true, get: function () { return constants.BSON_DATA_DATE; } });
Object.defineProperty(exports, "BSON_DATA_DBPOINTER", { enumerable: true, get: function () { return constants.BSON_DATA_DBPOINTER; } });
Object.defineProperty(exports, "BSON_DATA_DECIMAL128", { enumerable: true, get: function () { return constants.BSON_DATA_DECIMAL128; } });
Object.defineProperty(exports, "BSON_DATA_INT", { enumerable: true, get: function () { return constants.BSON_DATA_INT; } });
Object.defineProperty(exports, "BSON_DATA_LONG", { enumerable: true, get: function () { return constants.BSON_DATA_LONG; } });
Object.defineProperty(exports, "BSON_DATA_MAX_KEY", { enumerable: true, get: function () { return constants.BSON_DATA_MAX_KEY; } });
Object.defineProperty(exports, "BSON_DATA_MIN_KEY", { enumerable: true, get: function () { return constants.BSON_DATA_MIN_KEY; } });
Object.defineProperty(exports, "BSON_DATA_NULL", { enumerable: true, get: function () { return constants.BSON_DATA_NULL; } });
Object.defineProperty(exports, "BSON_DATA_NUMBER", { enumerable: true, get: function () { return constants.BSON_DATA_NUMBER; } });
Object.defineProperty(exports, "BSON_DATA_OBJECT", { enumerable: true, get: function () { return constants.BSON_DATA_OBJECT; } });
Object.defineProperty(exports, "BSON_DATA_OID", { enumerable: true, get: function () { return constants.BSON_DATA_OID; } });
Object.defineProperty(exports, "BSON_DATA_REGEXP", { enumerable: true, get: function () { return constants.BSON_DATA_REGEXP; } });
Object.defineProperty(exports, "BSON_DATA_STRING", { enumerable: true, get: function () { return constants.BSON_DATA_STRING; } });
Object.defineProperty(exports, "BSON_DATA_SYMBOL", { enumerable: true, get: function () { return constants.BSON_DATA_SYMBOL; } });
Object.defineProperty(exports, "BSON_DATA_TIMESTAMP", { enumerable: true, get: function () { return constants.BSON_DATA_TIMESTAMP; } });
Object.defineProperty(exports, "BSON_DATA_UNDEFINED", { enumerable: true, get: function () { return constants.BSON_DATA_UNDEFINED; } });
Object.defineProperty(exports, "BSON_INT32_MAX", { enumerable: true, get: function () { return constants.BSON_INT32_MAX; } });
Object.defineProperty(exports, "BSON_INT32_MIN", { enumerable: true, get: function () { return constants.BSON_INT32_MIN; } });
Object.defineProperty(exports, "BSON_INT64_MAX", { enumerable: true, get: function () { return constants.BSON_INT64_MAX; } });
Object.defineProperty(exports, "BSON_INT64_MIN", { enumerable: true, get: function () { return constants.BSON_INT64_MIN; } });
var extended_json_2 = extended_json;
Object.defineProperty(exports, "EJSON", { enumerable: true, get: function () { return extended_json_2.EJSON; } });
var timestamp_2 = timestamp;
Object.defineProperty(exports, "LongWithoutOverridesClass", { enumerable: true, get: function () { return timestamp_2.LongWithoutOverridesClass; } });
/** @internal */
// Default Max Size
var MAXSIZE = 1024 * 1024 * 17;
// Current Internal Temporary Serialization Buffer
var buffer$1 = buffer.Buffer.alloc(MAXSIZE);
/**
 * Sets the size of the internal serialization buffer.
 *
 * @param size - The desired size for the internal serialization buffer
 * @public
 */
function setInternalBufferSize(size) {
    // Resize the internal serialization buffer if needed
    if (buffer$1.length < size) {
        buffer$1 = buffer.Buffer.alloc(size);
    }
}
exports.setInternalBufferSize = setInternalBufferSize;
/**
 * Serialize a Javascript object.
 *
 * @param object - the Javascript object to serialize.
 * @returns Buffer object containing the serialized object.
 * @public
 */
function serialize(object, options) {
    if (options === void 0) { options = {}; }
    // Unpack the options
    var checkKeys = typeof options.checkKeys === 'boolean' ? options.checkKeys : false;
    var serializeFunctions = typeof options.serializeFunctions === 'boolean' ? options.serializeFunctions : false;
    var ignoreUndefined = typeof options.ignoreUndefined === 'boolean' ? options.ignoreUndefined : true;
    var minInternalBufferSize = typeof options.minInternalBufferSize === 'number' ? options.minInternalBufferSize : MAXSIZE;
    // Resize the internal serialization buffer if needed
    if (buffer$1.length < minInternalBufferSize) {
        buffer$1 = buffer.Buffer.alloc(minInternalBufferSize);
    }
    // Attempt to serialize
    var serializationIndex = serializer.serializeInto(buffer$1, object, checkKeys, 0, 0, serializeFunctions, ignoreUndefined, []);
    // Create the final buffer
    var finishedBuffer = buffer.Buffer.alloc(serializationIndex);
    // Copy into the finished buffer
    buffer$1.copy(finishedBuffer, 0, 0, finishedBuffer.length);
    // Return the buffer
    return finishedBuffer;
}
exports.serialize = serialize;
/**
 * Serialize a Javascript object using a predefined Buffer and index into the buffer,
 * useful when pre-allocating the space for serialization.
 *
 * @param object - the Javascript object to serialize.
 * @param finalBuffer - the Buffer you pre-allocated to store the serialized BSON object.
 * @returns the index pointing to the last written byte in the buffer.
 * @public
 */
function serializeWithBufferAndIndex(object, finalBuffer, options) {
    if (options === void 0) { options = {}; }
    // Unpack the options
    var checkKeys = typeof options.checkKeys === 'boolean' ? options.checkKeys : false;
    var serializeFunctions = typeof options.serializeFunctions === 'boolean' ? options.serializeFunctions : false;
    var ignoreUndefined = typeof options.ignoreUndefined === 'boolean' ? options.ignoreUndefined : true;
    var startIndex = typeof options.index === 'number' ? options.index : 0;
    // Attempt to serialize
    var serializationIndex = serializer.serializeInto(buffer$1, object, checkKeys, 0, 0, serializeFunctions, ignoreUndefined);
    buffer$1.copy(finalBuffer, startIndex, 0, serializationIndex);
    // Return the index
    return startIndex + serializationIndex - 1;
}
exports.serializeWithBufferAndIndex = serializeWithBufferAndIndex;
/**
 * Deserialize data as BSON.
 *
 * @param buffer - the buffer containing the serialized set of BSON documents.
 * @returns returns the deserialized Javascript Object.
 * @public
 */
function deserialize(buffer, options) {
    if (options === void 0) { options = {}; }
    return deserializer.deserialize(ensure_buffer.ensureBuffer(buffer), options);
}
exports.deserialize = deserialize;
/**
 * Calculate the bson size for a passed in Javascript object.
 *
 * @param object - the Javascript object to calculate the BSON byte size for
 * @returns size of BSON object in bytes
 * @public
 */
function calculateObjectSize(object, options) {
    if (options === void 0) { options = {}; }
    options = options || {};
    var serializeFunctions = typeof options.serializeFunctions === 'boolean' ? options.serializeFunctions : false;
    var ignoreUndefined = typeof options.ignoreUndefined === 'boolean' ? options.ignoreUndefined : true;
    return calculate_size.calculateObjectSize(object, serializeFunctions, ignoreUndefined);
}
exports.calculateObjectSize = calculateObjectSize;
/**
 * Deserialize stream data as BSON documents.
 *
 * @param data - the buffer containing the serialized set of BSON documents.
 * @param startIndex - the start index in the data Buffer where the deserialization is to start.
 * @param numberOfDocuments - number of documents to deserialize.
 * @param documents - an array where to store the deserialized documents.
 * @param docStartIndex - the index in the documents array from where to start inserting documents.
 * @param options - additional options used for the deserialization.
 * @returns next index in the buffer after deserialization **x** numbers of documents.
 * @public
 */
function deserializeStream(data, startIndex, numberOfDocuments, documents, docStartIndex, options) {
    var internalOptions = Object.assign({ allowObjectSmallerThanBufferSize: true, index: 0 }, options);
    var bufferData = ensure_buffer.ensureBuffer(data);
    var index = startIndex;
    // Loop over all documents
    for (var i = 0; i < numberOfDocuments; i++) {
        // Find size of the document
        var size = bufferData[index] |
            (bufferData[index + 1] << 8) |
            (bufferData[index + 2] << 16) |
            (bufferData[index + 3] << 24);
        // Update options with index
        internalOptions.index = index;
        // Parse the document at this point
        documents[docStartIndex + i] = deserializer.deserialize(bufferData, internalOptions);
        // Adjust index by the document size
        index = index + size;
    }
    // Return object containing end index of parsing and list of documents
    return index;
}
exports.deserializeStream = deserializeStream;
/**
 * BSON default export
 * @deprecated Please use named exports
 * @privateRemarks
 * We want to someday deprecate the default export,
 * so none of the new TS types are being exported on the default
 * @public
 */
var BSON = {
    Binary: binary.Binary,
    Code: code.Code,
    DBRef: db_ref.DBRef,
    Decimal128: decimal128.Decimal128,
    Double: double_1.Double,
    Int32: int_32.Int32,
    Long: long_1.Long,
    UUID: uuid.UUID,
    Map: map.Map,
    MaxKey: max_key.MaxKey,
    MinKey: min_key.MinKey,
    ObjectId: objectid.ObjectId,
    ObjectID: objectid.ObjectId,
    BSONRegExp: regexp.BSONRegExp,
    BSONSymbol: symbol.BSONSymbol,
    Timestamp: timestamp.Timestamp,
    EJSON: extended_json.EJSON,
    setInternalBufferSize: setInternalBufferSize,
    serialize: serialize,
    serializeWithBufferAndIndex: serializeWithBufferAndIndex,
    deserialize: deserialize,
    calculateObjectSize: calculateObjectSize,
    deserializeStream: deserializeStream
};
exports.default = BSON;

});

var bson$1 = unwrapExports(bson);
var bson_1 = bson.ObjectID;
var bson_2 = bson.Decimal128;
var bson_3 = bson.BSONRegExp;
var bson_4 = bson.MaxKey;
var bson_5 = bson.MinKey;
var bson_6 = bson.Int32;
var bson_7 = bson.Double;
var bson_8 = bson.Timestamp;
var bson_9 = bson.Long;
var bson_10 = bson.UUID;
var bson_11 = bson.ObjectId;
var bson_12 = bson.Binary;
var bson_13 = bson.DBRef;
var bson_14 = bson.BSONSymbol;
var bson_15 = bson.Map;
var bson_16 = bson.Code;
var bson_17 = bson.LongWithoutOverridesClass;
var bson_18 = bson.EJSON;
var bson_19 = bson.BSON_INT64_MIN;
var bson_20 = bson.BSON_INT64_MAX;
var bson_21 = bson.BSON_INT32_MIN;
var bson_22 = bson.BSON_INT32_MAX;
var bson_23 = bson.BSON_DATA_UNDEFINED;
var bson_24 = bson.BSON_DATA_TIMESTAMP;
var bson_25 = bson.BSON_DATA_SYMBOL;
var bson_26 = bson.BSON_DATA_STRING;
var bson_27 = bson.BSON_DATA_REGEXP;
var bson_28 = bson.BSON_DATA_OID;
var bson_29 = bson.BSON_DATA_OBJECT;
var bson_30 = bson.BSON_DATA_NUMBER;
var bson_31 = bson.BSON_DATA_NULL;
var bson_32 = bson.BSON_DATA_MIN_KEY;
var bson_33 = bson.BSON_DATA_MAX_KEY;
var bson_34 = bson.BSON_DATA_LONG;
var bson_35 = bson.BSON_DATA_INT;
var bson_36 = bson.BSON_DATA_DECIMAL128;
var bson_37 = bson.BSON_DATA_DBPOINTER;
var bson_38 = bson.BSON_DATA_DATE;
var bson_39 = bson.BSON_DATA_CODE_W_SCOPE;
var bson_40 = bson.BSON_DATA_CODE;
var bson_41 = bson.BSON_DATA_BOOLEAN;
var bson_42 = bson.BSON_DATA_BINARY;
var bson_43 = bson.BSON_DATA_ARRAY;
var bson_44 = bson.BSON_BINARY_SUBTYPE_UUID_NEW;
var bson_45 = bson.BSON_BINARY_SUBTYPE_UUID;
var bson_46 = bson.BSON_BINARY_SUBTYPE_USER_DEFINED;
var bson_47 = bson.BSON_BINARY_SUBTYPE_MD5;
var bson_48 = bson.BSON_BINARY_SUBTYPE_FUNCTION;
var bson_49 = bson.BSON_BINARY_SUBTYPE_DEFAULT;
var bson_50 = bson.BSON_BINARY_SUBTYPE_BYTE_ARRAY;
var bson_51 = bson.deserializeStream;
var bson_52 = bson.calculateObjectSize;
var bson_53 = bson.deserialize;
var bson_54 = bson.serializeWithBufferAndIndex;
var bson_55 = bson.serialize;
var bson_56 = bson.setInternalBufferSize;

export default bson$1;
export { bson_3 as BSONRegExp, bson_14 as BSONSymbol, bson_50 as BSON_BINARY_SUBTYPE_BYTE_ARRAY, bson_49 as BSON_BINARY_SUBTYPE_DEFAULT, bson_48 as BSON_BINARY_SUBTYPE_FUNCTION, bson_47 as BSON_BINARY_SUBTYPE_MD5, bson_46 as BSON_BINARY_SUBTYPE_USER_DEFINED, bson_45 as BSON_BINARY_SUBTYPE_UUID, bson_44 as BSON_BINARY_SUBTYPE_UUID_NEW, bson_43 as BSON_DATA_ARRAY, bson_42 as BSON_DATA_BINARY, bson_41 as BSON_DATA_BOOLEAN, bson_40 as BSON_DATA_CODE, bson_39 as BSON_DATA_CODE_W_SCOPE, bson_38 as BSON_DATA_DATE, bson_37 as BSON_DATA_DBPOINTER, bson_36 as BSON_DATA_DECIMAL128, bson_35 as BSON_DATA_INT, bson_34 as BSON_DATA_LONG, bson_33 as BSON_DATA_MAX_KEY, bson_32 as BSON_DATA_MIN_KEY, bson_31 as BSON_DATA_NULL, bson_30 as BSON_DATA_NUMBER, bson_29 as BSON_DATA_OBJECT, bson_28 as BSON_DATA_OID, bson_27 as BSON_DATA_REGEXP, bson_26 as BSON_DATA_STRING, bson_25 as BSON_DATA_SYMBOL, bson_24 as BSON_DATA_TIMESTAMP, bson_23 as BSON_DATA_UNDEFINED, bson_22 as BSON_INT32_MAX, bson_21 as BSON_INT32_MIN, bson_20 as BSON_INT64_MAX, bson_19 as BSON_INT64_MIN, bson_12 as Binary, bson_16 as Code, bson_13 as DBRef, bson_2 as Decimal128, bson_7 as Double, bson_18 as EJSON, bson_6 as Int32, bson_9 as Long, bson_17 as LongWithoutOverridesClass, bson_15 as Map, bson_4 as MaxKey, bson_5 as MinKey, bson_1 as ObjectID, bson_11 as ObjectId, bson_8 as Timestamp, bson_10 as UUID, bson_52 as calculateObjectSize, bson_53 as deserialize, bson_51 as deserializeStream, bson_55 as serialize, bson_54 as serializeWithBufferAndIndex, bson_56 as setInternalBufferSize };
//# sourceMappingURL=bson.esm.js.map
