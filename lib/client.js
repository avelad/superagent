"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Root reference for iframes.
 */
var root;

if (typeof window !== 'undefined') {
  // Browser window
  root = window;
} else if (typeof self === 'undefined') {
  // Other environments
  console.warn('Using browser-only version of superagent in non-browser environment');
  root = void 0;
} else {
  // Web Worker
  root = self;
}

var Emitter = require('component-emitter');

var safeStringify = require('fast-safe-stringify');

var qs = require('qs');

var RequestBase = require('./request-base');

var _require = require('./utils'),
    isObject = _require.isObject,
    mixin = _require.mixin,
    hasOwn = _require.hasOwn;

var ResponseBase = require('./response-base');

var Agent = require('./agent-base');
/**
 * Noop.
 */


function noop() {}
/**
 * Expose `request`.
 */


module.exports = function (method, url) {
  // callback
  if (typeof url === 'function') {
    return new exports.Request('GET', method).end(url);
  } // url first


  if (arguments.length === 1) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
};

exports = module.exports;
var request = exports;
exports.Request = Request;
/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest) {
    return new XMLHttpRequest();
  }

  throw new Error('Browser-only version of superagent could not find XHR');
};
/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */


var trim = ''.trim ? function (s) {
  return s.trim();
} : function (s) {
  return s.replace(/(^\s*|\s*$)/g, '');
};
/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(object) {
  if (!isObject(object)) return object;
  var pairs = [];

  for (var key in object) {
    if (hasOwn(object, key)) pushEncodedKeyValuePair(pairs, key, object[key]);
  }

  return pairs.join('&');
}
/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */


function pushEncodedKeyValuePair(pairs, key, value) {
  if (value === undefined) return;

  if (value === null) {
    pairs.push(encodeURI(key));
    return;
  }

  if (Array.isArray(value)) {
    var _iterator = _createForOfIteratorHelper(value),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var v = _step.value;
        pushEncodedKeyValuePair(pairs, key, v);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  } else if (isObject(value)) {
    for (var subkey in value) {
      if (hasOwn(value, subkey)) pushEncodedKeyValuePair(pairs, "".concat(key, "[").concat(subkey, "]"), value[subkey]);
    }
  } else {
    pairs.push(encodeURI(key) + '=' + encodeURIComponent(value));
  }
}
/**
 * Expose serialization method.
 */


request.serializeObject = serialize;
/**
 * Parse the given x-www-form-urlencoded `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseString(string_) {
  var object = {};
  var pairs = string_.split('&');
  var pair;
  var pos;

  for (var i = 0, length_ = pairs.length; i < length_; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');

    if (pos === -1) {
      object[decodeURIComponent(pair)] = '';
    } else {
      object[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return object;
}
/**
 * Expose parser.
 */


request.parseString = parseString;
/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'text/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  form: 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};
/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

request.serialize = {
  'application/x-www-form-urlencoded': qs.stringify,
  'application/json': safeStringify
};
/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(str){
 *       return { object parsed from str };
 *     };
 *
 */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};
/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(string_) {
  var lines = string_.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var value;

  for (var i = 0, length_ = lines.length; i < length_; ++i) {
    line = lines[i];
    index = line.indexOf(':');

    if (index === -1) {
      // could be empty line, just skip it
      continue;
    }

    field = line.slice(0, index).toLowerCase();
    value = trim(line.slice(index + 1));
    fields[field] = value;
  }

  return fields;
}
/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */


function isJSON(mime) {
  // should match /json or +json
  // but not /json-seq
  return /[/+]json($|[^-\w])/i.test(mime);
}
/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */


function Response(request_) {
  this.req = request_;
  this.xhr = this.req.xhr; // responseText is accessible only if responseType is '' or 'text' and on older browsers

  this.text = this.req.method !== 'HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text') || typeof this.xhr.responseType === 'undefined' ? this.xhr.responseText : null;
  this.statusText = this.req.xhr.statusText;
  var status = this.xhr.status; // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request

  if (status === 1223) {
    status = 204;
  }

  this._setStatusProperties(status);

  this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  this.header = this.headers; // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.

  this.header['content-type'] = this.xhr.getResponseHeader('content-type');

  this._setHeaderProperties(this.header);

  if (this.text === null && request_._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method === 'HEAD' ? null : this._parseBody(this.text ? this.text : this.xhr.response);
  }
}

mixin(Response.prototype, ResponseBase.prototype);
/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function (string_) {
  var parse = request.parse[this.type];

  if (this.req._parser) {
    return this.req._parser(this, string_);
  }

  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }

  return parse && string_ && (string_.length > 0 || string_ instanceof Object) ? parse(string_) : null;
};
/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */


Response.prototype.toError = function () {
  var req = this.req;
  var method = req.method;
  var url = req.url;
  var message = "cannot ".concat(method, " ").concat(url, " (").concat(this.status, ")");
  var error = new Error(message);
  error.status = this.status;
  error.method = method;
  error.url = url;
  return error;
};
/**
 * Expose `Response`.
 */


request.Response = Response;
/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case

  this._header = {}; // coerces header names to lowercase

  this.on('end', function () {
    var error = null;
    var res = null;

    try {
      res = new Response(self);
    } catch (err) {
      error = new Error('Parser is unable to parse the response');
      error.parse = true;
      error.original = err; // issue #675: return the raw response if the response parsing fails

      if (self.xhr) {
        // ie9 doesn't have 'response' property
        error.rawResponse = typeof self.xhr.responseType === 'undefined' ? self.xhr.responseText : self.xhr.response; // issue #876: return the http status code if the response parsing fails

        error.status = self.xhr.status ? self.xhr.status : null;
        error.statusCode = error.status; // backwards-compat only
      } else {
        error.rawResponse = null;
        error.status = null;
      }

      return self.callback(error);
    }

    self.emit('response', res);
    var new_error;

    try {
      if (!self._isResponseOK(res)) {
        new_error = new Error(res.statusText || res.text || 'Unsuccessful HTTP response');
      }
    } catch (err) {
      new_error = err; // ok() callback can throw
    } // #1000 don't catch errors from the callback to avoid double calling it


    if (new_error) {
      new_error.original = error;
      new_error.response = res;
      new_error.status = new_error.status || res.status;
      self.callback(new_error, res);
    } else {
      self.callback(null, res);
    }
  });
}
/**
 * Mixin `Emitter` and `RequestBase`.
 */
// eslint-disable-next-line new-cap


Emitter(Request.prototype);
mixin(Request.prototype, RequestBase.prototype);
/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function (type) {
  this.set('Content-Type', request.types[type] || type);
  return this;
};
/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.accept = function (type) {
  this.set('Accept', request.types[type] || type);
  return this;
};
/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} [pass] optional in case of using 'bearer' as type
 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.auth = function (user, pass, options) {
  if (arguments.length === 1) pass = '';

  if (_typeof(pass) === 'object' && pass !== null) {
    // pass is optional and can be replaced with options
    options = pass;
    pass = '';
  }

  if (!options) {
    options = {
      type: typeof btoa === 'function' ? 'basic' : 'auto'
    };
  }

  var encoder = options.encoder ? options.encoder : function (string) {
    if (typeof btoa === 'function') {
      return btoa(string);
    }

    throw new Error('Cannot use basic auth, btoa is not a function');
  };
  return this._auth(user, pass, options, encoder);
};
/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.query = function (value) {
  if (typeof value !== 'string') value = serialize(value);
  if (value) this._query.push(value);
  return this;
};
/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.attach = function (field, file, options) {
  if (file) {
    if (this._data) {
      throw new Error("superagent can't mix .send() and .attach()");
    }

    this._getFormData().append(field, file, options || file.name);
  }

  return this;
};

