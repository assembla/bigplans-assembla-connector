'use strict';

var SpaceTransformer = require('../lib/spaceTransformer');


describe('SpaceTransformer', function() {
  describe('#getProjects()', function() {
    it('extracts name and wiki_name', function() {
      var spaces = [{
        'id'        : 'some-space-id',
        'payer_id'  : 'some-user-id',
        'name'      : 'Breakout',
        'wiki_name' : 'breakout',
        'some'      : 'more fields'
      }];

      var spaceTransformer = new SpaceTransformer(spaces);
      var projects = spaceTransformer.getProjects();

      expect(projects[0]).toEqual({
        name: spaces[0]['name'],
        urlName: spaces[0]['wiki_name']
      });
    });
  });
});
