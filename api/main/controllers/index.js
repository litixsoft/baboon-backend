'use strict';

/**
 * Index controller
 *
 * @returns {{}}
 */
module.exports = function (injects) {

    var self = {};
    var config = injects.config;

    var thingsArr = [
        {
            name: 'NodeJS',
            info: 'NodeJS is a platform built on Chrome\'s JavaScript runtime for easily building fast, scalable network applications.',
            awesomeness: 10
        },
        {
            name: 'ExpressJS',
            info: 'ExpressJS is a web application framework for nodeJS application development.',
            awesomeness: 10
        },
        {
            name: 'SocketIO',
            info: 'The fastest and most reliable real-time engine for websocket.',
            awesomeness: 10
        },
        {
            name: 'Grunt',
            info: 'The javascript task runner.',
            awesomeness: 10
        },
        {
            name: 'Jasmine-Node',
            info: 'Jasmine-Node makes the wonderful Pivotal Lab\'s jasmine spec framework available in node.js.',
            awesomeness: 10
        }
    ];

    /**
     * Index
     *
     * @param req
     * @param res
     */
    self.index = function index (req, res) {
        res.status(200).send({message: 'It work\'s, ' + config.NAME + ' server version: v' + config.VERSION});
    };

    /**
     * AwesomeThings
     *
     * @roles Guest
     * @param req
     * @param res
     */
    self.awesomeThings = function awesomeThings (req, res) {
        res.status(200).json(thingsArr);
    };


    /**
     * AwesomeThingsSocket
     *
     * @roles Guest
     * @param data
     * @param socket
     * @param callback
     */
    self.socket_awesomeThings = function socket_awesomeThings (data, socket, callback) {
        if (callback) {
            callback(null, {status:200, data:thingsArr});
        } else {
            socket.emit('awesomeThings', {status:200, data:thingsArr});
        }
    };

    return self;
};
