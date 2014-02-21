'use strict';

var _ = require('underscore');
var async = require('async');
var debug = require('debug')('assembla-connector-getGoals');
var passBack = require('../passBack');
var checkForCurrentMilestone = require('../checkForCurrentMilestone');


module.exports = function getGoals(params, callback) {
  debug('params: %j', params);

  var transform = require('../transform')(params.urlName);
  var makeApiRequest = require('../makeApiRequest')(params);


  async.auto({
    'ticketStatuses': makeApiRequest.getTicketStatuses,
    'milestones': makeApiRequest.getMilestones,
    'currentMilestone': ['milestones', checkForCurrentMilestone],
    'allTickets': ['currentMilestone', makeApiRequest.getTickets],
    'tickets': ['allTickets', filterTickets],
    'goals': ['ticketStatuses', 'tickets', transform.ticketsToGoals]
  }, passBack.aGoalList(callback));


  function filterTickets(callback, results) {
    var jsendResponse = _.clone(results.allTickets);

    jsendResponse.data = jsendResponse.data.filter(function(ticket) {
      return ticket.state === 1;
    });

    callback(null, jsendResponse);
  }
};
