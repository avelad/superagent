"use strict";

/**
 * Module dependencies.
 */
var util = require('util');

var Stream = require('stream');

var ResponseBase = require('../response-base');

var _require = require('../utils'),
    mixin = _require.mixin;
/**
 * Expose `Response`.
 */


module.exports = Response;
/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * @param {Request} req
 * @param {Object} options
 * @constructor
 * @extends {Stream}
 * @implements {ReadableStream}
 * @api private
 */

function Response(request) {
  Stream.call(this);
  this.res = request.res;
  var res = this.res;
  this.request = request;
  this.req = request.req;
  this.text = res.text;
  this.files = res.files || {};
  this.buffered = request._resBuffered;
  this.headers = res.headers;
  this.header = this.headers;

  this._setStatusProperties(res.statusCode);

  this._setHeaderProperties(this.header);

  this.setEncoding = res.setEncoding.bind(res);
  res.on('data', this.emit.bind(this, 'data'));
  res.on('end', this.emit.bind(this, 'end'));
  res.on('close', this.emit.bind(this, 'close'));
  res.on('error', this.emit.bind(this, 'error'));
} // Lazy access res.body.
// https://github.com/nodejs/node/pull/39520#issuecomment-889697136


Object.defineProperty(Response.prototype, 'body', {
  get: function get() {
    return this._body !== undefined ? this._body : this.res.body !== undefined ? this.res.body : {};
  },
  set: function set(value) {
    this._body = value;
  }
});
/**
 * Inherit from `Stream`.
 */

util.inherits(Response, Stream);
mixin(Response.prototype, ResponseBase.prototype);
/**
 * Implements methods of a `ReadableStream`
 */

Response.prototype.destroy = function (error) {
  this.res.destroy(error);
};
/**
 * Pause.
 */


Response.prototype.pause = function () {
  this.res.pause();
};
/**
 * Resume.
 */


Response.prototype.resume = function () {
  this.res.resume();
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
  var path = req.path;
  var message = "cannot ".concat(method, " ").concat(path, " (").concat(this.status, ")");
  var error = new Error(message);
  error.status = this.status;
  error.text = this.text;
  error.method = method;
  error.path = path;
  return error;
};

Response.prototype.setStatusProperties = function (status) {
  console.warn('In superagent 2.x setStatusProperties is a private method');
  return this._setStatusProperties(status);
};
/**
 * To json.
 *
 * @return {Object}
 * @api public
 */