Request.prototype._getFormData = function () {
  if (!this._formData) {
    this._formData = new root.FormData();
  }

  return this._formData;
};
/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */


Request.prototype.callback = function (error, res) {
  if (this._shouldRetry(error, res)) {
    return this._retry();
  }

  var fn = this._callback;
  this.clearTimeout();

  if (error) {
    if (this._maxRetries) error.retries = this._retries - 1;
    this.emit('error', error);
  }

  fn(error, res);
};
/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */


Request.prototype.crossDomainError = function () {
  var error = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  error.crossDomain = true;
  error.status = this.status;
  error.method = this.method;
  error.url = this.url;
  this.callback(error);
}; // This only warns, because the request is still likely to work


Request.prototype.agent = function () {
  console.warn('This is not supported in browser version of superagent');
  return this;
};

Request.prototype.ca = Request.prototype.agent;
Request.prototype.buffer = Request.prototype.ca; // This throws, because it can't send/receive data as expected

Request.prototype.write = function () {
  throw new Error('Streaming is not supported in browser version of superagent');
};

Request.prototype.pipe = Request.prototype.write;
/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj host object
 * @return {Boolean} is a host object
 * @api private
 */

Request.prototype._isHost = function (object) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return object && _typeof(object) === 'object' && !Array.isArray(object) && Object.prototype.toString.call(object) !== '[object Object]';
};
/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.end = function (fn) {
  if (this._endCalled) {
    console.warn('Warning: .end() was called twice. This is not supported in superagent');
  }

  this._endCalled = true; // store callback

  this._callback = fn || noop; // querystring

  this._finalizeQueryString();

  this._end();
};

Request.prototype._setUploadTimeout = function () {
  var self = this; // upload timeout it's wokrs only if deadline timeout is off

  if (this._uploadTimeout && !this._uploadTimeoutTimer) {
    this._uploadTimeoutTimer = setTimeout(function () {
      self._timeoutError('Upload timeout of ', self._uploadTimeout, 'ETIMEDOUT');
    }, this._uploadTimeout);
  }
}; // eslint-disable-next-line complexity


Request.prototype._end = function () {
  if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
  var self = this;
  this.xhr = request.getXHR();
  var xhr = this.xhr;
  var data = this._formData || this._data;

  this._setTimeouts(); // state change


  xhr.addEventListener('readystatechange', function () {
    var readyState = xhr.readyState;

    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }

    if (readyState !== 4) {
      return;
    } // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"


    var status;

    try {
      status = xhr.status;
    } catch (_unused) {
      status = 0;
    }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }

    self.emit('end');
  }); // progress

  var handleProgress = function handleProgress(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;

      if (e.percent === 100) {
        clearTimeout(self._uploadTimeoutTimer);
      }
    }

    e.direction = direction;
    self.emit('progress', e);
  };

  if (this.hasListeners('progress')) {
    try {
      xhr.addEventListener('progress', handleProgress.bind(null, 'download'));

      if (xhr.upload) {
        xhr.upload.addEventListener('progress', handleProgress.bind(null, 'upload'));
      }
    } catch (_unused2) {// Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  if (xhr.upload) {
    this._setUploadTimeout();
  } // initiate request


  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  } // CORS


  if (this._withCredentials) xhr.withCredentials = true; // body

  if (!this._formData && this.method !== 'GET' && this.method !== 'HEAD' && typeof data !== 'string' && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];

    var _serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];

    if (!_serialize && isJSON(contentType)) {
      _serialize = request.serialize['application/json'];
    }

    if (_serialize) data = _serialize(data);
  } // set header fields


  for (var field in this.header) {
    if (this.header[field] === null) continue;
    if (hasOwn(this.header, field)) xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  } // send stuff


  this.emit('request', this); // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined

  xhr.send(typeof data === 'undefined' ? null : data);
};

request.agent = function () {
  return new Agent();
};

var _loop = function _loop() {
  var method = _arr[_i];

  Agent.prototype[method.toLowerCase()] = function (url, fn) {
    var request_ = new request.Request(method, url);

    this._setDefaults(request_);

    if (fn) {
      request_.end(fn);
    }

    return request_;
  };
};

for (var _i = 0, _arr = ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE']; _i < _arr.length; _i++) {
  _loop();
}

