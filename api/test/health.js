require('../config')
const { expect } = require("chai"),
    nconf = require('nconf'),
    got = require('got'),
    BASEURL = `http://localhost:${nconf.get('PORT')}/api`,
    nconf = require('nconf');

describe('health', function () {
    it('statusCode 200', function (done) {
        got.get(`${BASEURL}/health`, { body: { 'secret': nconf.get('HEALTH_SECRET') }, json: true })
            .then(({ statusCode }) => {
                expect(statusCode).to.equal(200)
                done()
            })
            .catch(done)
    });
});
