#!/usr/bin/env node

'use strict';

var path = require('path');
var baboon = require('../lib');
var config = new baboon.LxConfig(path.join(__dirname, '..'));

var options = {};
options.config = config;

var mongo = require('../lib/start.d/lxMongoDb');
mongo(options, function () {

    var auth = require('../lib/start.d/lxAuth');
    auth(options, function () {

        console.log('Refreshing rights in database..');

        options.auth.refreshRightsInDb(function (err, res) {
            options.db.disconnect();

            if (res.processRoles) {
                console.log('Rights created: ' + res.processRoles);
            }

            console.log('Done.');
        });
    });
});
