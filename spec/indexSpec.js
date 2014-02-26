'use strict';

var request = require('request');
var sinon = require('sinon');
require('jasmine-sinon');

var connector = require('..');
var helpers = require('./helpers');


describe('AssemblaConnector', function() {
  var params = {
    accessToken: 'some-long-hex-string',
    urlName: 'breakout'
  };

  var expectedHeaders = {
    'Content-type': 'application/json',
    'Authorization': 'Bearer ' + params.accessToken
  };

  var spaceApiUrl = connector.API_URL + '/spaces/' + params.urlName;
  var apiData = {};
  var sandbox, stubHttpReponseFor;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    stubHttpReponseFor = helpers.stubHttpReponseFor(sandbox, expectedHeaders);
    spyOn(console, 'error');
  });


  describe('#getUsers(callback)', function() {
    describe('failed API response', function() {
      beforeEach(function() {
        apiData.users = {
          'error': 'invalid_token',
          'error_description': 'The access token provided is expired, revoked, malformed or invalid for other reasons.'
        };

        stubHttpReponseFor('get', spaceApiUrl + '/users.json').andRespondWith(401, apiData.users);
      });

      it('calls back with a JSend error response with an user-friendly error message', function(done) {
        connector.getUsers(params, function(jsendResponse) {
          expect(request.get).toHaveBeenCalled();
          expect(jsendResponse.status).toEqual('fail');
          expect(jsendResponse.data).toEqual({ });
          expect(jsendResponse.message).toContain('connection credentials expired');

          done();
        });
      });
    });

    describe('successful API response', function() {
      beforeEach(function() {
        apiData.users = [{
          id: 'dsySS21Iar34kFeJe5cbCb',
          login: 'aandresrafael',
          name: 'Andres Aguilar',
          picture: 'http://www.assembla.com/v1/users/dsySS21Iar34kFeJe5cbCb/picture',
          email: 'andres@assembla.com'
        }];

        stubHttpReponseFor('get', spaceApiUrl + '/users.json').andRespondWith(200, apiData.users);
      });

      it('extracst the username an email from the received list of users and passes it to the callback as a JSend success message', function(done) {
        connector.getUsers(params, function(jsendResponse) {
          expect(request.get).toHaveBeenCalled();
          expect(jsendResponse).toEqual({
            status: 'success',
            data: {
              users: [{
                login: apiData.users[0].login,
                email: apiData.users[0].email
              }]
            }
          });

          done();
        });
      });
    });
  });


  describe('#getProjects(callback)', function() {
    describe('failed API response', function() {
      beforeEach(function() {
        apiData.spaces = {
          'error': 'invalid_token',
          'error_description': 'The access token provided is expired, revoked, malformed or invalid for other reasons.'
        };

        stubHttpReponseFor('get', connector.API_URL + '/spaces.json').andRespondWith(401, apiData.spaces);
      });

      it('calls back with a JSend error response with an user-friendly error message', function(done) {
        connector.getProjects(params, function(jsendResponse) {
          expect(request.get).toHaveBeenCalled();
          expect(jsendResponse.status).toEqual('fail');
          expect(jsendResponse.data).toEqual({ projects: [] });
          expect(jsendResponse.message).toContain('connection credentials expired');

          done();
        });
      });
    });

    describe('successful API response', function() {
      beforeEach(function() {
        apiData.spaces = [{
          name: 'Breakout',
          'wiki_name': 'breakout'
        }];

        stubHttpReponseFor('get', connector.API_URL + '/spaces.json').andRespondWith(200, apiData.spaces);
      });

      it('packs the received list of spaces into a JSend success message and passes it to the callback', function(done) {
        connector.getProjects(params, function(jsendResponse) {
          expect(jsendResponse).toEqual({
            status: 'success',
            data: {
              projects: [{
                'name'    : apiData.spaces[0].name,
                'urlName' : apiData.spaces[0]['wiki_name']
              }]
            }
          });

          done();
        });
      });
    });
  });

  describe('goal operations', function() {
    var ticketsApiUrl = spaceApiUrl + '/tickets';
    var ticketsAppUrl = 'https://www.assembla.com/spaces/breakout/tickets/';

    beforeEach(function() {
      apiData.ticketStatuses = [
        {id: 1, name: 'New', state: 1},
        {id: 2, name: 'In-Progress', state: 1},
        {id: 3, name: 'Fixed', state: 0}
      ];
    });

    describe('#getGoal(number, callback)', function() {
      var ticketNumber = 123;

      beforeEach(function() {
        params.id = ticketNumber;
      });

      describe('failure API response', function() {
        describe('ticket not found', function() {
          beforeEach(function() {
            stubHttpReponseFor('get', ticketsApiUrl + '/statuses.json').andRespondWith(200, apiData.ticketStatuses);
            stubHttpReponseFor('get', ticketsApiUrl + '/' + ticketNumber + '.json').andRespondWith(404,
              'some reposnse containing the ticket URL' + ticketsApiUrl + '/' + ticketNumber + '.json');
          });

          it('calls back with a JSend error response with an user-friendly error message', function(done) {
            connector.getGoal(params, function(jsendResponse) {
              expect(request.get).toHaveBeenCalledTwice();
              expect(jsendResponse.status).toEqual('fail');
              expect(jsendResponse.message).toContain('resource not found');
              expect(jsendResponse.message).not.toContain('https://api.assembla.com/v1/spaces/breakout/tickets/123.json');

              done();
            });
          });
        });

        describe('ticket statuses not found', function() {
          beforeEach(function() {
            stubHttpReponseFor('get', ticketsApiUrl + '/statuses.json').andRespondWith(404,
              'some reposnse containing the ticket URL' + ticketsApiUrl + '/statuses.json');
            stubHttpReponseFor('get', ticketsApiUrl + '/' + ticketNumber + '.json').andRespondWith(404,
              'some reposnse containing the ticket URL' + ticketsApiUrl + '/' + ticketNumber + '.json');
          });

          it('calls back with a JSend error response with an user-friendly error message', function(done) {
            connector.getGoal(params, function(jsendResponse) {
              expect(request.get).toHaveBeenCalledTwice();
              expect(jsendResponse.status).toEqual('fail');
              expect(jsendResponse.message).toContain('resource not found');
              expect(jsendResponse.message).not.toContain('https://api.assembla.com/v1/spaces/breakout/tickets/statuses.json');
              expect(jsendResponse.message).toContain('resource not found');
              expect(jsendResponse.message).not.toContain('https://api.assembla.com/v1/spaces/breakout/tickets/123.json');

              done();
            });
          });
        });
      });

      describe('successful API response', function() {
        beforeEach(function() {
          apiData.ticket = {
            number: ticketNumber,
            summary: 'This is the ticket summary',
            description: 'A good ticket description',
            state: 1,
            status: 'In-Progress'
          };

          stubHttpReponseFor('get', ticketsApiUrl + '/statuses.json').andRespondWith(200, apiData.ticketStatuses);
          stubHttpReponseFor('get', ticketsApiUrl + '/' + ticketNumber + '.json').andRespondWith(200, apiData.ticket);
        });

        it('transforms and packs the received tickets into a success JSend response and passes it to the callback', function(done) {
          connector.getGoal(params, function(jsendResponse) {
            expect(request.get).toHaveBeenCalledTwice();
            expect(jsendResponse).toEqual({
              status: 'success',
              data: {
                goal: {
                  title: 'This is the ticket summary',
                  description: 'A good ticket description',
                  status: 1,
                  'external_id': 123,
                  link: 'https://www.assembla.com/spaces/breakout/tickets/123'
                }
              }
            });

            done();
          });
        });
      });
    });


    describe('#getGoals(callback)', function() {
      var paginationParams;

      beforeEach(function() {
        apiData.tickets = [{
          number: 1,
          summary: 'This is the first ticket summary',
          description: 'A good ticket description',
          state: 1,
          status: 'In-Progress'
        }, {
          number: 2,
          summary: 'This is the second ticket summary',
          description: 'Another good ticket description',
          state: 0,
          status: 'Fixed'
        }];

        paginationParams = {
          'page': 1,
          'per_page': connector.TICKET_LIST_PAGE_SIZE
        };

        stubHttpReponseFor('get', ticketsApiUrl + '/statuses.json').andRespondWith(200, apiData.ticketStatuses);
      });


      describe('when a current milestone IS found', function() {
        var currentMilestone;

        beforeEach(function() {
          apiData.milestones = [{
            'id': 123,
            'title': 'Next release',
            'planner_type': 2 // CURRENT
          }];
          currentMilestone = apiData.milestones[0];

          stubHttpReponseFor('get', spaceApiUrl + '/milestones/all.json').andRespondWith(200, apiData.milestones);
          stubHttpReponseFor('get', ticketsApiUrl + '/milestone/' + currentMilestone.id + '.json', paginationParams).andRespondWith(200, apiData.tickets);
        });

        it('fetches the tickets by that milestone', function(done) {
          connector.getGoals(params, function() {
            expect(request.get).toHaveBeenCalledThrice();
            // if the right requests are not made, the flow never gets here
            done();
          });
        });
      });


      describe('when NO current milestone found', function() {
        beforeEach(function() {
          apiData.milestones = [{
            'id': 345,
            'title': 'Backlog',
            'planner_type': 1 // BACKLOG
          }];

          stubHttpReponseFor('get', spaceApiUrl + '/milestones/all.json').andRespondWith(200, apiData.milestones);
          stubHttpReponseFor('get', ticketsApiUrl + '.json', paginationParams).andRespondWith(200, apiData.tickets);
        });

        it('fetches all the tickets', function(done) {
          connector.getGoals(params, function() {
            expect(request.get).toHaveBeenCalledThrice();
            // if the right requests are not made, the flow never gets here
            done();
          });
        });
      });


      describe('pagination', function() {
        var originalConnectorPageSize, page1, page2, page3;

        beforeEach(function() {
          originalConnectorPageSize = connector.TICKET_LIST_PAGE_SIZE;
        });

        afterEach(function() {
          connector.TICKET_LIST_PAGE_SIZE = originalConnectorPageSize;
        });

        beforeEach(function() {
          stubHttpReponseFor('get', spaceApiUrl + '/milestones/all.json').andRespondWith(200, []);

          paginationParams['per_page'] =
          connector.TICKET_LIST_PAGE_SIZE = 2;

          page1 = [{
            number: 1,
            summary: 'Summary 1',
            description: 'Description 1',
            state: 1,
            status: 'In-Progress'
          }, {
            number: 2,
            summary: 'Summary 2',
            description: 'Description 2',
            state: 1,
            status: 'Fixed'
          }];
          paginationParams.page = 1;
          stubHttpReponseFor('get', ticketsApiUrl + '.json', paginationParams).andRespondWith(200, page1);

          page2 = [{
            number: 3,
            summary: 'Summary 3',
            description: 'Description 3',
            state: 1,
            status: 'In-Progress'
          }, {
            number: 4,
            summary: 'Summary 4',
            description: 'Description 4',
            state: 1,
            status: 'Fixed'
          }];
          paginationParams.page = 2;
          stubHttpReponseFor('get', ticketsApiUrl + '.json', paginationParams).andRespondWith(200, page2);

          page3 = [{
            number: 5,
            summary: 'Summary 5',
            description: 'Description 5',
            state: 1,
            status: 'Fixed'
          }];
          paginationParams.page = 3;
          stubHttpReponseFor('get', ticketsApiUrl + '.json', paginationParams).andRespondWith(200, page3);
        });

        it('fetches all the tickets page-by-page', function(done) {
          connector.getGoals(params, function(jsendResponse) {
            expect(jsendResponse.data.goals.length).toBe(page1.length + page2.length + page3.length);
            expect(request.get.callCount).toBe(5); // 1 statuses + 1  milestones + 3 pages of tickets

            done();
          });
        });
      });


      it('transforms and packs the received tickets into a success JSend response and passes it to the callback', function(done) {
        stubHttpReponseFor('get', spaceApiUrl + '/milestones/all.json').andRespondWith(200, []);
        stubHttpReponseFor('get', ticketsApiUrl + '.json', paginationParams).andRespondWith(200, apiData.tickets);

        connector.getGoals(params, function(jsendResponse) {
          expect(request.get).toHaveBeenCalledThrice();
          expect(jsendResponse).toEqual({
            status: 'success',
            data: {
              goals: [{
                title: apiData.tickets[0].summary,
                description: apiData.tickets[0].description,
                status: 1,
                'external_id': apiData.tickets[0].number,
                link: ticketsAppUrl + apiData.tickets[0].number
              }]
            }
          });

          done();
        });
      });
    });


    describe('#createGoal(goal, callback)', function() {
      var goal, goalTransformedToTicket;

      beforeEach(function() {
        goal = {
          title: 'This is the goal to create',
          description: 'The description of the goal to create',
          status: 1
        };
        params.goal = goal;

        goalTransformedToTicket = {
          'ticket': {
            'milestone_id': 3,
            'summary': 'This is the goal to create',
            'description': 'The description of the goal to create',
            'ticket_status_id': 1,
            'state': 1,
            'status': 'New'
          }
        };

        apiData.milestones = [
          {'id': 1, 'planner_type': 0, 'title': 'Release 42'},
          {'id': 2, 'planner_type': 1, 'title': 'Backlog'},
          {'id': 3, 'planner_type': 2, 'title': 'Current'}
        ];

        stubHttpReponseFor('get', spaceApiUrl + '/milestones/all.json').andRespondWith(200, apiData.milestones);
        stubHttpReponseFor('get', ticketsApiUrl + '/statuses.json').andRespondWith(200, apiData.ticketStatuses);
      });

      describe('failed API response', function() {
        beforeEach(function() {
          apiData.ticket = {
            errors: {
              summary: ['can’t be blank']
            }
          };

          stubHttpReponseFor('post', ticketsApiUrl + '.json', goalTransformedToTicket).andRespondWith(422, apiData.ticket);
        });

        it('sends the transformed goal and passes the transformed response to the callback', function(done) {
          connector.createGoal(params, function(jsendResponse) {
            expect(request.get).toHaveBeenCalledTwice();
            expect(request.post).toHaveBeenCalledOnce();
            expect(jsendResponse.status).toEqual('fail');
            expect(jsendResponse.message).toContain('data validation error');

            done();
          });
        });
      });

      describe('successful API response', function() {
        beforeEach(function() {
          request.get.reset();
          apiData.ticket = {
            number: 1,
            summary: goal.title,
            description: goal.description,
            state: 1,
            status: apiData.ticketStatuses[0].name
          };

          stubHttpReponseFor('post', ticketsApiUrl + '.json', goalTransformedToTicket).andRespondWith(200, apiData.ticket);
        });


        it('sends the transformed goal and passes the transformed response to the callback', function(done) {
          connector.createGoal(params, function(jsendResponse) {
            expect(request.get).toHaveBeenCalledTwice();
            expect(request.post).toHaveBeenCalledOnce();
            expect(jsendResponse).toEqual({
              status: 'success',
              data: {
                goal: {
                  title: goal.title,
                  description: goal.description,
                  status: goal.status,
                  'external_id': apiData.ticket.number,
                  link: ticketsAppUrl + apiData.ticket.number
                }
              }
            });

            done();
          });
        });


        it('first gets the ticket statuses and milestones', function(done) {
          connector.createGoal(params, function() {
            expect(request.get).toHaveBeenCalledTwice();
            expect(request.post).toHaveBeenCalledOnce();
            expect(request.get).toHaveBeenCalledBefore(request.post);

            expect(request.get.getCall(0).args[0].uri).toBe('https://api.assembla.com/v1/spaces/breakout/milestones/all.json');
            expect(request.get.getCall(1).args[0].uri).toBe('https://api.assembla.com/v1/spaces/breakout/tickets/statuses.json');
            expect(request.post.getCall(0).args[0].uri).toBe('https://api.assembla.com/v1/spaces/breakout/tickets.json');

            done();
          });
        });
      });
    });


    describe('#updateGoal()', function() {
      var goal, goalTransformedToTicket;

      beforeEach(function() {
        goal = {
          title: 'This is the goal to update',
          description: 'The description of the goal to update',
          status: 1,
          'external_id': 123,
          link: 'https://www.assembla.com/spaces/breakout/tickets/123'
        };
        params.goal = goal;

        goalTransformedToTicket = {
          'ticket': {
            'summary': 'This is the goal to update',
            'description': 'The description of the goal to update',
            'number': 123
          }
        };

        stubHttpReponseFor('get', ticketsApiUrl + '/statuses.json').andRespondWith(200, apiData.ticketStatuses);
        stubHttpReponseFor('get', ticketsApiUrl + '/' + goal['external_id'] + '.json').andRespondWith(200, apiData.ticket);
        stubHttpReponseFor('put', ticketsApiUrl + '/' + goal['external_id'] + '.json', goalTransformedToTicket).andRespondWith(200, []);
      });

      it('sends the transformed goal and passes the transformed response to the callback', function(done) {
        connector.updateGoal(params, function(jsendResponse) {
          expect(jsendResponse).toEqual({
            status: 'success',
            data: {
              goal: goal
            }
          });

          done();
        });
      });

      it('fetches the external ticket for analysis', function(done) {
        connector.updateGoal(params, function() {
          expect(request.get).toHaveBeenCalledTwice();
          expect(request.put).toHaveBeenCalledOnce();
          expect(request.get).toHaveBeenCalledBefore(request.put);

          expect(request.get.getCall(0).args[0].uri).toBe('https://api.assembla.com/v1/spaces/breakout/tickets/123.json');
          expect(request.get.getCall(1).args[0].uri).toBe('https://api.assembla.com/v1/spaces/breakout/tickets/statuses.json');
          expect(request.put.getCall(0).args[0].uri).toBe('https://api.assembla.com/v1/spaces/breakout/tickets/123.json');

          done();
        });
      });
    });
  });

  afterEach(function() { sandbox.restore(); });

});
