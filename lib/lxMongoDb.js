'use strict';

var async = require('async');
var debug = require('debug')('lxMongoDb');
var _ = require('lodash');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;
var events = require('events');

/**
 *
 * @returns {events.EventEmitter}
 */
function lxMongoDb() {
    var self = Object.create(events.EventEmitter.prototype);
    var connections = {};

    /**
     *
     * @type {string}
     */
    self.connectedState = false;

    /**
     * Converts a value by format. Is used in lx-valid.
     *
     * @param {String} format The schema format.
     * @param {*} value The value to convert.
     * @returns {*}
     */
    self.convertDataValuesForSchema = function (format, value) {
        if (typeof value !== 'string') {
            return value;
        }

        if (format === 'mongo-id') {
            return ObjectID.createFromHexString(value);
        }

        if (format === 'date-time' || format === 'date') {
            return new Date(value);
        }

        return value;
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

    /**
     * Connect to databases
     *
     * @param config
     */
    self.connect = function (config) {
        // check config object
        if (!_.isArray(config)) {
            throw new TypeError('Parameter config must be a array with objects.');
        }

        var asyncTasks = [];

        _.forEach(config, function (item) {
            if (!_.isObject(item)) {
                throw new TypeError('config item must be a abject.');
            }

            if (!item.hasOwnProperty('url')) {
                throw new TypeError('config item must have a url property.');
            }

            if (!item.hasOwnProperty('name')) {
                throw new TypeError('config item must have a name property.');
            }

            // check database exists in dbs
            if (!connections.hasOwnProperty(item.name)) {
                // Database not exists in storage push new connect to async tasks
                asyncTasks.push(function (callback) {
                    MongoClient.connect(item.url, function (err, database) {
                        if (err || !database) {
                            return callback(err || new Error('Unknown error, no database returned.'));
                        }

                        debug('Successfully connected to MongoDb: %s saved as: %s in storage.', database.databaseName, item.name);
                        connections[item.name] = database;

                        return callback();
                    });
                });
            } else {
                // Database exists in storage close db and push new connect to async tasks
                debug('Database %s exists in storage, no new connect use existing instance.');
            }
        });

        // Parallel connect to databases
        async.parallel(asyncTasks, function (err) {
            if (err) {
                debug('Error database connection: %j', JSON.stringify(err));
                self.emit('connect_error');

            } else {
                debug('All database connected.');
                self.connectedState = true;
                self.emit('connect');
            }
        });
    };

    /**
     * Disconnects from database
     */
    self.disconnect = function () {
        _.forEach(connections, function (val) {
            val.close();
        });
    };

    return self;
}

module.exports = lxMongoDb();
