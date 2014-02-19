'use strict';


module.exports = function SpaceTransformer(spaces) {
  this.getProjects = function() {
    return spaces.map(function(space) {
      return {
        name: space.name,
        urlName: space['wiki_name']
      };
    });
  };
};
