'use strict';

module.exports.API_URL     = 'https://api.assembla.com/v1';

module.exports.getGoal     = require('./lib/handlers/getGoal');
module.exports.createGoal  = require('./lib/handlers/createGoal');
module.exports.updateGoal  = require('./lib/handlers/updateGoal');
module.exports.getGoals    = require('./lib/handlers/getGoals');
module.exports.getUsers    = require('./lib/handlers/getUsers');
module.exports.getProjects = require('./lib/handlers/getProjects');
