'use strict';

var debug = require('debug')('assembla-connector-callback-with');


function prepareJSend(err, dataKey, data) {
  debug('prepareJSend: %j', arguments);

  var jsendResponse = {
    status: '',
    data: {}
  };

  if (err) {
    jsendResponse.status = 'fail';
    jsendResponse.message = err.message || err;
  } else {
    jsendResponse.status = 'success';
    jsendResponse.data[dataKey] = data;
  }

  return jsendResponse;
}


module.exports.aGoalList = function(callback) {
  return function(err, results) {
    debug('aGoalList(): %j', arguments);

    callback(prepareJSend(err, 'goals', results.goals));
  };
};


module.exports.aSingleGoal = function(callback) {
  return function(err, results) {
    debug('aSingleGoal(): %j', arguments);

    var goal = err ? null : results.goals[0];

    callback(prepareJSend(err, 'goal', goal));
  };
};


module.exports.aProjectList = function(callback) {
  return function(err, results) {
    debug('aProjectList(): %j', arguments);

    callback(results.spaces);
  };
};


module.exports.aUserList = function(callback) {
  return function(err, results) {
    debug('aUserList(): %j', arguments);

    callback(prepareJSend(err, 'users', results.users));
  };
};
