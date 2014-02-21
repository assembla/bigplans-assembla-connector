'use strict';

var _ = require('underscore');


function StatusTransformer(ticketStatuses) {
  ticketStatuses = ticketStatuses.sort(byListOrder);

  var firstOpenStatus = _(ticketStatuses).find(function(ticketStatus) {
    return ticketStatus.state === StatusTransformer.TICKET_STATE_OPENED;
  });

  var firstClosedStatus = _(ticketStatuses).find(function(ticketStatus) {
    return ticketStatus.state === StatusTransformer.TICKET_STATE_CLOSED;
  });


  this.toGoalStatus = function(ticketState) {
    /*jshint eqeqeq:false*/
    if (ticketState == StatusTransformer.TICKET_STATE_CLOSED) {
      return StatusTransformer.GOAL_STATUS_CLOSED;
    } else {
      return StatusTransformer.GOAL_STATUS_WIP;
    }
  };


  this.toTicketStatus = function(goalStatus) {
    /*jshint eqeqeq:false*/
    if (goalStatus == StatusTransformer.GOAL_STATUS_WIP || goalStatus == StatusTransformer.GOAL_STATUS_PLANNED) {
      return firstOpenStatus;
    } else {
      return firstClosedStatus;
    }
  };


  function byListOrder(a, b) {
    if (a['list_order'] > b['list_order']) return 1;
    if (a['list_order'] < b['list_order']) return -1;
    return 0;
  }
}

StatusTransformer.TICKET_STATE_OPENED = 1;
StatusTransformer.TICKET_STATE_CLOSED = 0;

StatusTransformer.GOAL_STATUS_PLANNED = 0;
StatusTransformer.GOAL_STATUS_WIP     = 1;
StatusTransformer.GOAL_STATUS_CLOSED  = 2;

module.exports = StatusTransformer;
