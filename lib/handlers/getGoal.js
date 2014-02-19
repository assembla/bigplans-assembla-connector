'use strict';

var async = require('async');
var debug = require('debug')('assembla-connector-getGoal');
var arrayWrapTicket = require('../arrayWrapTicket');
var passBack = require('../passBack');


module.exports = function getGoal(params, callback) {
  debug('params %j', params);

  var transform = require('../transform')(params.urlName);
  var makeApiRequest = require('../makeApiRequest')(params);

  async.auto({
    'ticketStatuses': makeApiRequest.getTicketStatuses,
    'tickets': makeApiRequest.getTicket(params.id),
    'arrayWrapTicket': ['tickets', arrayWrapTicket],
    'goals': ['arrayWrapTicket', 'ticketStatuses', transform.ticketsToGoals]
  }, passBack.aSingleGoal(callback));
};
