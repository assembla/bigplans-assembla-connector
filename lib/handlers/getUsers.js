'use strict';

var async = require('async');
var debug = require('debug')('assembla-connector-getUsers');
var passBack = require('../passBack');


module.exports = function getUsers(params, callback) {
  debug('params: %j', params);

  var transform = require('../transform')(params.urlName);
  var makeApiRequest = require('../makeApiRequest')(params);

  async.auto({
    'assemblaUsers': makeApiRequest.getUsers,
    'users': ['assemblaUsers', transform.assemblaUsersToBigplansUsers]
  }, passBack.aUserList(callback));
};
