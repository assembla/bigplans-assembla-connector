'use strict';

var _ = require('underscore');
var StatusTransformer = require('./statusTransformer');


module.exports = function GoalTransformer(results) {
  var statusTransformer = new StatusTransformer(results.ticketStatuses.data);

  this.getTicket = function(goal, externalTicket) {
    var ticket;

    if (externalTicket) {
      ticket = onlyTranslateChangedProperties(goal, externalTicket.data);
    } else {
      ticket = translateAllProperties(goal);
    }

    if ('external_id' in goal) ticket.number = goal['external_id'];

    return {
      ticket: ticket
    };
  };


  function translateAllProperties(goal) {
    var properties = {
      'milestone_id': currentMilestoneId(),
      'summary'     : goal.title,
      'description' : goal.description
    };

    _(properties).extend(statusPropertiesFrom(goal.status));

    return properties;
  }


  function currentMilestoneId() {
    return results.currentMilestone && results.currentMilestone.id;
  }


  function onlyTranslateChangedProperties(goal, externalTicket) {
    var properties = {};

    if (_(goal).has('title') && goal.title !== externalTicket.summary) {
      properties.summary = goal.title;
    }

    if (_(goal).has('description') && goal.description !== externalTicket.description) {
      properties.description = goal.description;
    }

    if (_(goal).has('status') && statusPolarityChanged(externalTicket, goal)) {
      _(properties).extend(statusPropertiesFrom(goal.status));
    }

    return properties;
  }


  function statusPropertiesFrom(goalStatus) {
    var ticketStatus = statusTransformer.toTicketStatus(goalStatus);

    return {
      'ticket_status_id': ticketStatus.id,
      'state'           : ticketStatus.state,
      'status'          : ticketStatus.name
    };
  }


  function statusPolarityChanged(externalTicket, goal) {
    var ticketStatusPolarity = externalTicket.state.toString() === '0' ? 'closed' : 'open';
    var goalStatusPolarity   = goal.status.toString() === '2'          ? 'closed' : 'open';

    return ticketStatusPolarity !== goalStatusPolarity;
  }

};
