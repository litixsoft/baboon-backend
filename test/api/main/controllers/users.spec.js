'use strict';

var path = require('path');
var root = path.join('../../../../');

// Fake db for error test
var db = require('../../../fixtures/lxMongoDb_MOCK');
db.setTestConnection('bbTest');

// Injects for all controller
var injects = {
    db: db,
    config: {}
};

// Load users controller
var usersTest = require(path.join(root, 'api', 'main', 'controllers', 'users'))(injects);

describe('API Tests main/controllers/users', function () {

    it('getAll should return an error', function (done) {

        db.behavior.findError = true;
        usersTest.getAll(null, null, function(err) {
            expect(err.message).toBe('lxMongoDb_MOCK find error');
            done();
        });
    });

    it('getById should return an error', function (done) {

        db.behavior.findError = true;
        usersTest.getById({params:{id:'53baeb8da234dc09d1000002'}}, null, function(err) {
            expect(err.message).toBe('lxMongoDb_MOCK find error');
            done();
        });
    });
});