Response.prototype.toJSON = function () {
  return {
    req: this.request.toJSON(),
    header: this.header,
    status: this.status,
    text: this.text
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1dGlsIiwicmVxdWlyZSIsIlN0cmVhbSIsIlJlc3BvbnNlQmFzZSIsIm1peGluIiwibW9kdWxlIiwiZXhwb3J0cyIsIlJlc3BvbnNlIiwicmVxdWVzdCIsImNhbGwiLCJyZXMiLCJyZXEiLCJ0ZXh0IiwiZmlsZXMiLCJidWZmZXJlZCIsIl9yZXNCdWZmZXJlZCIsImhlYWRlcnMiLCJoZWFkZXIiLCJfc2V0U3RhdHVzUHJvcGVydGllcyIsInN0YXR1c0NvZGUiLCJfc2V0SGVhZGVyUHJvcGVydGllcyIsInNldEVuY29kaW5nIiwiYmluZCIsIm9uIiwiZW1pdCIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwicHJvdG90eXBlIiwiZ2V0IiwiX2JvZHkiLCJ1bmRlZmluZWQiLCJib2R5Iiwic2V0IiwidmFsdWUiLCJpbmhlcml0cyIsImRlc3Ryb3kiLCJlcnJvciIsInBhdXNlIiwicmVzdW1lIiwidG9FcnJvciIsIm1ldGhvZCIsInBhdGgiLCJtZXNzYWdlIiwic3RhdHVzIiwiRXJyb3IiLCJzZXRTdGF0dXNQcm9wZXJ0aWVzIiwiY29uc29sZSIsIndhcm4iLCJ0b0pTT04iXSwic291cmNlcyI6WyIuLi8uLi9zcmMvbm9kZS9yZXNwb25zZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcbmNvbnN0IFN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuY29uc3QgUmVzcG9uc2VCYXNlID0gcmVxdWlyZSgnLi4vcmVzcG9uc2UtYmFzZScpO1xuY29uc3QgeyBtaXhpbiB9ID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBAcGFyYW0ge1JlcXVlc3R9IHJlcVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMge1N0cmVhbX1cbiAqIEBpbXBsZW1lbnRzIHtSZWFkYWJsZVN0cmVhbX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcXVlc3QpIHtcbiAgU3RyZWFtLmNhbGwodGhpcyk7XG4gIHRoaXMucmVzID0gcmVxdWVzdC5yZXM7XG4gIGNvbnN0IHsgcmVzIH0gPSB0aGlzO1xuICB0aGlzLnJlcXVlc3QgPSByZXF1ZXN0O1xuICB0aGlzLnJlcSA9IHJlcXVlc3QucmVxO1xuICB0aGlzLnRleHQgPSByZXMudGV4dDtcbiAgdGhpcy5maWxlcyA9IHJlcy5maWxlcyB8fCB7fTtcbiAgdGhpcy5idWZmZXJlZCA9IHJlcXVlc3QuX3Jlc0J1ZmZlcmVkO1xuICB0aGlzLmhlYWRlcnMgPSByZXMuaGVhZGVycztcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnM7XG4gIHRoaXMuX3NldFN0YXR1c1Byb3BlcnRpZXMocmVzLnN0YXR1c0NvZGUpO1xuICB0aGlzLl9zZXRIZWFkZXJQcm9wZXJ0aWVzKHRoaXMuaGVhZGVyKTtcbiAgdGhpcy5zZXRFbmNvZGluZyA9IHJlcy5zZXRFbmNvZGluZy5iaW5kKHJlcyk7XG4gIHJlcy5vbignZGF0YScsIHRoaXMuZW1pdC5iaW5kKHRoaXMsICdkYXRhJykpO1xuICByZXMub24oJ2VuZCcsIHRoaXMuZW1pdC5iaW5kKHRoaXMsICdlbmQnKSk7XG4gIHJlcy5vbignY2xvc2UnLCB0aGlzLmVtaXQuYmluZCh0aGlzLCAnY2xvc2UnKSk7XG4gIHJlcy5vbignZXJyb3InLCB0aGlzLmVtaXQuYmluZCh0aGlzLCAnZXJyb3InKSk7XG59XG5cbi8vIExhenkgYWNjZXNzIHJlcy5ib2R5LlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL3B1bGwvMzk1MjAjaXNzdWVjb21tZW50LTg4OTY5NzEzNlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlc3BvbnNlLnByb3RvdHlwZSwgJ2JvZHknLCB7XG4gIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy5fYm9keSAhPT0gdW5kZWZpbmVkXG4gICAgICA/IHRoaXMuX2JvZHlcbiAgICAgIDogdGhpcy5yZXMuYm9keSAhPT0gdW5kZWZpbmVkXG4gICAgICA/IHRoaXMucmVzLmJvZHlcbiAgICAgIDoge307XG4gIH0sXG4gIHNldCh2YWx1ZSkge1xuICAgIHRoaXMuX2JvZHkgPSB2YWx1ZTtcbiAgfVxufSk7XG5cbi8qKlxuICogSW5oZXJpdCBmcm9tIGBTdHJlYW1gLlxuICovXG5cbnV0aWwuaW5oZXJpdHMoUmVzcG9uc2UsIFN0cmVhbSk7XG5cbm1peGluKFJlc3BvbnNlLnByb3RvdHlwZSwgUmVzcG9uc2VCYXNlLnByb3RvdHlwZSk7XG5cbi8qKlxuICogSW1wbGVtZW50cyBtZXRob2RzIG9mIGEgYFJlYWRhYmxlU3RyZWFtYFxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gIHRoaXMucmVzLmRlc3Ryb3koZXJyb3IpO1xufTtcblxuLyoqXG4gKiBQYXVzZS5cbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMucmVzLnBhdXNlKCk7XG59O1xuXG4vKipcbiAqIFJlc3VtZS5cbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucmVzdW1lID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnJlcy5yZXN1bWUoKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHsgcmVxIH0gPSB0aGlzO1xuICBjb25zdCB7IG1ldGhvZCB9ID0gcmVxO1xuICBjb25zdCB7IHBhdGggfSA9IHJlcTtcblxuICBjb25zdCBtZXNzYWdlID0gYGNhbm5vdCAke21ldGhvZH0gJHtwYXRofSAoJHt0aGlzLnN0YXR1c30pYDtcbiAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIGVycm9yLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnJvci50ZXh0ID0gdGhpcy50ZXh0O1xuICBlcnJvci5tZXRob2QgPSBtZXRob2Q7XG4gIGVycm9yLnBhdGggPSBwYXRoO1xuXG4gIHJldHVybiBlcnJvcjtcbn07XG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKHN0YXR1cykge1xuICBjb25zb2xlLndhcm4oJ0luIHN1cGVyYWdlbnQgMi54IHNldFN0YXR1c1Byb3BlcnRpZXMgaXMgYSBwcml2YXRlIG1ldGhvZCcpO1xuICByZXR1cm4gdGhpcy5fc2V0U3RhdHVzUHJvcGVydGllcyhzdGF0dXMpO1xufTtcblxuLyoqXG4gKiBUbyBqc29uLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICByZXE6IHRoaXMucmVxdWVzdC50b0pTT04oKSxcbiAgICBoZWFkZXI6IHRoaXMuaGVhZGVyLFxuICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgdGV4dDogdGhpcy50ZXh0XG4gIH07XG59O1xuIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUVBLElBQU1BLElBQUksR0FBR0MsT0FBTyxDQUFDLE1BQUQsQ0FBcEI7O0FBQ0EsSUFBTUMsTUFBTSxHQUFHRCxPQUFPLENBQUMsUUFBRCxDQUF0Qjs7QUFDQSxJQUFNRSxZQUFZLEdB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