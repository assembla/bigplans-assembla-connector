'use strict';

var _ = require('underscore');


module.exports = function checkForCurrentMilestone(callback, results) {
  var CURRENT = 2;
  var currentMilestone = _(results.milestones.data).find(function(m) {
    return m['planner_type'] === CURRENT;
  });

  callback(null, currentMilestone);
};
