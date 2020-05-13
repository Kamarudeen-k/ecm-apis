const supertest = require('supertest');


let server = supertest.agent('http://localhost:80');

describe('Tests for Categories APIs', function(){
    
   test('Returns the list of Categories AVAILABLE', function(done) {
      server.get('/categories')
          .expect(200)
          .end(function(err, res){
            done();
          });
    });

    test('Returns the details of a Single Category', function(done) {
      server.get('/categories/1')
            .expect(200)
            .end(function(err, res){
              expect(res.body.category_id).toBe(1);      
              done();
            });
    });

    test('Returns the category of a particular product', function(done) {
      server.get('/categories/inProduct/1')
            .expect(200)
            .end(function(err, res){
              expect(res.body[0].category_id).toBe(1);
              done();
            });
    });

    test('Returns list of categories in a department', function(done) {
      server.get('/categories/inDepartment/1')
            .expect(200)
            .end(function(err, res){
              expect(res.body[0].department_id).toBe(1);    
              done();
            });
    });
});