Agent.prototype.del = Agent.prototype.delete;
/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function (url, data, fn) {
  var request_ = request('GET', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.query(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.head = function (url, data, fn) {
  var request_ = request('HEAD', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.query(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.options = function (url, data, fn) {
  var request_ = request('OPTIONS', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * DELETE `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


function del(url, data, fn) {
  var request_ = request('DELETE', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
}

request.del = del;
request.delete = del;
/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function (url, data, fn) {
  var request_ = request('PATCH', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.post = function (url, data, fn) {
  var request_ = request('POST', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.put = function (url, data, fn) {
  var request_ = request('PUT', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyb290Iiwid2luZG93Iiwic2VsZiIsImNvbnNvbGUiLCJ3YXJuIiwiRW1pdHRlciIsInJlcXVpcmUiLCJzYWZlU3RyaW5naWZ5IiwicXMiLCJSZXF1ZXN0QmFzZSIsImlzT2JqZWN0IiwibWl4aW4iLCJoYXNPd24iLCJSZXNwb25zZUJhc2UiLCJBZ2VudCIsIm5vb3AiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0aG9kIiwidXJsIiwiUmVxdWVzdCIsImVuZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsInJlcXVlc3QiLCJnZXRYSFIiLCJYTUxIdHRwUmVxdWVzdCIsIkVycm9yIiwidHJpbSIsInMiLCJyZXBsYWNlIiwic2VyaWFsaXplIiwib2JqZWN0IiwicGFpcnMiLCJrZXkiLCJwdXNoRW5jb2RlZEtleVZhbHVlUGFpciIsImpvaW4iLCJ2YWx1ZSIsInVuZGVmaW5lZCIsInB1c2giLCJlbmNvZGVVUkkiLCJBcnJheSIsImlzQXJyYXkiLCJ2Iiwic3Via2V5IiwiZW5jb2RlVVJJQ29tcG9uZW50Iiwic2VyaWFsaXplT2JqZWN0IiwicGFyc2VTdHJpbmciLCJzdHJpbmdfIiwic3BsaXQiLCJwYWlyIiwicG9zIiwiaSIsImxlbmd0aF8iLCJpbmRleE9mIiwiZGVjb2RlVVJJQ29tcG9uZW50Iiwic2xpY2UiLCJ0eXBlcyIsImh0bWwiLCJqc29uIiwieG1sIiwidXJsZW5jb2RlZCIsImZvcm0iLCJzdHJpbmdpZnkiLCJwYXJzZSIsIkpTT04iLCJwYXJzZUhlYWRlciIsImxpbmVzIiwiZmllbGRzIiwiaW5kZXgiLCJsaW5lIiwiZmllbGQiLCJ0b0xvd2VyQ2FzZSIsImlzSlNPTiIsIm1pbWUiLCJ0ZXN0IiwiUmVzcG9uc2UiLCJyZXF1ZXN0XyIsInJlcSIsInhociIsInRleHQiLCJyZXNwb25zZVR5cGUiLCJyZXNwb25zZVRleHQiLCJzdGF0dXNUZXh0Iiwic3RhdHVzIiwiX3NldFN0YXR1c1Byb3BlcnRpZXMiLCJoZWFkZXJzIiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwiaGVhZGVyIiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJfc2V0SGVhZGVyUHJvcGVydGllcyIsIl9yZXNwb25zZVR5cGUiLCJib2R5IiwicmVzcG9uc2UiLCJfcGFyc2VCb2R5IiwicHJvdG90eXBlIiwidHlwZSIsIl9wYXJzZXIiLCJPYmplY3QiLCJ0b0Vycm9yIiwibWVzc2FnZSIsImVycm9yIiwiX3F1ZXJ5IiwiX2hlYWRlciIsIm9uIiwicmVzIiwiZXJyIiwib3JpZ2luYWwiLCJyYXdSZXNwb25zZSIsInN0YXR1c0NvZGUiLCJjYWxsYmFjayIsImVtaXQiLCJuZXdfZXJyb3IiLCJfaXNSZXNwb25zZU9LIiwic2V0IiwiYWNjZXB0IiwiYXV0aCIsInVzZXIiLCJwYXNzIiwib3B0aW9ucyIsImJ0b2EiLCJlbmNvZGVyIiwic3RyaW5nIiwiX2F1dGgiLCJxdWVyeSIsImF0dGFjaCIsImZpbGUiLCJfZGF0YSIsIl9nZXRGb3JtRGF0YSIsImFwcGVuZCIsIm5hbWUiLCJfZm9ybURhdGEiLCJGb3JtRGF0YSIsIl9zaG91bGRSZXRyeSIsIl9yZXRyeSIsImZuIiwiX2NhbGxiYWNrIiwiY2xlYXJUaW1lb3V0IiwiX21heFJldHJpZXMiLCJyZXRyaWVzIiwiX3JldHJpZXMiLCJjcm9zc0RvbWFpbkVycm9yIiwiY3Jvc3NEb21haW4iLCJhZ2VudCIsImNhIiwiYnVmZmVyIiwid3JpdGUiLCJwaXBlIiwiX2lzSG9zdCIsInRvU3RyaW5nIiwiY2FsbCIsIl9lbmRDYWxsZWQiLCJfZmluYWxpemVRdWVyeVN0cmluZyIsIl9lbmQiLCJfc2V0VXBsb2FkVGltZW91dCIsIl91cGxvYWRUaW1lb3V0IiwiX3VwbG9hZFRpbWVvdXRUaW1lciIsInNldFRpbWVvdXQiLCJfdGltZW91dEVycm9yIiwiX2Fib3J0ZWQiLCJkYXRhIiwiX3NldFRpbWVvdXRzIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlYWR5U3RhdGUiLCJfcmVzcG9uc2VUaW1lb3V0VGltZXIiLCJ0aW1lZG91dCIsImhhbmRsZVByb2dyZXNzIiwiZGlyZWN0aW9uIiwiZSIsInRvdGFsIiwicGVyY2VudCIsImxvYWRlZCIsImhhc0xpc3RlbmVycyIsImJpbmQiLCJ1cGxvYWQiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwib3BlbiIsIl93aXRoQ3JlZGVudGlhbHMiLCJ3aXRoQ3JlZGVudGlhbHMiLCJjb250ZW50VHlwZSIsIl9zZXJpYWxpemVyIiwic2V0UmVxdWVzdEhlYWRlciIsInNlbmQiLCJfc2V0RGVmYXVsdHMiLCJkZWwiLCJkZWxldGUiLCJnZXQiLCJoZWFkIiwicGF0Y2giLCJwb3N0IiwicHV0Il0sInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbmxldCByb290O1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIEJyb3dzZXIgd2luZG93XG4gIHJvb3QgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmID09PSAndW5kZWZpbmVkJykge1xuICAvLyBPdGhlciBlbnZpcm9ubWVudHNcbiAgY29uc29sZS53YXJuKFxuICAgICdVc2luZyBicm93c2VyLW9ubHkgdmVyc2lvbiBvZiBzdXBlcmFnZW50IGluIG5vbi1icm93c2VyIGVudmlyb25tZW50J1xuICApO1xuICByb290ID0gdGhpcztcbn0gZWxzZSB7XG4gIC8vIFdlYiBXb3JrZXJcbiAgcm9vdCA9IHNlbGY7XG59XG5cbmNvbnN0IEVtaXR0ZXIgPSByZXF1aXJlKCdjb21wb25lbnQtZW1pdHRlcicpO1xuY29uc3Qgc2FmZVN0cmluZ2lmeSA9IHJlcXVpcmUoJ2Zhc3Qtc2FmZS1zdHJpbmdpZnknKTtcbmNvbnN0IHFzID0gcmVxdWlyZSgncXMnKTtcbmNvbnN0IFJlcXVlc3RCYXNlID0gcmVxdWlyZSgnLi9yZXF1ZXN0LWJhc2UnKTtcbmNvbnN0IHsgaXNPYmplY3QsIG1peGluLCBoYXNPd24gfSA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbmNvbnN0IFJlc3BvbnNlQmFzZSA9IHJlcXVpcmUoJy4vcmVzcG9uc2UtYmFzZScpO1xuY29uc3QgQWdlbnQgPSByZXF1aXJlKCcuL2FnZW50LWJhc2UnKTtcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKHR5cGVvZiB1cmwgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gbmV3IGV4cG9ydHMuUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBuZXcgZXhwb3J0cy5SZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QobWV0aG9kLCB1cmwpO1xufTtcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzO1xuXG5jb25zdCByZXF1ZXN0ID0gZXhwb3J0cztcblxuZXhwb3J0cy5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbnJlcXVlc3QuZ2V0WEhSID0gKCkgPT4ge1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdCkge1xuICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignQnJvd3Nlci1vbmx5IHZlcnNpb24gb2Ygc3VwZXJhZ2VudCBjb3VsZCBub3QgZmluZCBYSFInKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5jb25zdCB0cmltID0gJycudHJpbSA/IChzKSA9PiBzLnRyaW0oKSA6IChzKSA9PiBzLnJlcGxhY2UoLyheXFxzKnxcXHMqJCkvZywgJycpO1xuXG4vKipcbiAqIFNlcmlhbGl6ZSB0aGUgZ2l2ZW4gYG9iamAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VyaWFsaXplKG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHJldHVybiBvYmplY3Q7XG4gIGNvbnN0IHBhaXJzID0gW107XG4gIGZvciAoY29uc3Qga2V5IGluIG9iamVjdCkge1xuICAgIGlmIChoYXNPd24ob2JqZWN0LCBrZXkpKSBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCBvYmplY3Rba2V5XSk7XG4gIH1cblxuICByZXR1cm4gcGFpcnMuam9pbignJicpO1xufVxuXG4vKipcbiAqIEhlbHBzICdzZXJpYWxpemUnIHdpdGggc2VyaWFsaXppbmcgYXJyYXlzLlxuICogTXV0YXRlcyB0aGUgcGFpcnMgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGFpcnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICovXG5cbmZ1bmN0aW9uIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBrZXksIHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgIHBhaXJzLnB1c2goZW5jb2RlVVJJKGtleSkpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGZvciAoY29uc3QgdiBvZiB2YWx1ZSkge1xuICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgdik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgIGZvciAoY29uc3Qgc3Via2V5IGluIHZhbHVlKSB7XG4gICAgICBpZiAoaGFzT3duKHZhbHVlLCBzdWJrZXkpKVxuICAgICAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywgYCR7a2V5fVske3N1YmtleX1dYCwgdmFsdWVbc3Via2V5XSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHBhaXJzLnB1c2goZW5jb2RlVVJJKGtleSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG5yZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cmluZ18pIHtcbiAgY29uc3Qgb2JqZWN0ID0ge307XG4gIGNvbnN0IHBhaXJzID0gc3RyaW5nXy5zcGxpdCgnJicpO1xuICBsZXQgcGFpcjtcbiAgbGV0IHBvcztcblxuICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoXyA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbmd0aF87ICsraSkge1xuICAgIHBhaXIgPSBwYWlyc1tpXTtcbiAgICBwb3MgPSBwYWlyLmluZGV4T2YoJz0nKTtcbiAgICBpZiAocG9zID09PSAtMSkge1xuICAgICAgb2JqZWN0W2RlY29kZVVSSUNvbXBvbmVudChwYWlyKV0gPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqZWN0W2RlY29kZVVSSUNvbXBvbmVudChwYWlyLnNsaWNlKDAsIHBvcykpXSA9IGRlY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgcGFpci5zbGljZShwb3MgKyAxKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqZWN0O1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAndGV4dC94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgZm9ybTogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbnJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogcXMuc3RyaW5naWZ5LFxuICAnYXBwbGljYXRpb24vanNvbic6IHNhZmVTdHJpbmdpZnlcbn07XG5cbi8qKlxuICogRGVmYXVsdCBwYXJzZXJzLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gKiAgICAgfTtcbiAqXG4gKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHJpbmdfKSB7XG4gIGNvbnN0IGxpbmVzID0gc3RyaW5nXy5zcGxpdCgvXFxyP1xcbi8pO1xuICBjb25zdCBmaWVsZHMgPSB7fTtcbiAgbGV0IGluZGV4O1xuICBsZXQgbGluZTtcbiAgbGV0IGZpZWxkO1xuICBsZXQgdmFsdWU7XG5cbiAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aF8gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW5ndGhfOyArK2kpIHtcbiAgICBsaW5lID0gbGluZXNbaV07XG4gICAgaW5kZXggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAvLyBjb3VsZCBiZSBlbXB0eSBsaW5lLCBqdXN0IHNraXAgaXRcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWx1ZSA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gZmllbGRzO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGBtaW1lYCBpcyBqc29uIG9yIGhhcyAranNvbiBzdHJ1Y3R1cmVkIHN5bnRheCBzdWZmaXguXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1pbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0pTT04obWltZSkge1xuICAvLyBzaG91bGQgbWF0Y2ggL2pzb24gb3IgK2pzb25cbiAgLy8gYnV0IG5vdCAvanNvbi1zZXFcbiAgcmV0dXJuIC9bLytdanNvbigkfFteLVxcd10pL2kudGVzdChtaW1lKTtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXNwb25zZWAgd2l0aCB0aGUgZ2l2ZW4gYHhocmAuXG4gKlxuICogIC0gc2V0IGZsYWdzICgub2ssIC5lcnJvciwgZXRjKVxuICogIC0gcGFyc2UgaGVhZGVyXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogIEFsaWFzaW5nIGBzdXBlcmFnZW50YCBhcyBgcmVxdWVzdGAgaXMgbmljZTpcbiAqXG4gKiAgICAgIHJlcXVlc3QgPSBzdXBlcmFnZW50O1xuICpcbiAqICBXZSBjYW4gdXNlIHRoZSBwcm9taXNlLWxpa2UgQVBJLCBvciBwYXNzIGNhbGxiYWNrczpcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJykuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJywgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgU2VuZGluZyBkYXRhIGNhbiBiZSBjaGFpbmVkOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5zZW5kKClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnBvc3QoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIE9yIGZ1cnRoZXIgcmVkdWNlZCB0byBhIHNpbmdsZSBjYWxsIGZvciBzaW1wbGUgY2FzZXM6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogQHBhcmFtIHtYTUxIVFRQUmVxdWVzdH0geGhyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gUmVzcG9uc2UocmVxdWVzdF8pIHtcbiAgdGhpcy5yZXEgPSByZXF1ZXN0XztcbiAgdGhpcy54aHIgPSB0aGlzLnJlcS54aHI7XG4gIC8vIHJlc3BvbnNlVGV4dCBpcyBhY2Nlc3NpYmxlIG9ubHkgaWYgcmVzcG9uc2VUeXBlIGlzICcnIG9yICd0ZXh0JyBhbmQgb24gb2xkZXIgYnJvd3NlcnNcbiAgdGhpcy50ZXh0ID1cbiAgICAodGhpcy5yZXEubWV0aG9kICE9PSAnSEVBRCcgJiZcbiAgICAgICh0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICcnIHx8IHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnKSkgfHxcbiAgICB0eXBlb2YgdGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAndW5kZWZpbmVkJ1xuICAgICAgPyB0aGlzLnhoci5yZXNwb25zZVRleHRcbiAgICAgIDogbnVsbDtcbiAgdGhpcy5zdGF0dXNUZXh0ID0gdGhpcy5yZXEueGhyLnN0YXR1c1RleHQ7XG4gIGxldCB7IHN0YXR1cyB9ID0gdGhpcy54aHI7XG4gIC8vIGhhbmRsZSBJRTkgYnVnOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEwMDQ2OTcyL21zaWUtcmV0dXJucy1zdGF0dXMtY29kZS1vZi0xMjIzLWZvci1hamF4LXJlcXVlc3RcbiAgaWYgKHN0YXR1cyA9PT0gMTIyMykge1xuICAgIHN0YXR1cyA9IDIwNDtcbiAgfVxuXG4gIHRoaXMuX3NldFN0YXR1c1Byb3BlcnRpZXMoc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXJzID0gcGFyc2VIZWFkZXIodGhpcy54aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycztcbiAgLy8gZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIHNvbWV0aW1lcyBmYWxzZWx5IHJldHVybnMgXCJcIiBmb3IgQ09SUyByZXF1ZXN0cywgYnV0XG4gIC8vIGdldFJlc3BvbnNlSGVhZGVyIHN0aWxsIHdvcmtzLiBzbyB3ZSBnZXQgY29udGVudC10eXBlIGV2ZW4gaWYgZ2V0dGluZ1xuICAvLyBvdGhlciBoZWFkZXJzIGZhaWxzLlxuICB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG4gIHRoaXMuX3NldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuXG4gIGlmICh0aGlzLnRleHQgPT09IG51bGwgJiYgcmVxdWVzdF8uX3Jlc3BvbnNlVHlwZSkge1xuICAgIHRoaXMuYm9keSA9IHRoaXMueGhyLnJlc3BvbnNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuYm9keSA9XG4gICAgICB0aGlzLnJlcS5tZXRob2QgPT09ICdIRUFEJ1xuICAgICAgICA/IG51bGxcbiAgICAgICAgOiB0aGlzLl9wYXJzZUJvZHkodGhpcy50ZXh0ID8gdGhpcy50ZXh0IDogdGhpcy54aHIucmVzcG9uc2UpO1xuICB9XG59XG5cbm1peGluKFJlc3BvbnNlLnByb3RvdHlwZSwgUmVzcG9uc2VCYXNlLnByb3RvdHlwZSk7XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuX3BhcnNlQm9keSA9IGZ1bmN0aW9uIChzdHJpbmdfKSB7XG4gIGxldCBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgaWYgKHRoaXMucmVxLl9wYXJzZXIpIHtcbiAgICByZXR1cm4gdGhpcy5yZXEuX3BhcnNlcih0aGlzLCBzdHJpbmdfKTtcbiAgfVxuXG4gIGlmICghcGFyc2UgJiYgaXNKU09OKHRoaXMudHlwZSkpIHtcbiAgICBwYXJzZSA9IHJlcXVlc3QucGFyc2VbJ2FwcGxpY2F0aW9uL2pzb24nXTtcbiAgfVxuXG4gIHJldHVybiBwYXJzZSAmJiBzdHJpbmdfICYmIChzdHJpbmdfLmxlbmd0aCA+IDAgfHwgc3RyaW5nXyBpbnN0YW5jZW9mIE9iamVjdClcbiAgICA/IHBhcnNlKHN0cmluZ18pXG4gICAgOiBudWxsO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYEVycm9yYCByZXByZXNlbnRhdGl2ZSBvZiB0aGlzIHJlc3BvbnNlLlxuICpcbiAqIEByZXR1cm4ge0Vycm9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9FcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgeyByZXEgfSA9IHRoaXM7XG4gIGNvbnN0IHsgbWV0aG9kIH0gPSByZXE7XG4gIGNvbnN0IHsgdXJsIH0gPSByZXE7XG5cbiAgY29uc3QgbWVzc2FnZSA9IGBjYW5ub3QgJHttZXRob2R9ICR7dXJsfSAoJHt0aGlzLnN0YXR1c30pYDtcbiAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIGVycm9yLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnJvci5tZXRob2QgPSBtZXRob2Q7XG4gIGVycm9yLnVybCA9IHVybDtcblxuICByZXR1cm4gZXJyb3I7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307IC8vIHByZXNlcnZlcyBoZWFkZXIgbmFtZSBjYXNlXG4gIHRoaXMuX2hlYWRlciA9IHt9OyAvLyBjb2VyY2VzIGhlYWRlciBuYW1lcyB0byBsb3dlcmNhc2VcbiAgdGhpcy5vbignZW5kJywgKCkgPT4ge1xuICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgbGV0IHJlcyA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnJvci5wYXJzZSA9IHRydWU7XG4gICAgICBlcnJvci5vcmlnaW5hbCA9IGVycjtcbiAgICAgIC8vIGlzc3VlICM2NzU6IHJldHVybiB0aGUgcmF3IHJlc3BvbnNlIGlmIHRoZSByZXNwb25zZSBwYXJzaW5nIGZhaWxzXG4gICAgICBpZiAoc2VsZi54aHIpIHtcbiAgICAgICAgLy8gaWU5IGRvZXNuJ3QgaGF2ZSAncmVzcG9uc2UnIHByb3BlcnR5XG4gICAgICAgIGVycm9yLnJhd1Jlc3BvbnNlID1cbiAgICAgICAgICB0eXBlb2Ygc2VsZi54aHIucmVzcG9uc2VUeXBlID09PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgPyBzZWxmLnhoci5yZXNwb25zZVRleHRcbiAgICAgICAgICAgIDogc2VsZi54aHIucmVzcG9uc2U7XG4gICAgICAgIC8vIGlzc3VlICM4NzY6IHJldHVybiB0aGUgaHR0cCBzdGF0dXMgY29kZSBpZiB0aGUgcmVzcG9uc2UgcGFyc2luZyBmYWlsc1xuICAgICAgICBlcnJvci5zdGF0dXMgPSBzZWxmLnhoci5zdGF0dXMgPyBzZWxmLnhoci5zdGF0dXMgOiBudWxsO1xuICAgICAgICBlcnJvci5zdGF0dXNDb2RlID0gZXJyb3Iuc3RhdHVzOyAvLyBiYWNrd2FyZHMtY29tcGF0IG9ubHlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVycm9yLnJhd1Jlc3BvbnNlID0gbnVsbDtcbiAgICAgICAgZXJyb3Iuc3RhdHVzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyb3IpO1xuICAgIH1cblxuICAgIHNlbGYuZW1pdCgncmVzcG9uc2UnLCByZXMpO1xuXG4gICAgbGV0IG5ld19lcnJvcjtcbiAgICB0cnkge1xuICAgICAgaWYgKCFzZWxmLl9pc1Jlc3BvbnNlT0socmVzKSkge1xuICAgICAgICBuZXdfZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgcmVzLnN0YXR1c1RleHQgfHwgcmVzLnRleHQgfHwgJ1Vuc3VjY2Vzc2Z1bCBIVFRQIHJlc3BvbnNlJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbmV3X2Vycm9yID0gZXJyOyAvLyBvaygpIGNhbGxiYWNrIGNhbiB0aHJvd1xuICAgIH1cblxuICAgIC8vICMxMDAwIGRvbid0IGNhdGNoIGVycm9ycyBmcm9tIHRoZSBjYWxsYmFjayB0byBhdm9pZCBkb3VibGUgY2FsbGluZyBpdFxuICAgIGlmIChuZXdfZXJyb3IpIHtcbiAgICAgIG5ld19lcnJvci5vcmlnaW5hbCA9IGVycm9yO1xuICAgICAgbmV3X2Vycm9yLnJlc3BvbnNlID0gcmVzO1xuICAgICAgbmV3X2Vycm9yLnN0YXR1cyA9IG5ld19lcnJvci5zdGF0dXMgfHwgcmVzLnN0YXR1cztcbiAgICAgIHNlbGYuY2FsbGJhY2sobmV3X2Vycm9yLCByZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmNhbGxiYWNrKG51bGwsIHJlcyk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAgYW5kIGBSZXF1ZXN0QmFzZWAuXG4gKi9cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5ldy1jYXBcbkVtaXR0ZXIoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG5taXhpbihSZXF1ZXN0LnByb3RvdHlwZSwgUmVxdWVzdEJhc2UucHJvdG90eXBlKTtcblxuLyoqXG4gKiBTZXQgQ29udGVudC1UeXBlIHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi94bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHRoaXMuc2V0KCdBY2NlcHQnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEF1dGhvcml6YXRpb24gZmllbGQgdmFsdWUgd2l0aCBgdXNlcmAgYW5kIGBwYXNzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IFtwYXNzXSBvcHRpb25hbCBpbiBjYXNlIG9mIHVzaW5nICdiZWFyZXInIGFzIHR5cGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIHdpdGggJ3R5cGUnIHByb3BlcnR5ICdhdXRvJywgJ2Jhc2ljJyBvciAnYmVhcmVyJyAoZGVmYXVsdCAnYmFzaWMnKVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbiAodXNlciwgcGFzcywgb3B0aW9ucykge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkgcGFzcyA9ICcnO1xuICBpZiAodHlwZW9mIHBhc3MgPT09ICdvYmplY3QnICYmIHBhc3MgIT09IG51bGwpIHtcbiAgICAvLyBwYXNzIGlzIG9wdGlvbmFsIGFuZCBjYW4gYmUgcmVwbGFjZWQgd2l0aCBvcHRpb25zXG4gICAgb3B0aW9ucyA9IHBhc3M7XG4gICAgcGFzcyA9ICcnO1xuICB9XG5cbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIHR5cGU6IHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nID8gJ2Jhc2ljJyA6ICdhdXRvJ1xuICAgIH07XG4gIH1cblxuICBjb25zdCBlbmNvZGVyID0gb3B0aW9ucy5lbmNvZGVyXG4gICAgPyBvcHRpb25zLmVuY29kZXJcbiAgICA6IChzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcmV0dXJuIGJ0b2Eoc3RyaW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHVzZSBiYXNpYyBhdXRoLCBidG9hIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgICB9O1xuXG4gIHJldHVybiB0aGlzLl9hdXRoKHVzZXIsIHBhc3MsIG9wdGlvbnMsIGVuY29kZXIpO1xufTtcblxuLyoqXG4gKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4gKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiAqICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgdmFsdWUgPSBzZXJpYWxpemUodmFsdWUpO1xuICBpZiAodmFsdWUpIHRoaXMuX3F1ZXJ5LnB1c2godmFsdWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUXVldWUgdGhlIGdpdmVuIGBmaWxlYCBhcyBhbiBhdHRhY2htZW50IHRvIHRoZSBzcGVjaWZpZWQgYGZpZWxkYCxcbiAqIHdpdGggb3B0aW9uYWwgYG9wdGlvbnNgIChvciBmaWxlbmFtZSkuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKCdjb250ZW50JywgbmV3IEJsb2IoWyc8YSBpZD1cImFcIj48YiBpZD1cImJcIj5oZXkhPC9iPjwvYT4nXSwgeyB0eXBlOiBcInRleHQvaHRtbFwifSkpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcGFyYW0ge0Jsb2J8RmlsZX0gZmlsZVxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24gKGZpZWxkLCBmaWxlLCBvcHRpb25zKSB7XG4gIGlmIChmaWxlKSB7XG4gICAgaWYgKHRoaXMuX2RhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInN1cGVyYWdlbnQgY2FuJ3QgbWl4IC5zZW5kKCkgYW5kIC5hdHRhY2goKVwiKTtcbiAgICB9XG5cbiAgICB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChmaWVsZCwgZmlsZSwgb3B0aW9ucyB8fCBmaWxlLm5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5fZ2V0Rm9ybURhdGEgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHtcbiAgICB0aGlzLl9mb3JtRGF0YSA9IG5ldyByb290LkZvcm1EYXRhKCk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5fZm9ybURhdGE7XG59O1xuXG4vKipcbiAqIEludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBgZXJyYCBhbmQgYHJlc2BcbiAqIGFuZCBoYW5kbGUgYXJpdHkgY2hlY2suXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24gKGVycm9yLCByZXMpIHtcbiAgaWYgKHRoaXMuX3Nob3VsZFJldHJ5KGVycm9yLCByZXMpKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JldHJ5KCk7XG4gIH1cblxuICBjb25zdCBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuXG4gIGlmIChlcnJvcikge1xuICAgIGlmICh0aGlzLl9tYXhSZXRyaWVzKSBlcnJvci5yZXRyaWVzID0gdGhpcy5fcmV0cmllcyAtIDE7XG4gICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycm9yKTtcbiAgfVxuXG4gIGZuKGVycm9yLCByZXMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB4LWRvbWFpbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jcm9zc0RvbWFpbkVycm9yID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAnUmVxdWVzdCBoYXMgYmVlbiB0ZXJtaW5hdGVkXFxuUG9zc2libGUgY2F1c2VzOiB0aGUgbmV0d29yayBpcyBvZmZsaW5lLCBPcmlnaW4gaXMgbm90IGFsbG93ZWQgYnkgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luLCB0aGUgcGFnZSBpcyBiZWluZyB1bmxvYWRlZCwgZXRjLidcbiAgKTtcbiAgZXJyb3IuY3Jvc3NEb21haW4gPSB0cnVlO1xuXG4gIGVycm9yLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnJvci5tZXRob2QgPSB0aGlzLm1ldGhvZDtcbiAgZXJyb3IudXJsID0gdGhpcy51cmw7XG5cbiAgdGhpcy5jYWxsYmFjayhlcnJvcik7XG59O1xuXG4vLyBUaGlzIG9ubHkgd2FybnMsIGJlY2F1c2UgdGhlIHJlcXVlc3QgaXMgc3RpbGwgbGlrZWx5IHRvIHdvcmtcblJlcXVlc3QucHJvdG90eXBlLmFnZW50ID0gZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLndhcm4oJ1RoaXMgaXMgbm90IHN1cHBvcnRlZCBpbiBicm93c2VyIHZlcnNpb24gb2Ygc3VwZXJhZ2VudCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLmNhID0gUmVxdWVzdC5wcm90b3R5cGUuYWdlbnQ7XG5SZXF1ZXN0LnByb3RvdHlwZS5idWZmZXIgPSBSZXF1ZXN0LnByb3RvdHlwZS5jYTtcblxuLy8gVGhpcyB0aHJvd3MsIGJlY2F1c2UgaXQgY2FuJ3Qgc2VuZC9yZWNlaXZlIGRhdGEgYXMgZXhwZWN0ZWRcblJlcXVlc3QucHJvdG90eXBlLndyaXRlID0gKCkgPT4ge1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgJ1N0cmVhbWluZyBpcyBub3Qgc3VwcG9ydGVkIGluIGJyb3dzZXIgdmVyc2lvbiBvZiBzdXBlcmFnZW50J1xuICApO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUucGlwZSA9IFJlcXVlc3QucHJvdG90eXBlLndyaXRlO1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogaG9zdCBvYmplY3RcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGlzIGEgaG9zdCBvYmplY3RcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5SZXF1ZXN0LnByb3RvdHlwZS5faXNIb3N0ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAvLyBOYXRpdmUgb2JqZWN0cyBzdHJpbmdpZnkgdG8gW29iamVjdCBGaWxlXSwgW29iamVjdCBCbG9iXSwgW29iamVjdCBGb3JtRGF0YV0sIGV0Yy5cbiAgcmV0dXJuIChcbiAgICBvYmplY3QgJiZcbiAgICB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICFBcnJheS5pc0FycmF5KG9iamVjdCkgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSAhPT0gJ1tvYmplY3QgT2JqZWN0XSdcbiAgKTtcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uIChmbikge1xuICBpZiAodGhpcy5fZW5kQ2FsbGVkKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ1dhcm5pbmc6IC5lbmQoKSB3YXMgY2FsbGVkIHR3aWNlLiBUaGlzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gc3VwZXJhZ2VudCdcbiAgICApO1xuICB9XG5cbiAgdGhpcy5fZW5kQ2FsbGVkID0gdHJ1ZTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgdGhpcy5fZmluYWxpemVRdWVyeVN0cmluZygpO1xuXG4gIHRoaXMuX2VuZCgpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuX3NldFVwbG9hZFRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gIC8vIHVwbG9hZCB0aW1lb3V0IGl0J3Mgd29rcnMgb25seSBpZiBkZWFkbGluZSB0aW1lb3V0IGlzIG9mZlxuICBpZiAodGhpcy5fdXBsb2FkVGltZW91dCAmJiAhdGhpcy5fdXBsb2FkVGltZW91dFRpbWVyKSB7XG4gICAgdGhpcy5fdXBsb2FkVGltZW91dFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZWxmLl90aW1lb3V0RXJyb3IoXG4gICAgICAgICdVcGxvYWQgdGltZW91dCBvZiAnLFxuICAgICAgICBzZWxmLl91cGxvYWRUaW1lb3V0LFxuICAgICAgICAnRVRJTUVET1VUJ1xuICAgICAgKTtcbiAgICB9LCB0aGlzLl91cGxvYWRUaW1lb3V0KTtcbiAgfVxufTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcblJlcXVlc3QucHJvdG90eXBlLl9lbmQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLl9hYm9ydGVkKVxuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKFxuICAgICAgbmV3IEVycm9yKCdUaGUgcmVxdWVzdCBoYXMgYmVlbiBhYm9ydGVkIGV2ZW4gYmVmb3JlIC5lbmQoKSB3YXMgY2FsbGVkJylcbiAgICApO1xuXG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICB0aGlzLnhociA9IHJlcXVlc3QuZ2V0WEhSKCk7XG4gIGNvbnN0IHsgeGhyIH0gPSB0aGlzO1xuICBsZXQgZGF0YSA9IHRoaXMuX2Zvcm1EYXRhIHx8IHRoaXMuX2RhdGE7XG5cbiAgdGhpcy5fc2V0VGltZW91dHMoKTtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3JlYWR5c3RhdGVjaGFuZ2UnLCAoKSA9PiB7XG4gICAgY29uc3QgeyByZWFkeVN0YXRlIH0gPSB4aHI7XG4gICAgaWYgKHJlYWR5U3RhdGUgPj0gMiAmJiBzZWxmLl9yZXNwb25zZVRpbWVvdXRUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuX3Jlc3BvbnNlVGltZW91dFRpbWVyKTtcbiAgICB9XG5cbiAgICBpZiAocmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEluIElFOSwgcmVhZHMgdG8gYW55IHByb3BlcnR5IChlLmcuIHN0YXR1cykgb2ZmIG9mIGFuIGFib3J0ZWQgWEhSIHdpbGxcbiAgICAvLyByZXN1bHQgaW4gdGhlIGVycm9yIFwiQ291bGQgbm90IGNvbXBsZXRlIHRoZSBvcGVyYXRpb24gZHVlIHRvIGVycm9yIGMwMGMwMjNmXCJcbiAgICBsZXQgc3RhdHVzO1xuICAgIHRyeSB7XG4gICAgICBzdGF0dXMgPSB4aHIuc3RhdHVzO1xuICAgIH0gY2F0Y2gge1xuICAgICAgc3RhdHVzID0gMDtcbiAgICB9XG5cbiAgICBpZiAoIXN0YXR1cykge1xuICAgICAgaWYgKHNlbGYudGltZWRvdXQgfHwgc2VsZi5fYWJvcnRlZCkgcmV0dXJuO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cblxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH0pO1xuXG4gIC8vIHByb2dyZXNzXG4gIGNvbnN0IGhhbmRsZVByb2dyZXNzID0gKGRpcmVjdGlvbiwgZSkgPT4ge1xuICAgIGlmIChlLnRvdGFsID4gMCkge1xuICAgICAgZS5wZXJjZW50ID0gKGUubG9hZGVkIC8gZS50b3RhbCkgKiAxMDA7XG5cbiAgICAgIGlmIChlLnBlcmNlbnQgPT09IDEwMCkge1xuICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5fdXBsb2FkVGltZW91dFRpbWVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICBzZWxmLmVtaXQoJ3Byb2dyZXNzJywgZSk7XG4gIH07XG5cbiAgaWYgKHRoaXMuaGFzTGlzdGVuZXJzKCdwcm9ncmVzcycpKSB7XG4gICAgdHJ5IHtcbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGhhbmRsZVByb2dyZXNzLmJpbmQobnVsbCwgJ2Rvd25sb2FkJykpO1xuICAgICAgaWYgKHhoci51cGxvYWQpIHtcbiAgICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICdwcm9ncmVzcycsXG4gICAgICAgICAgaGFuZGxlUHJvZ3Jlc3MuYmluZChudWxsLCAndXBsb2FkJylcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIEFjY2Vzc2luZyB4aHIudXBsb2FkIGZhaWxzIGluIElFIGZyb20gYSB3ZWIgd29ya2VyLCBzbyBqdXN0IHByZXRlbmQgaXQgZG9lc24ndCBleGlzdC5cbiAgICAgIC8vIFJlcG9ydGVkIGhlcmU6XG4gICAgICAvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzgzNzI0NS94bWxodHRwcmVxdWVzdC11cGxvYWQtdGhyb3dzLWludmFsaWQtYXJndW1lbnQtd2hlbi11c2VkLWZyb20td2ViLXdvcmtlci1jb250ZXh0XG4gICAgfVxuICB9XG5cbiAgaWYgKHhoci51cGxvYWQpIHtcbiAgICB0aGlzLl9zZXRVcGxvYWRUaW1lb3V0KCk7XG4gIH1cblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIHRyeSB7XG4gICAgaWYgKHRoaXMudXNlcm5hbWUgJiYgdGhpcy5wYXNzd29yZCkge1xuICAgICAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlLCB0aGlzLnVzZXJuYW1lLCB0aGlzLnBhc3N3b3JkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIC8vIHNlZSAjMTE0OVxuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKGVycik7XG4gIH1cblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKFxuICAgICF0aGlzLl9mb3JtRGF0YSAmJlxuICAgIHRoaXMubWV0aG9kICE9PSAnR0VUJyAmJlxuICAgIHRoaXMubWV0aG9kICE9PSAnSEVBRCcgJiZcbiAgICB0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycgJiZcbiAgICAhdGhpcy5faXNIb3N0KGRhdGEpXG4gICkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gdGhpcy5faGVhZGVyWydjb250ZW50LXR5cGUnXTtcbiAgICBsZXQgc2VyaWFsaXplID1cbiAgICAgIHRoaXMuX3NlcmlhbGl6ZXIgfHxcbiAgICAgIHJlcXVlc3Quc2VyaWFsaXplW2NvbnRlbnRUeXBlID8gY29udGVudFR5cGUuc3BsaXQoJzsnKVswXSA6ICcnXTtcbiAgICBpZiAoIXNlcmlhbGl6ZSAmJiBpc0pTT04oY29udGVudFR5cGUpKSB7XG4gICAgICBzZXJpYWxpemUgPSByZXF1ZXN0LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24vanNvbiddO1xuICAgIH1cblxuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKGNvbnN0IGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKHRoaXMuaGVhZGVyW2ZpZWxkXSA9PT0gbnVsbCkgY29udGludWU7XG5cbiAgICBpZiAoaGFzT3duKHRoaXMuaGVhZGVyLCBmaWVsZCkpXG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIGlmICh0aGlzLl9yZXNwb25zZVR5cGUpIHtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gdGhpcy5fcmVzcG9uc2VUeXBlO1xuICB9XG5cbiAgLy8gc2VuZCBzdHVmZlxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcblxuICAvLyBJRTExIHhoci5zZW5kKHVuZGVmaW5lZCkgc2VuZHMgJ3VuZGVmaW5lZCcgc3RyaW5nIGFzIFBPU1QgcGF5bG9hZCAoaW5zdGVhZCBvZiBub3RoaW5nKVxuICAvLyBXZSBuZWVkIG51bGwgaGVyZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICB4aHIuc2VuZCh0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogZGF0YSk7XG59O1xuXG5yZXF1ZXN0LmFnZW50ID0gKCkgPT4gbmV3IEFnZW50KCk7XG5cbmZvciAoY29uc3QgbWV0aG9kIG9mIFsnR0VUJywgJ1BPU1QnLCAnT1BUSU9OUycsICdQQVRDSCcsICdQVVQnLCAnREVMRVRFJ10pIHtcbiAgQWdlbnQucHJvdG90eXBlW21ldGhvZC50b0xvd2VyQ2FzZSgpXSA9IGZ1bmN0aW9uICh1cmwsIGZuKSB7XG4gICAgY29uc3QgcmVxdWVzdF8gPSBuZXcgcmVxdWVzdC5SZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbiAgICB0aGlzLl9zZXREZWZhdWx0cyhyZXF1ZXN0Xyk7XG4gICAgaWYgKGZuKSB7XG4gICAgICByZXF1ZXN0Xy5lbmQoZm4pO1xuICAgIH1cblxuICAgIHJldHVybiByZXF1ZXN0XztcbiAgfTtcbn1cblxuQWdlbnQucHJvdG90eXBlLmRlbCA9IEFnZW50LnByb3RvdHlwZS5kZWxldGU7XG5cbi8qKlxuICogR0VUIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IFtkYXRhXSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ0dFVCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXF1ZXN0Xy5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59O1xuXG4vKipcbiAqIEhFQUQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gW2RhdGFdIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmhlYWQgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ0hFQUQnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8ucXVlcnkoZGF0YSk7XG4gIGlmIChmbikgcmVxdWVzdF8uZW5kKGZuKTtcbiAgcmV0dXJuIHJlcXVlc3RfO1xufTtcblxuLyoqXG4gKiBPUFRJT05TIHF1ZXJ5IHRvIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IFtkYXRhXSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5vcHRpb25zID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgY29uc3QgcmVxdWVzdF8gPSByZXF1ZXN0KCdPUFRJT05TJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcXVlc3RfLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxdWVzdF8uZW5kKGZuKTtcbiAgcmV0dXJuIHJlcXVlc3RfO1xufTtcblxuLyoqXG4gKiBERUxFVEUgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBbZGF0YV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlbCh1cmwsIGRhdGEsIGZuKSB7XG4gIGNvbnN0IHJlcXVlc3RfID0gcmVxdWVzdCgnREVMRVRFJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcXVlc3RfLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxdWVzdF8uZW5kKGZuKTtcbiAgcmV0dXJuIHJlcXVlc3RfO1xufVxuXG5yZXF1ZXN0LmRlbCA9IGRlbDtcbnJlcXVlc3QuZGVsZXRlID0gZGVsO1xuXG4vKipcbiAqIFBBVENIIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gW2RhdGFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgY29uc3QgcmVxdWVzdF8gPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXF1ZXN0Xy5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gIHJldHVybiByZXF1ZXN0Xztcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IFtkYXRhXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgY29uc3QgcmVxdWVzdF8gPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcXVlc3RfLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxdWVzdF8uZW5kKGZuKTtcbiAgcmV0dXJuIHJlcXVlc3RfO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgY29uc3QgcmVxdWVzdF8gPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBRUEsSUFBSUEsSUFBSjs7QUFDQSxJQUFJLE9BQU9DLE1BQVAsS0FBa0IsV0FBdEIsRUFBbUM7RUFDakM7RUFDQUQsSUFBSSxHQUFHQyxNQUFQO0FBQ0QsQ0FIRCxNQUdPLElBQUksT0FBT0MsSUFBUCxLQUFnQixXQUFwQixFQUFpQztFQUN0QztFQUNBQyxPQUFPLENBQUNDLElBQVIsQ0FDRSxxRUFERjtFQUdBSixJQUFJLFNBQUo7QUFDRCxDQU5NLE1BTUE7RUFDTDtFQUNBQSxJQUFJLEdBQUdFLElBQVA7QUFDRDs7QUFFRCxJQUFNRyxPQUFPLEdBQUdDLE9BQU8sQ0FBQyxtQkFBRCxDQUF2Qjs7QUFDQSxJQUFNQyxhQUFhLEdBQUdELE9BQU8sQ0FBQyxxQkFBRCxDQUE3Qjs7QUFDQSxJQUFNRSxFQUFFLEdBQUdGLE9BQU8sQ0FBQyxJQUFELENBQWxCOztBQUNBLElBQU1HLFdBQVcsR0FBR0gsT0FBTyxDQUFDLGdCQUFELENBQTNCOztBQUNBLGVBQW9DQSxPQUFPLENBQUMsU0FBRCxDQUEzQztBQUFBLElBQVFJLFFBQVIsWUFBUUEsUUFBUjtBQUFBLElBQWtCQyxLQUFsQixZQUFrQkEsS0FBbEI7QUFBQSxJQUF5QkMsTUFBekIsWUFBeUJBLE1BQXpCOztBQUNBLElBQU1DLFlBQVksR0FBR1AsT0FBTyxDQUFDLGlCQUFELENBQTVCOztBQUNBLElBQU1RLEtBQUssR0FBR1IsT0FBTyxDQUFDLGNBQUQsQ0FBckI7QUFFQTtB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