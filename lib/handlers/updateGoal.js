'use strict';

var async = require('async');
var debug = require('debug')('assembla-connector-updateGoal');
var passBack = require('../passBack');
var checkIfGoalUpdateNeeded = require('../checkIfGoalUpdateNeeded');
var arrayWrapTicket = require('../arrayWrapTicket');


module.exports = function updateGoal(params, callback) {
  debug('params %j', params);

  var transform = require('../transform')(params.urlName);
  var makeApiRequest = require('../makeApiRequest')(params);

  async.auto({
    'externalTicket': makeApiRequest.getTicket(params.goal['external_id']),
    'updateRequired': ['externalTicket', checkIfGoalUpdateNeeded(params.goal)],
    'ticketStatuses': ['updateRequired', makeApiRequest.getTicketStatuses],
    'ticket': ['ticketStatuses', 'externalTicket', transform.goalToTicket(params.goal)],
    'tickets': ['externalTicket', 'ticket', makeApiRequest.ticketUpdate],
    'arrayWrapTicket': ['tickets', arrayWrapTicket],
    'goals': ['arrayWrapTicket', transform.ticketsToGoals]
  }, passBack.aSingleGoal(callback));
};
