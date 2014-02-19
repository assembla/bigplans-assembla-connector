'use strict';

var StatusTransformer = require('../lib/statusTransformer');

describe('StatusTransformer', function() {
  var ticketStatuses = [ {
    'id': 69184,
    'space_tool_id': 'cdj2fai0mr3B8jab7jnrAJ',
    'name': 'New',
    'state': 1,
    'list_order': 0,
    'created_at': '2011-03-02T00:00:00Z',
    'updated_at': '2011-03-02T00:00:00Z'
  }, {
    'id': 487912,
    'space_tool_id': 'cdj2fai0mr3B8jab7jnrAJ',
    'name': 'In-Production',
    'state': 0,
    'list_order': 7,
    'created_at': '2011-03-02T00:00:00Z',
    'updated_at': '2013-01-12T13:50:06Z'
  }, {
    'id': 487913,
    'space_tool_id': 'cdj2fai0mr3B8jab7jnrAJ',
    'name': 'Invalid',
    'state': 0,
    'list_order': 8,
    'created_at': '2011-03-02T00:00:00Z',
    'updated_at': '2013-01-12T13:50:06Z'
  }];

  var statusTransformer = new StatusTransformer(ticketStatuses);

  describe('#toGoalStatus(ticketState)', function() {
    describe('when the ticket state is 0 (closed)', function() {
      it('returns GOAL_STATUS_CLOSED', function() {
        var goalStatus = statusTransformer.toGoalStatus(0);

        expect(goalStatus).toEqual(StatusTransformer.GOAL_STATUS_CLOSED);
      });

      it('handles string states appropriately', function() {
        var goalStatus = statusTransformer.toGoalStatus('0');

        expect(goalStatus).toEqual(StatusTransformer.GOAL_STATUS_CLOSED);
      });
    });

    describe('when the ticket state is 1 (open)', function() {
      it('returns GOAL_STATUS_WIP', function() {
        var goalStatus = statusTransformer.toGoalStatus(1);

        expect(goalStatus).toEqual(StatusTransformer.GOAL_STATUS_WIP);
      });
    });

  });


  describe('#toTicketStatus(goalStatus)', function() {
    describe('when GOAL_STATUS_PLANNED', function() {
      it('returns the first open status', function() {
        var ticketStatus = statusTransformer.toTicketStatus(StatusTransformer.GOAL_STATUS_PLANNED);

        expect(ticketStatus).toEqual(ticketStatuses[0]);
      });
    });

    describe('when GOAL_STATUS_WIP', function() {
      it('returns the first open status', function() {
        var ticketStatus = statusTransformer.toTicketStatus(StatusTransformer.GOAL_STATUS_WIP);

        expect(ticketStatus).toEqual(ticketStatuses[0]);
      });
    });

    describe('when GOAL_STATUS_CLOSED', function() {
      it('returns the last closed status', function() {
        var ticketStatus = statusTransformer.toTicketStatus(StatusTransformer.GOAL_STATUS_CLOSED);

        expect(ticketStatus).toEqual(ticketStatuses[1]);
      });
    });

  });

});
