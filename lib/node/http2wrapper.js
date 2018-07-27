'use strict';

const http2 = require('http2');
const Stream = require('stream');
const util = require('util');
const parse = require('url').parse;

const {
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_STATUS,
    HTTP2_HEADER_METHOD,
    HTTP2_HEADER_AUTHORITY,
    HTTP2_HEADER_HOST,
    HTTP2_HEADER_SET_COOKIE,
    NGHTTP2_CANCEL,
} = http2.constants;


function setProtocol(protocol) {
    return {
        request: function (options) {
            return new Request(protocol, options);
        }
    }
}

function Request(protocol, options) {
    Stream.call(this);
    this.method = options.method;
    this.path = options.path;

    const port = options.port;
    const host = options.host;

    const sessionOptions = {};
    sessionOptions.ca = options.ca;
    sessionOptions.key = options.key;
    sessionOptions.pfx = options.pfx;
    sessionOptions.cert = options.cert;
    sessionOptions.passphrase = options.passphrase;

    this._headers = {};

    const session = http2.connect(`${protocol}://${host}:${port}`, sessionOptions);

    session.on('error', (err) => this.emit('error', err));

    this.session = session;
}

/**
 * Inherit from `Stream` (which inherits from `EventEmitter`).
 */
util.inherits(Request, Stream);

Request.prototype.setNoDelay = function (bool) {
    this.session.socket.setNoDelay(bool);
}

Request.prototype.getFrame = function () {
    if (this.frame) {
        return this.frame;
    }

    const method = {
        [HTTP2_HEADER_PATH]: this.path,
        [HTTP2_HEADER_METHOD]: this.method,
    }

    let headers = this.mapToHttp2Header(this._headers);

    headers = Object.assign(headers, method);

    const frame = this.session.request(headers);
    frame.once('response', (headers, flags) => {
        headers = this.mapToHttpHeader(headers);

        frame.headers = headers;
        frame.status = frame.statusCode = headers[HTTP2_HEADER_STATUS];
        frame.on('end', () => this.session.close());
        this.emit('response', frame);
    });

    this._headerSent = true;

    frame.once('drain', () => { this.emit('drain'); });
    frame.on('error', (err) => this.emit('error', err));

    this.frame = frame;
    return frame;
}

Request.prototype.mapToHttpHeader = function (headers) {
    const keys = Object.keys(headers);
    const http2Headers = {};
    for (var i = 0; i < keys.length; i++) {
        let key = keys[i];
        let value = headers[key];
        key = key.toLowerCase();
        switch (key) {
            case HTTP2_HEADER_SET_COOKIE:
                value = Array.isArray(value) ? value : [value];
                break;
            default:
                break;
        }
        http2Headers[key] = value;
    }
    return http2Headers;
}

Request.prototype.mapToHttp2Header = function (headers) {
    const keys = Object.keys(headers);
    const http2Headers = {};
    for (var i = 0; i < keys.length; i++) {
        let key = keys[i];
        let value = headers[key];
        key = key.toLowerCase();
        switch (key) {
            case HTTP2_HEADER_HOST:
                key = HTTP2_HEADER_AUTHORITY;
                value = value.startsWith('http') ? parse(value).host : value;
                break;
            default:
                break;
        }
        http2Headers[key] = value;
    }
    return http2Headers;
}

Request.prototype.setHeader = function (name, value) {
    this._headers[name.toLowerCase()] = value;
}

Request.prototype.getHeader = function (name) {
    return this._headers[name.toLowerCase()];
}

Request.prototype.write = function (data, encoding) {
    const frame = this.getFrame();
    return frame.write(data, encoding);
};

Request.prototype.end = function (data) {
    const frame = this.getFrame();
    frame.end(data);
}

Request.prototype.abort = function (data) {
    const frame = this.getFrame();
    frame.close(NGHTTP2_CANCEL);
    this.session.close();
}

exports.setProtocol = setProtocol;
