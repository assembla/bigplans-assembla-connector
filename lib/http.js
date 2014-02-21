'use strict';

var request = require('request');
var debug = require('debug')('assembla-connector-http');


module.exports.makeRequest = function makeRequest(requestInfo, callback) {
  debug('request: %j', requestInfo);

  var method = requestInfo.method.toLowerCase();

  delete requestInfo.method;
  requestInfo.json = true;

  request[method](requestInfo, function(err, res, body) {
    debug('response: err: %j, statusCode: %s, body: %j', err, res.statusCode, body);

    if (res.statusCode === 404) {
      body.url = res.request.href;
    }

    if (err || !(res.statusCode in responseHandlers)) {
      res.statusCode = 'fallback';
    }

    responseHandlers[res.statusCode](err, body, callback);
  });
};


var responseHandlers = module.exports.responseHandlers = {
  '200': function(err, res, callback) {
    callback(err, {
      status: 'success',
      data: res
    });
  },

  '201': function(err, res, callback) {
    callback(err, {
      status: 'success',
      data: res
    });
  },

  // no data
  '204': function(err, res, callback) {
    callback(err, {
      status: 'success',
      data: []
    });
  },

  // invalid auth
  '401': function(err, res, callback) {
    var userFriendlyError = 'connection credentials expired';
    var loggedError = res['error_description'] || res['error'];

    console.error(loggedError);

    callback(err, {
      status: 'fail',
      message: userFriendlyError,
      data: []
    });
  },

  '404': function(err, res, callback) {
    var userFriendlyError = 'resource not found';
    var loggedError = 'Resource not found: ' + res.url;

    console.error(loggedError);

    callback(err, {
      status: 'fail',
      message: userFriendlyError,
      data: []
    });
  },

  // Unprocessable Entity
  '422': function(err, res, callback) {
    var userFriendlyError = 'data validation error';
    var loggedError = '';

    if ('base' in res) {
      loggedError = res.base[0];
    } else if ('errors' in res) {
      var fields = [];

      for (var field in res.errors) {
        fields.push(field + ': ' + res.errors[field].join(', '));
      }

      loggedError = fields.join('\n');
    }

    console.error(loggedError);

    callback(err, {
      status: 'fail',
      message: userFriendlyError,
      data: []
    });
  },

  'fallback': function(err, res, callback) {
    var userFriendlyError = 'unknown error';
    var loggedError = res['error_description'] || res['error'] || 'Unknown error: HTTP ' + res.statusCode;

    console.error(loggedError);

    callback(err, {
      status: 'error',
      message: userFriendlyError,
      data: []
    });
  }
};
