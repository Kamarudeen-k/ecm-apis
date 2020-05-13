const supertest = require('supertest');


let server = supertest.agent('http://localhost:80');

describe('Tests for Customers APIs', function(){
    
   test('Creates a new Customer/User and login the new user and returns access token', function(done) {
      server.post('/customers')
          .set('Content-Type', 'application/json')
          .send({ 
            name: 'test',
            email: 'test111@gmail.com',
            password: 'test',
          })
          .expect(201)
          .end(function(err, res){
            expect(res.body.accessToken).toBeDefined();
            done();
          });
    });

    test('Login a customer and return the access token', function(done) {
      server.post('/customers/login')
            .set('Content-Type', 'application/json')
            .send({
              email: 'test105@gmail.com',
              password: 'test'
            })
            .expect(201)
            .end(function(err, res){
              expect(res.body.accessToken).toBeDefined();      
              done();
            });
    });

    test('Tests Authentication denial of a customer with incorrect password', function(done) {
      server.post('/customers/login')
            .set('Content-Type', 'application/json')
            .send({
              email: 'test105@gmail.com',
              password: 'incorrect'
            })
            .expect(401)
            .end(function(err, res){
              done();
            });
    });

    test('Returns the details of a Single customer', function(done) {
      server.get('/customers/1')
            .expect(200)
            .end(function(err, res){
              done();
            });
    });
    
});