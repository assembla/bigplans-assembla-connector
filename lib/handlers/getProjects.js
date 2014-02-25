'use strict';

var async = require('async');
var debug = require('debug')('assembla-connector-getProjects');
var passBack = require('../passBack');


module.exports = function getProjects(params, callback) {
  debug('params: %j', params);

  var transform = require('../transform')(params.urlName);
  var makeApiRequest = require('../makeApiRequest')(params);

  async.auto({
    'spaces': makeApiRequest.getSpaces,
    'projects': ['spaces', transform.spacesToProjects]
  }, passBack.aProjectList(callback));
};
