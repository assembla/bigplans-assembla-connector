'use strict';

var checkIfGoalUpdateNeeded = require('../lib/checkIfGoalUpdateNeeded');
var async = require('async');


describe('checkIfGoalUpdateNeeded', function() {
  var goal, externalTicket;

  beforeEach(function() {
    externalTicket = {
      summary     : 'Ticket summary',
      description : 'Ticket description',
      state       : 1 // Some OPEN status
    };

    goal = {
      title       : externalTicket.summary,
      description : externalTicket.description,
      status      : '0' // Planned, equivalent to OPEN
    };
  });


  describe('with no relevant change', function() {
    it('calls back with error', function(done) {
      async.auto({
        'externalTicket': function(callback) { callback(null, externalTicket); },
        'updatesRequired': ['externalTicket', checkIfGoalUpdateNeeded(goal)]
      }, function(err) {
        expect(err.message).toBe('Nothing to update');
        done();
      });
    });
  });


  describe('when a goal property is missing (meaning it didn’t change)', function() {
    beforeEach(function() {
      delete goal.title;
    });

    it('is not considered a change', function(done) {
      async.auto({
        'externalTicket': function(callback) { callback(null, externalTicket); },
        'updatesRequired': ['externalTicket', checkIfGoalUpdateNeeded(goal)]
      }, function(err) {
        expect(err.message).toBe('Nothing to update');
        done();
      });
    });
  });



  describe('with no relevant change', function() {
    it('responds with the same goal it received from BP', function(done) {
      async.auto({
        'externalTicket': function(callback) { callback(null, externalTicket); },
        'updatesRequired': ['externalTicket', checkIfGoalUpdateNeeded(goal)]
      }, function(err, results) {
        expect(results.goals).toEqual([goal]);
        done();
      });
    });
  });


  describe('when status changed but didn’t change its polarity', function() {
    beforeEach(function() {
      goal.status = '1'; // WIP, also equivalent to OPEN, so no change
    });

    it('calls back with error', function(done) {
      async.auto({
        'externalTicket': function(callback) { callback(null, externalTicket); },
        'updatesRequired': ['externalTicket', checkIfGoalUpdateNeeded(goal)]
      }, function(err) {
        expect(err.message).toBe('Nothing to update');
        done();
      });
    });
  });


  describe('when title changed', function() {
    beforeEach(function() {
      goal.title = 'A new nicer title';
    });

    it('calls back WITHOUT error', function(done) {
      async.auto({
        'externalTicket': function(callback) { callback(null, externalTicket); },
        'updatesRequired': ['externalTicket', checkIfGoalUpdateNeeded(goal)]
      }, function(err) {
        expect(err).toBe(null);
        done();
      });
    });
  });


  describe('when description changed', function() {
    beforeEach(function() {
      goal.description = 'A more elaborate description';
    });

    it('calls back WITHOUT error', function(done) {
      async.auto({
        'externalTicket': function(callback) { callback(null, externalTicket); },
        'updatesRequired': ['externalTicket', checkIfGoalUpdateNeeded(goal)]
      }, function(err) {
        expect(err).toBe(null);
        done();
      });
    });
  });


  describe('when status changed', function() {
    beforeEach(function() {
      goal.status = '2'; // Closed, equivalent to CLOSED
    });

    it('calls back WITHOUT error', function(done) {
      async.auto({
        'externalTicket': function(callback) { callback(null, externalTicket); },
        'updatesRequired': ['externalTicket', checkIfGoalUpdateNeeded(goal)]
      }, function(err) {
        expect(err).toBe(null);
        done();
      });
    });
  });

});
