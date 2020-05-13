const supertest = require('supertest');


let server = supertest.agent('http://localhost:80');

describe('Tests for Products APIs', function(){
    
   test('Returns the list of products according to the page number', function(done) {
      server.get('/products')
          .query({
            page: 1,
            limit: 10,
            description_length: 300
          })
          .expect(200)
          .end(function(err, res){
            expect(res.body.paginationMeta.currentPageSize).toBeGreaterThan(0);
            done();
          });
    });

    test('Returns the list of product that matches the search string', function(done) {
      server.get('/products/search')
            .query({
              page: 1,
              limit: 10,
              description_length: 300,
              query_string: 'Coat',
              all_words: 'on'
            })
            .expect(200)
            .end(function(err, res){
              expect(res.body.products.count).toBeGreaterThan(0);      
              done();
            });
    });

    test('Returns the details of a Single Product', function(done) {
      server.get('/products/1')
            .expect(200)
            .end(function(err, res){
              done();
            });
    });

    test('Returns list of products in a category', function(done) {
      server.get('/products/inCategory/1')
            .query({
              page: 1,
              limit: 10,
              description_length: 300
            })
            .expect(200)
            .end(function(err, res){
              expect(res.body.count).toBeGreaterThan(0);    
              done();
            });
    });

    test('Returns list of products in a department', function(done) {
      server.get('/products/inDepartment/1')
            .query({
              page: 1,
              limit: 10,
              description_length: 300
            })
            .expect(200)
            .end(function(err, res){
              expect(res.body.count).toBeGreaterThan(0);    
              done();
            });
    });

    test('Allows the user to post a review for a product and returns the posted review', function(done) {
      server.post('/products/1/reviews')
            .set('Content-Type', 'application/json')
            .send({
              "product_id": 1,
              "review": 'This is a test reiview for a product_id 1',
              "rating": 5,
            })
            .expect(201)
            .end(function(err, res){
              done();
            });
    });

    test('Returns list of reviews for a product', function(done) {
      server.get('/products/1/reviews')
            .expect(200)
            .end(function(err, res){
              expect(res.body.count).toBeGreaterThan(0);    
              done();
            });
    });
    
});