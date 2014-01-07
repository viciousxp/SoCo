// file: Response.js
// Description: Response Object Class

var easyXML = require('easyxml')
  , logger = require('../routes/logger')

easyXML.configure({
    singularizeChildren: true,
    underscoreAttributes: false,
    rootElement: 'response',
    dateFormat: 'ISO', // JS, SQL
    indent: 2,
    manifest: true
});

function Response(req, res) {
    var version = req.route.path.split("/")[1],
        api = req.route.path.split("/")[3],
        body = JSON.stringify(req.body),
        query = JSON.stringify(req.query),
        params = JSON.stringify(req.params);

    this.res = res;
    this.req = req;
    this.response = {
        code: 200
    };
    this.response._request = {
        app: 'feeds',
        api: api,
        version: version,
        acceptedLanguages: req.acceptedLanguages,
        protocol: req.protocol,
        xhr: req.xhr,
        originatingIp: req.ip,
        url: req.url,
        query: query,
        params: params,
        body: body,
        method: req.route.method
    };
    this.response._response = {
        error: null,
        data: null
    };
    this.response._links = {
        links: []
    };
}

// properties

Object.defineProperties(Response.prototype, {
    _response: {
        get: function () { 
            return this._response;
        },
        set: function (_response) {
            this._response = _response;
        },
        enumerable: true,
        configurable: true
    },
    _links: {
        get: function () { 
            return this._links;
        },
        set: function (_links) {
            this._links = _links;
        },
        enumerable: true,
        configurable: true
    },
    code: {
        get: function () { 
            return this.response.code;
        },
        set: function (code) {
            this.response.code = code;
        },
        enumerable: true,
        configurable: true
    },
    error: {
        get: function () { 
            return {
                code: this.response.code,
                id: this.response._response.error.id,
                err: this.response._response.error.err,
                description: this.response._response.description
            }
        },
        set: function (err) {
            this.response.code = (typeof err.code === 'undefined') ? 500 : err.code;
            this.response._response.error = {
                id: (typeof err.id === 'undefined') ? 00000 : err.id,
                err: (typeof err.err === 'undefined') ? 'Unknown server error' : err.err,
                description: (typeof err.description === 'undefined') ? 'Description unnavailable, please contact us for more information' : err.description
            };
            //log error
            logger.error('An error has occured', err);
            //set data to null in case data has been inputed previous to the error
            this.response._response.data = null;
        },
        enumerable: true,
        configurable: true
    },
    data: {
        get: function () { 
            return this.response._response.data;
        },
        set: function (data) {
            this.response._response.data = data;
        },
        enumerable: true,
        configurable: true
    }
});

// functions

Response.prototype.send = function(type) {
    logger.info('Response.send', {type: type});
    if (type === 'XML' || this.req.get('Content-Type') === 'application/xml' || this.req.get('Content-Type') === 'xml') {
        this.res.type('application/xml');
        try {
            this.res.send(this.response.code, easyXML.render(this.response));
        } catch(e) {
            this.sendError(500, e, '00001', 'There was an error when we attemped to parse the response to XML :(');
        }
    } else {
        this.res.type('application/json');
        this.res.send(this.response.code, this.response);
    }
}

Response.prototype.sendError = function(code, error, id, description) {
    logger.info('Response.sendError', {code: code, error: error, id: id, description: description});
    //this is a convinience method to set an error and send a response
    this.response.code = (typeof code === 'undefined') ? 500 : code;
    this.response._response.error = {
        id: (typeof id === 'undefined') ? 00000 : id,
        err: (typeof error === 'undefined') ? 'Unknown server error' : error,
        description: (typeof description === 'undefined') ? 'Description unnavailable, please contact us for more information' : description
    };
    //log error
    logger.warn('Error: ', {
        code: code,
        error: error,
        id: id,
        description: description
    });
    //set data to null in case data has been inputed previous to the error
    this.response._response.data = null;
    this.send();
}

Response.prototype.sendSuccess = function(data, code) {
    logger.info('Response.sendSuccess', {data: data, code: code});
    //this is a convinience method to set data and send a response
    this.response.code = (typeof code === 'undefined') ? 200 : code;
    this.response._response.error = null;
    this.response._response.data = data;
    this.send();
    logger.info('Request by ' + this.req.user.username + ' succesfully processed');
}

module.exports = Response;