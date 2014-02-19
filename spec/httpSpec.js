'use strict';

var responseHandlers = require('../lib/http').responseHandlers;


describe('responseHandlers', function() {
  var res, err, callback;

  beforeEach(function() {
    res = {'some': 'response'};
    err = new Error('Something bad happened');
    callback = jasmine.createSpy();
    spyOn(console, 'error');
  });

  describe('200', function() {
    it('packs the response in a JSend success message and passes it to the callback', function() {
      responseHandlers['200'](err, res, callback);

      expect(callback).toHaveBeenCalledWith(err, {
        status: 'success',
        data: res
      });
    });
  });


  describe('202', function() {
    it('packs the response in a JSend success message and passes it to the callback', function() {
      responseHandlers['201'](err, res, callback);

      expect(callback).toHaveBeenCalledWith(err, {
        status: 'success',
        data: res
      });
    });
  });


  describe('204', function() {
    it('creates a JSend empty-data success message and passes it to the callback', function() {
      responseHandlers['204'](err, res, callback);

      expect(callback).toHaveBeenCalledWith(err, {
        status: 'success',
        data: []
      });
    });
  });


  describe('401', function() {
    it('packs it in a JSend empty-data failure message with a user-friendly message', function() {
      res = { 'error_description': 'something not found' };
      responseHandlers['401'](err, res, callback);

      expect(callback).toHaveBeenCalledWith(err, {
        status: 'fail',
        message: 'connection credentials expired',
        data: []
      });
    });
  });


  describe('404', function() {
    it('packs it in a JSend empty-data failure message with a user-friendly message', function() {
      res = {'url': 'https://api.com/some/resource' };
      responseHandlers['404'](err, res, callback);

      expect(callback).toHaveBeenCalledWith(err, {
        status: 'fail',
        message: 'resource not found',
        data: []
      });
    });
  });


  describe('422', function() {
    it('packs response.fail in a JSend empty-data failure message and passes it to the callback', function() {
      res = { 'base': ['something not found'] };
      responseHandlers['422'](err, res, callback);

      expect(callback).toHaveBeenCalledWith(err, {
        status: 'fail',
        message: 'data validation error',
        data: []
      });
    });
  });


  describe('fallback', function() {
    it('creates a JSend empty-data error message and passes it to the callback', function() {
      res = {statusCode: 788};
      responseHandlers['fallback'](err, res, callback);

      expect(callback).toHaveBeenCalledWith(err, {
        status: 'error',
        message: 'unknown error',
        data: []
      });
    });
  });

});
