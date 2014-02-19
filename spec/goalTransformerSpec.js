'use strict';

var GoalTransformer = require('../lib/goalTransformer');


describe('GoalTransformer', function() {
  describe('#getTicket(goal)', function() {
    var goal, ticket, ticketStatuses, goalTransformer, externalTicket, currentMilestone;

    beforeEach(function() {
      currentMilestone = {
        'id'          : 123,
        'planner_type': 2, // CURRENT
        'title'       : 'Current'
      };
      externalTicket = {
        data: {
          state: 0
        }
      };

      goal = {
        title: 'This is the goal title',
        description: 'This is the goal description',
        status: 1 // WIP
      };

      ticketStatuses = [
        {id: 1, name: 'New', state: 1},
        {id: 2, name: 'In-Progress', state: 1},
        {id: 3, name: 'Fixed', state: 0}
      ];

      goalTransformer = new GoalTransformer({
        ticketStatuses: {data: ticketStatuses},
        currentMilestone: currentMilestone
      });
    });

    describe('when external_id is present (on update)', function() {
      beforeEach(function() {
        goal['external_id'] = 123;
        ticket = goalTransformer.getTicket(goal, externalTicket);
      });

      it('translates attributes', function() {
        expect(ticket.ticket).toBeDefined();

        ticket = ticket.ticket;
        expect(ticket['summary']).toEqual(goal.title);
        expect(ticket['description']).toEqual(goal.description);
        expect(ticket['ticket_status_id']).toEqual(1);
        expect(ticket['state']).toEqual(1);
        expect(ticket['status']).toEqual('New');
        expect(ticket['number']).toEqual(goal['external_id']);
      });
    });

    describe('when external_id is not present (on create)', function() {
      beforeEach(function() {
        // I know there is no external_id, it’s just I like being explicit
        delete goal['external_id'];

        ticket = goalTransformer.getTicket(goal);
      });

      it('translates attributes', function() {
        expect(ticket.ticket).toBeDefined();

        ticket = ticket.ticket;
        expect(ticket['milestone_id']).toEqual(currentMilestone.id);
        expect(ticket['summary']).toEqual(goal.title);
        expect(ticket['description']).toEqual(goal.description);
        expect(ticket['ticket_status_id']).toEqual(1);
        expect(ticket['state']).toEqual(1);
        expect(ticket['status']).toEqual('New');
        expect(ticket['number']).not.toBeDefined();
      });

      describe('when there is no current milestone', function() {
        beforeEach(function() {
          currentMilestone = undefined; // I like explicit

          goalTransformer = new GoalTransformer({
            ticketStatuses: {data: ticketStatuses},
            currentMilestone: currentMilestone
          });

          ticket = goalTransformer.getTicket(goal);
        });

        it('doesn’t set milestone_id', function() {
          ticket = ticket.ticket;
          expect(ticket['milestone_id']).not.toBeDefined();
        });
      });
    });


    describe('status sync', function() {
      beforeEach(function() {
        externalTicket.data.state = 1; // opened
      });

      describe('when it didn’t change polarity', function() {
        beforeEach(function() {
          goal.status = 0; // Planned, which is OPEN

          ticket = goalTransformer.getTicket(goal, externalTicket).ticket;
        });

        it('is excluded', function() {
          expect('ticket_status_id' in ticket).toBe(false);
          expect('status' in ticket).toBe(false);
          expect('state' in ticket).toBe(false);
        });
      });

      describe('when it DID change polarity', function() {
        beforeEach(function() {
          goal.status = 2; // Closed

          ticket = goalTransformer.getTicket(goal, externalTicket).ticket;
        });

        it('is included', function() {
          expect('ticket_status_id' in ticket).toBe(true);
          expect('status' in ticket).toBe(true);
          expect('state' in ticket).toBe(true);
        });
      });
    });


    describe('partial updates', function() {
      beforeEach(function() {
        externalTicket.data = {
          summary     : 'This is the title title',
          description : 'This is the title description',
          state       : 1 // OPENED
        };

        goal = {
          title       : externalTicket.data.summary,
          description : externalTicket.data.description,
          status      : 1 // WIP, so OPENED
        };
      });


      describe('when any property is missing on the goal', function() {
        describe('title', function() {
          beforeEach(function() {
            delete goal.title;
            ticket = goalTransformer.getTicket(goal, externalTicket).ticket;
          });

          it('the returned ticket doesn’t contain it either', function() {
            expect('summary' in ticket).toBe(false);
          });
        });

        describe('description', function() {
          beforeEach(function() {
            delete goal.description;
            ticket = goalTransformer.getTicket(goal, externalTicket).ticket;
          });

          it('the returned ticket doesn’t contain it either', function() {
            expect('description' in ticket).toBe(false);
          });
        });

        describe('title', function() {
          beforeEach(function() {
            delete goal.status;
            ticket = goalTransformer.getTicket(goal, externalTicket).ticket;
          });

          it('the returned ticket doesn’t contain it either', function() {
            expect('status' in ticket).toBe(false);
            expect('state' in ticket).toBe(false);
            expect('ticket_status_id' in ticket).toBe(false);
          });
        });

      });


      describe('when nothing changed', function() {
        beforeEach(function() {
          ticket = goalTransformer.getTicket(goal, externalTicket).ticket;
        });

        it('return nothing', function() {
          expect(ticket).toEqual({});
        });
      });


      describe('when only title change', function() {
        beforeEach(function() {
          goal.title = 'A new title';
          ticket = goalTransformer.getTicket(goal, externalTicket).ticket;
        });

        it('only returns it', function() {
          expect(ticket).toEqual({ summary: goal.title });
        });
      });


      describe('when only description change', function() {
        beforeEach(function() {
          goal.description = 'A new nicer description';
          ticket = goalTransformer.getTicket(goal, externalTicket).ticket;
        });

        it('only returns it', function() {
          expect(ticket).toEqual({ description: goal.description });
        });
      });


      describe('when only status change', function() {
        beforeEach(function() {
          goal.status = 2; // CLOSED, a different polarity
          ticket = goalTransformer.getTicket(goal, externalTicket).ticket;
        });

        it('only returns status related fields', function() {
          expect(ticket.state).toBe(0); // CLOSED
          expect(Object.keys(ticket)).toEqual(['ticket_status_id', 'state', 'status']);
        });
      });

    });
  });
});
