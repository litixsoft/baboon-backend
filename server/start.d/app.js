'use strict';
/*eslint no-new:0 */

var baboon = require('../../lib/index');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var router = new express.Router();
var Routes = require('./../routes');
var Middleware = require('./../middleware');
var cors = require('cors');
var io;

/**
 * Configure express server application
 *
 * @param options
 * @param next
 */
module.exports = function (options, next) {

    var debug = require('debug')('baboon:app');

    debug('Create express application');

    if (!options.config) {
        throw new TypeError('Missing options.config, required for create express application');
    }

    // Middleware
    var middleware = new Middleware(options);

    // Express application
    var app = express();

    // Http server
    var server = require('http').createServer(app);

    // Configure Express
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(methodOverride());
    app.use(cors());
    app.use(logger('dev'));

    // Middleware for all requests
    app.use(middleware.allRequests);

    // Routes
    app.use('/', router);

    // Errors middleware
    app.use(middleware.errorHandler);

    debug('Create injects for the controllers');
    // Add modules to injects
    var injects = {
        config: options.config,
        crypto: new baboon.LxCrypto(),
        mail: new baboon.LxMail(options.config.MAIL)
    };

    // Add db to injects
    if (options.db) {
        injects.db = options.db;
    }

    // Add db to injects
    if (options.errors) {
        injects.errors = options.errors;
    }

    // Add auth to injects
    if (options.auth) {
        injects.auth = options.auth;
    }

    debug('Controller injects:');
    debug(injects);

    debug('Load the controllers from the api path');
    var lxController = new baboon.LxController(options.config.API_PATH, injects);

    // Make lxSocketRouter placeholder object with mock function.
    // When SOCKET_ENABLED true then overwrite this object.
    var lxSocketRouter = {on:function(){}};

    // Check if socket enabled, when enabled create instance
    // of lxSocketRouter and register the connection event
    if (options.config.SOCKET_ENABLED) {

        // Create instance for socket router
        lxSocketRouter = new baboon.LxSocketRouter(options);

        debug('Socket is enabled, start socket.io server');
        io = require('socket.io')(server);

        // When connected register sockets
        io.on('connection', function (socket) {
            lxSocketRouter.registerSocketEvents(socket);
        });
    }

    // Initialize all routes with express router and controller.
    // Register all socket events with lxSocketRouter.
    // If lxSocketRouter is not initialized, is passed the undefined object.
    debug('Initialize routes');
    new Routes(router, lxController, middleware, lxSocketRouter);

    // export server to options
    options.server = server;


//    if (options.auth) {
//        options.auth.refreshRightsInDb(function (err, res) {
//            console.log(res);
//        });
//    }


    // next callback
    next();
};
