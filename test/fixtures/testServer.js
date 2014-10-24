'use strict';

var io = require('socket.io-client');
var isRunning = false;
var socket;
var app;

function getServer (cb) {

    if (isRunning) {
        cb();
    } else {
        var server = require('../../baboon-backend.js');
        server.eventEmitter.on('server_started', function (e) {
            isRunning = true;
            app = e;

            socket = io.connect('http://127.0.0.1:3000', {
                'reconnection delay': 0,
                'reopen delay': 0,
                'force new connection': true
            });

            var engine = socket.io.engine;

            socket.on('connect', function () {
                console.log('socket connected with:', engine.transport.query.transport);
            });

            engine.on('upgrade', function (msg) {
                console.log('socket upgrade connection to:', msg.query.transport);
                cb();

            });
        });
    }
}

exports.socket = socket;
exports.app = app;
exports.getServer = getServer;
