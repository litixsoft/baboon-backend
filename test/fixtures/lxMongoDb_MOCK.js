'use strict';


var ObjectID = require('mongodb').ObjectID;
var events = require('events');
var _ = require('lodash');

/**
 *
 * @returns {events.EventEmitter}
 */
var lxMongoDb = function () {

    var self = Object.create(events.EventEmitter.prototype);
    var connections = {};
    self.behavior = {
        findError: false
    };
    self.testData = [];

    /**
     * Create test data for mock
     */
    var createTestData = function () {

        self.testData = [];
        var i, max;

        for (i = 0, max = 10; i < max; i += 1) {

            var rec = ( i + 1);

            self.testData.push (
                {
                    _id: rec,
                    name: 'name_' + rec,
                    first_name: 'first_name_' + rec
                }
            );
        }
    };

    /**
     * Create a test connection with test data
     * @returns {{collection: collection}}
     */
    var createTestConnection = function () {

        createTestData();

        return {
            collection: function () {

                return {
                    find: function () {

                        return {
                            toArray: function (cb) {

                                if (self.behavior.findError) {
                                    return cb(new Error('lxMongoDb_MOCK find error'));
                                }

                                return cb(null, self.testData);
                            }
                        };
                    }
                };
            }
        };
    };

    /**
     * Set test connection
     * @param name
     */
    self.setTestConnection = function (name) {
        connections[name] = createTestConnection();
    };

    /**
     * Convert string id in mongo id
     *
     * @param id
     * @returns {ObjectID}
     */
    self.convertToMongoId = function (id) {
        return ObjectID.createFromHexString(id);
    };

    /**
     * Get db object with name
     *
     * @param dbName
     * @returns {*}
     */
    self.connection = function (dbName) {

        if (!_.isString(dbName)) {
            throw new TypeError('Parameter dbName must be a string.');
        }

        if (!connections.hasOwnProperty(dbName)) {
            throw new Error('Database: ' + dbName + ' not found in connections');
        }

        return connections[dbName];
    };

    return self;
};

module.exports = lxMongoDb();
