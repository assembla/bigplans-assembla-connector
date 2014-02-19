'use strict';

var async = require('async');
var debug = require('debug')('assembla-connector-createGoal');
var passBack = require('../passBack');
var checkForCurrentMilestone = require('../checkForCurrentMilestone');
var arrayWrapTicket = require('../arrayWrapTicket');


module.exports = function createGoal(params, callback) {
  debug('createGoal: goal %j', params);

  var transform = require('../transform')(params.urlName);
  var makeApiRequest = require('../makeApiRequest')(params);

  async.auto({
    'milestones': makeApiRequest.getMilestones,
    'currentMilestone': ['milestones', checkForCurrentMilestone],
    'ticketStatuses': makeApiRequest.getTicketStatuses,
    'ticket': ['ticketStatuses', 'currentMilestone', transform.goalToTicket(params.goal)],
    'tickets': ['ticket', makeApiRequest.ticketCreate],
    'arrayWrapTicket': ['tickets', arrayWrapTicket],
    'goals': ['arrayWrapTicket', transform.ticketsToGoals]
  }, passBack.aSingleGoal(callback));
};
