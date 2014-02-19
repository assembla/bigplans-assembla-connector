'use strict';

var API_URL = require('..').API_URL;
var makeRequest = require('./http').makeRequest;


module.exports = function(params) {
  var spaceUrl = API_URL + '/spaces/' + params.urlName;
  var headers = {
    'Content-type': 'application/json',
    'Authorization': 'Bearer ' + params.accessToken
  };

  module.exports.getTicketStatuses = function(callback) {
    var requestInfo = {
      method: 'GET',
      uri: spaceUrl + '/tickets/statuses.json',
      headers: headers
    };

    makeRequest(requestInfo, callback);
  };


  module.exports.getMilestones = function(callback) {
    var requestInfo = {
      method: 'GET',
      uri: spaceUrl + '/milestones/all.json',
      headers: headers
    };

    makeRequest(requestInfo, callback);
  };


  module.exports.getUsers = function(callback) {
    var requestInfo = {
      method: 'GET',
      uri: spaceUrl + '/users.json',
      headers: headers
    };

    makeRequest(requestInfo, callback);
  };


  module.exports.getTicket = function(number) {
    return function(callback) {
      var requestInfo = {
        method: 'GET',
        uri: spaceUrl + '/tickets/' + number + '.json',
        headers: headers
      };

      makeRequest(requestInfo, callback);
    };
  };


  module.exports.ticketCreate = function(callback, results) {
    var requestInfo = {
      method: 'POST',
      body: JSON.stringify(results.ticket),
      uri: spaceUrl + '/tickets.json',
      headers: headers
    };

    makeRequest(requestInfo, callback);
  };


  module.exports.ticketUpdate = function(callback, results) {
    var requestInfo = {
      method: 'PUT',
      body: JSON.stringify(results.ticket),
      uri: spaceUrl + '/tickets/' + results.ticket.ticket.number + '.json',
      headers: headers
    };

    makeRequest(requestInfo, function(err, jsendResponse) {
      // this is a special case: PUT response body is empty, so we compensate here
      jsendResponse.data = results.ticket.ticket;
      callback(err, jsendResponse);
    });
  };


  module.exports.getTickets = function(callback, results) {
    var url = spaceUrl + '/tickets';

    if (results.currentMilestone) {
      url += '/milestone/' + results.currentMilestone.id;
    }

    url += '.json';

    var requestInfo = {
      method: 'GET',
      uri: url,
      headers: headers
    };

    makeRequest(requestInfo, callback);
  };


  module.exports.getSpaces = function(callback) {
    var requestInfo = {
      method: 'GET',
      uri: API_URL + '/spaces.json',
      headers: headers
    };

    makeRequest(requestInfo, callback);
  };


  return module.exports;
};
