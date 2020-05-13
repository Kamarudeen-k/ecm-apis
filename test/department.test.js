const supertest = require('supertest');


let server = supertest.agent('http://localhost:80');

describe('Tests for Departments APIs', function(){
    
    test('Returns the list of Departments AVAILABLE', function(done){
        server.get('/departments/')
            .expect(200)
            .end(function(err, res){
                done();
               });
    });

    test('Returns the details of a Single Department', function(done){
        server.get('/departments/1')
            .expect(200)
            .end(function(err, res){
                expect(res.body.department_id).toBe(1);
                done();
               });
       
    });
    
});