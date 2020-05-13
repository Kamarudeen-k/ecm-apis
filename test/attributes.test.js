const supertest = require('supertest');


let server = supertest.agent('http://localhost:80');

describe('Tests for Attributes APIs', function(){
    
   test('Returns the list of Attributes AVAILABLE', function(done) {
      server.get('/attributes')
          .expect(200)
          .end(function(err, res){
            done();
          });
    });

    test('Returns the details of a Single Attribute', function(done) {
      server.get('/attributes/1')
            .expect(200)
            .end(function(err, res){
              expect(res.body.attribute_id).toBe(1);      
              done();
            });
    });

    test('Returns the details of a Single Attribute', function(done) {
      server.get('/attributes/1test')
            .expect(400)
            .end(function(err, res){
              done();
            });
    });

    test('Returns the list of values for a single attribute', function(done) {
      server.get('/attributes/values/1')
            .expect(200)
            .end(function(err, res){
              expect(res.body[0].attribute_id).toBe(1);
              done();
            });
    });

    test('Returns list of attributes for a single product', function(done) {
      server.get('/attributes/inProduct/1')
            .expect(200)
            .end(function(err, res){
              expect(res.body.length).toBeGreaterThan(0);    
              done();
            });
    });
});