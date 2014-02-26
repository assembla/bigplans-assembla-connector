'use strict';

var request = require('request');
var _ = require('underscore');


module.exports.stubHttpReponseFor = function(sandbox, expectedHeaders) {
  return function(method, url, data) {
    return {
      andRespondWith: function(statusCode, json) {
        var options = {
          uri     : url,
          headers : expectedHeaders,
          json    : true
        };

        var res = {
          statusCode : statusCode,
          request    : { href: url }
        };

        var alreadyStubbed = 'spyCall' in request[method];
        var stub = alreadyStubbed ? request[method] : sandbox.stub(request, method);

        packData(data, method, options);
        stub.withArgs(options).yields(null, res, json);
      }
    };
  };


  function clone(obj) {
    return _.extend({}, obj);
  }

  function packData(data, method, options) {
    if (data) {
      if (method === 'get') {
        options.qs = clone(data);
      } else {
        options.body = JSON.stringify(data);
      }
    }
  }

};
