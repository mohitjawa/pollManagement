const request = require('supertest')
const expect = require('chai').expect
const baseUrl = 'http://localhost:4000/'

describe('Restful Admin Api tests', () => {
    before('check status of login', (done) => {
        request(baseUrl)
        .post('login')
        .send({
            "userName" : "mohitjawa",
            "password" : "mohit1234"
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .end( function (err, res ){
            expect(res.status).to.be.equal(200)
            expect(res.body.token).not.to.be.null
            token = res.body.token
            if(err){
                throw err;
            }
            done();
        });
        
    });
    it('check get poll list', (done) => {
        request(baseUrl)
        .get('poll-list')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('authtoken',  token) 
        .end( function (err, res ){
            expect(res.statusCode).to.be.equal(200)
            if(err){
                throw err;
            }
            done();
        });
    });
});

