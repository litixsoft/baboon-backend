'use strict';

// Environment default settings
process.env.NODE_ENV = process.env.NODE_ENV || 'reg';
process.env.PORT = process.env.PORT || 3001;
process.env.HOST = process.env.HOST || '127.0.0.1';

var baboon = require('../../lib/index');
var path = require('path');
var Client = require('node-rest-client').Client;
var client = new Client();
var root = path.join(__dirname, '..', '..');
var config = new baboon.LxConfig(root);
var lxMongoDb = baboon.lxMongoDb;
var base = 'http://' + config.HOST + ':' + config.PORT;
var io = require('socket.io-client');
var isRunning = false;
var socket;
var server;
var restOptions = {
    headers: {
        'x-access-apikey': config.API_KEYS[0].key
    }
};

/**
 * Create Test data for database
 * @param cb
 */
function setTestData(cb) {

    // Create user data
    var testData = require(path.join(__dirname, '../', 'fixtures', 'test-data.json'));
    var users = testData.bbTest.users;

    // Check user data is loaded
    if (users.length === 0) {
        throw new Error('Error: can\'t load test-data');
    }

    // Get db instance
    var db = lxMongoDb.connection('bbTest');

    // Reset database
    db.dropDatabase(function (err) {
        if (err) {
            throw new Error(err);
        }

        // Create new users collection
        db.createCollection('users', function (err, collection) {
            if (err) {
                throw err;
            }

            // Insert users in database
            collection.insert(users, function (err, docs) {
                if (err) {
                    throw err;
                }

                console.log('Create test data: ' + docs.length + ' docs created.');
                cb();

            });
        });
    });
}

/**
 * Connect to Websocket
 * @param cb
 */
function getSocket(cb) {

    socket = io.connect(base, {reconnection: false});

    var engine = socket.io.engine;

    // Connect event with polling
    socket.on('connect', function () {
        console.log('socket connected with:', engine.transport.query.transport);
    });

    // Connect event after upgrade to websocket
    engine.on('upgrade', function (msg) {
        console.log('socket upgrade connection to:', msg.query.transport);
        setTestData(cb);
    });
}

/**
 * Get server instance
 * @param cb
 */
function getServer(cb) {

    // Check server is running
    if (isRunning) {
        // Server instance exits
        cb();
    } else {
        // Server instance not exists, create new
        server = require('../../baboon-backend.js');
        server.eventEmitter.on('server_started', function () {
            // Server is started
            isRunning = true;

            // Connect to websocket
            if (config.SOCKET_ENABLED) {
                getSocket(cb);
            } else {
                setTestData(cb);
            }
        });
    }
}

/**
 * Regression API tests
 * Test the complete API of application
 */
describe('Regression API tests', function () {

    /**
     * Start server instance.
     * Make websocket connection and create test data
     */
    beforeEach(function (done) {
        getServer(function () {
            done();
        });
    });

    /**
     * Test API main module routes
     */
    describe('Test API main module routes', function () {

        it('REST-GET: /', function (done) {
            client.get(base + '/', restOptions, function (data, response) {
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
                expect(data.message).toBe('It work\'s, ' + config.NAME + ' server version: v' + config.VERSION);

                done();
            });
        });
    });

    /**
     * Test API main module, controller index routes
     */
    describe('Test API main module, controller index routes', function () {

        it('REST-GET: /awesomeThings', function (done) {

            client.get(base + '/awesomeThings', restOptions, function (data, response) {
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toBe('application/json; charset=utf-8');

                expect(data[0].name).toBe('NodeJS');
                expect(data[2].name).toBe('SocketIO');
                done();
            });
        });

        if (config.SOCKET_ENABLED) {

            it('SOCKET: awesomeThings with callback', function (done) {
                socket.emit('awesomeThings', {}, function (err, success) {
                    expect(err).toBeNull();
                    expect(success.status).toBe(200);
                    expect(success.data[2].name).toBe('SocketIO');
                    done();
                });
            });

            it('SOCKET: awesomeThings without callback', function (done) {
                socket.on('awesomeThings', function (success) {
                    expect(success.status).toBe(200);
                    expect(success.data[2].name).toBe('SocketIO');
                    done();
                });
                socket.emit('awesomeThings', {});
            });
        }
    });

    /**
     * Test API main module, controller users routes
     */
    describe('Test API main module, controller users routes', function () {

        it('REST-GET: /user', function (done) {
            client.get(base + '/users', restOptions, function (data, response) {
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toBe('application/json; charset=utf-8');

                expect(data.length).toBe(3);
                expect(data[0].name).toBe('Name_1');
                expect(data[1].firstname).toBe('Firstname_2');
                expect(data[2].name).toBe('Name_3');
                done();
            });
        });

        it('REST-GET: /user/:id', function (done) {
            // Get actual ID for test
            client.get(base + '/users', restOptions, function (data, response) {
                expect(response.statusCode).toBe(200);
                expect(response.headers['content-type']).toBe('application/json; charset=utf-8');

                expect(data.length).toBe(3);
                var checkId = data[1]._id;

                // Check with actual id
                client.get(base + '/users/' + checkId, restOptions, function (data, response) {
                    expect(response.statusCode).toBe(200);
                    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');

                    expect(data[0]._id).toBe(checkId);
                    expect(data[0].firstname).toBe('Firstname_2');
                    expect(data[0].name).toBe('Name_2');

                    server.eventEmitter.emit('server_stop');
                    server.eventEmitter.on('server_stopped', function () {
                        done();
                    });

                });
            });
        });
    });
});
