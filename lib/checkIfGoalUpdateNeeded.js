'use strict';

var debug = require('debug')('assembla-connector-checkIfGoalUpdateNeeded');
var _ = require('underscore');


var TICKET_PROPERTIES = {
  title       : 'summary',
  description : 'description',
  status      : 'state'
};


module.exports = function checkIfGoalUpdateNeeded(goal) {
  debug('goal: %j', goal);

  return function(callback, results) {
    var goalPresentProperties = _(['title', 'description', 'status']).intersection(_.keys(goal));
    var ticketProperties     = goalPresentProperties.map(function(name) {
      return TICKET_PROPERTIES[name];
    });

    var externalProperties = _(results.externalTicket).pick(ticketProperties);
    var localProperties    = _(goal                  ).pick(goalPresentProperties);

    if ('status' in goal) {
      // normalize for easier comparison
      localProperties.state = localProperties.status === '2' ? 0 : 1;
      delete localProperties.status;
    }

    var externalPropertyValues = _(externalProperties).values();
    var localPropertyValues    = _(localProperties).values();

    if (_.isEqual(externalPropertyValues, localPropertyValues)) {
      results.goals = [goal];
      callback(new Error('Nothing to update'));
    } else {
      callback(null);
    }
  };
};
