'use strict';

var S = require('string');
var StatusTransformer = require('./statusTransformer');


module.exports = function TicketTransformer(tickets, ticketStatuses, urlName) {
  var statusTransformer = new StatusTransformer(ticketStatuses);

  this.getGoals = function() {
    return tickets.map(function(ticket) {
      return {
        'title'       : ticket.summary,
        'description' : stripHTMLTags(ticket.description),
        'status'      : statusTransformer.toGoalStatus(ticket.state),
        'external_id' : ticket.number,
        'link'        : 'https://www.assembla.com/spaces/' + urlName + '/tickets/' + ticket.number
      };
    });
  };


  function stripHTMLTags(html) {
    html = html || '';

    return S(html).stripTags().s;
  }
};
