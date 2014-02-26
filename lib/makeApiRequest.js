'use strict';

var async = require('async');
var connector = require('..');
var makeRequest = require('./http').makeRequest;


module.exports = function(params) {
  var spaceUrl = connector.API_URL + '/spaces/' + params.urlName;
  var headers = {
    'Content-type': 'application/json',
    'Authorization': 'Bearer ' + params.accessToken
  };

  module.exports.getTicketStatuses = function(callback) {
    var requestInfo = getRequestInfo(spaceUrl + '/tickets/statuses.json');

    makeRequest(requestInfo, callback);
  };


  module.exports.getMilestones = function(callback) {
    var requestInfo = getRequestInfo(spaceUrl + '/milestones/all.json');

    makeRequest(requestInfo, callback);
  };


  module.exports.getUsers = function(callback) {
    var requestInfo = getRequestInfo(spaceUrl + '/users.json');

    makeRequest(requestInfo, callback);
  };


  module.exports.getTicket = function(number) {
    return function(callback) {
      var requestInfo = getRequestInfo(spaceUrl + '/tickets/' + number + '.json');

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
    var url = getUrl(results);
    var pageNumber = 1;
    var tickets, fetchedTicketCount;

    async.doUntil(fetchAnotherPageOfTickets, isLastPage, function(err) {
      callback(err, tickets);
    });

    return;


    function getUrl(results) {
      var url = spaceUrl + '/tickets';

      if (results.currentMilestone) {
        url += '/milestone/' + results.currentMilestone.id;
      }

      url += '.json';

      return url;
    }

    function fetchAnotherPageOfTickets(callback) {
      var requestInfo = getTicketListRequestInfo(url);

      makeRequest(requestInfo, function(err, jsend) {
        collectTickets(jsend);
        fetchedTicketCount = jsend.data.length;
        pageNumber += 1;

        callback(jsend.status === 'success' ? null : new Error(jsend.message));
      });
    }

    function getTicketListRequestInfo(url) {
      var requestInfo = getRequestInfo(url);

      requestInfo.qs = {
        'page': pageNumber,
        'per_page': connector.TICKET_LIST_PAGE_SIZE
      };

      return requestInfo;
    }

    function collectTickets(jsend) {
      if (tickets) {
        tickets.data = tickets.data.concat(jsend.data);
      } else {
        tickets = jsend;
      }
    }

    function isLastPage() {
      return fetchedTicketCount < connector.TICKET_LIST_PAGE_SIZE;
    }

  };


  module.exports.getSpaces = function(callback) {
    var requestInfo = getRequestInfo(connector.API_URL + '/spaces.json');

    makeRequest(requestInfo, callback);
  };


  function getRequestInfo(url) {
    return {
      method: 'GET',
      uri: url,
      headers: headers
    };
  }


  return module.exports;
};
