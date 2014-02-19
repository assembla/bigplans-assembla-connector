'use strict';

var TicketTransformer = require('../lib/ticketTransformer');
var StatusTransformer = require('../lib/statusTransformer');

describe('TicketTransformer', function() {
  describe('#toGoals', function() {
    var ticketTransformer, tickets, ticketStatuses, urlName;

    beforeEach(function() {
      tickets = [{
        'summary'          : 'some ticket summary',
        'description'      : '<p>some description</p>',
        'state'            : 0,
        'ticket_status_id' : 123,
        'number'           : 123,
        'reported_by'      : 'some-user-id',
        'some'             : 'more fields'
      }];

      ticketStatuses = [];
      urlName = 'some-wiki-name';
      ticketTransformer = new TicketTransformer(tickets, ticketStatuses, urlName);
    });

    it('extracts title, description, status, and external_id', function() {
      var ticketDescriptionWithoutHTMLTags = 'some description';

      var ticketTransformer = new TicketTransformer(tickets, ticketStatuses, urlName);
      var goals = ticketTransformer.getGoals();

      expect(goals[0]).toEqual({
        title: tickets[0]['summary'],
        description: ticketDescriptionWithoutHTMLTags,
        status: StatusTransformer.GOAL_STATUS_CLOSED,
        'external_id': 123,
        link: 'https://www.assembla.com/spaces/some-wiki-name/tickets/123'
      });
    });

    it('when ticket description is null, default it to empty string', function() {
      var expectedTicketDescription = '';

      tickets[0].description = null;

      var ticketTransformer = new TicketTransformer(tickets, ticketStatuses, urlName);
      var goals = ticketTransformer.getGoals();

      expect(goals[0]).toEqual({
        title: tickets[0]['summary'],
        description: expectedTicketDescription,
        status: StatusTransformer.GOAL_STATUS_CLOSED,
        'external_id': 123,
        link: 'https://www.assembla.com/spaces/some-wiki-name/tickets/123'
      });
    });
  });
});
