'use strict';

var debug = require('debug')('assembla-connector-transform');
var TicketTransformer = require('./ticketTransformer');
var GoalTransformer = require('./goalTransformer');
var SpaceTransformer = require('./spaceTransformer');
var _ = require('underscore');

module.exports = function(urlName) {
  var transform = {};

  transform.ticketsToGoals = function (callback, results) {
    debug('ticketsToGoals: results %j', results);

    var errorMessage = anyJSendFailure(results);

    if (errorMessage) {
      callback(new Error(errorMessage));
      return;
    }

    var ticketTransformer = new TicketTransformer(
      results.tickets.data,
      results.ticketStatuses.data,
      urlName
    );

    var goals = ticketTransformer.getGoals();

    debug('ticketsToGoals: goals %j', goals);
    callback(null, goals);
  };


  transform.goalToTicket = function(goal) {
    debug('goalToTicket: goal %j', goal);

    return function(callback, results) {
      var errorMessage = anyJSendFailure(results);

      if (errorMessage) {
        callback(new Error(errorMessage));
        return;
      }

      var ticket = new GoalTransformer(results).getTicket(goal, results.externalTicket);

      debug('goalToTicket: ticket %j', ticket);
      callback(null, ticket);
    };
  };


  transform.spacesToProjects = function(callback, results) {
    debug('spacesToProjects: results %j', results);

    results.spaces.data = {
      projects: new SpaceTransformer(results.spaces.data).getProjects()
    };

    debug('spacesToProjects: ults.spaces.data %j', results.spaces.data);
    callback(null);
  };


  transform.assemblaUsersToBigplansUsers = function(callback, results) {
    debug('assemblaUsersToBigplansUsers: assemblaUsers %j', results.assemblaUsers);

    var errorMessage = anyJSendFailure(results);

    if (errorMessage) {
      callback(new Error(errorMessage));
      return;
    }

    var users = results.assemblaUsers.data.map(function(assemblaUser) {
      return {
        login: assemblaUser.login,
        email: assemblaUser.email
      };
    });

    debug('assemblaUsersToBigplansUsers: users %j', users);
    callback(null, users);
  };


  function anyJSendFailure(results) {
    debug('anyJSendFailure: results %j', results);

    var errorMessages = ['Assembla error:'];
    var isJSend = false;
    var err = false;

    for (var item in results) {
      isJSend = results[item] && ('status' in results[item]);

      if (isJSend && results[item].status !== 'success') {
        errorMessages.push(results[item].message);
        err = true;
      }
    }

    debug('anyJSendFailure: return err: %j, errorMessages: %j', err, errorMessages);

    if (err) {
      return _(errorMessages).uniq().join('\n');
    } else {
      return false;
    }
  }


  return transform;
};
