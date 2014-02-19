'use strict';


module.exports = function arrayWrapTicket(callback, results) {
  results.tickets.data = [results.tickets.data];
  callback(null);
};
