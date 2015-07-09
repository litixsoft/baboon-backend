'use strict';

var mailer = require('nodemailer');
var fs = require('fs');
var path = require('path');
var async = require('async');
var lxHelpers = require('lx-helpers');

function configureMail (mail, config) {
    mail.from = mail.from || config.from;
    mail.to = config.debug && config.debug.to || mail.to || config.to;
    mail.text = config.debug ? 'Original receiver: ' + (mail.to || config.to) + '\n\n' + mail.text : mail.text;
}

function getTransport (type, options) {
    if (type === 'PICKUP') {
        return require('nodemailer-pickup-transport')(options);
    }

    if (type === 'SMTP') {
        return options.maxConnections || options.maxMessages ? require('nodemailer-smtp-pool')(options) : require('nodemailer-smtp-transport')(options);
    }
}

/**
 * The mail module.
 *
 * @param {Object} config The mail config object.
 * @return {Object} An object with methods for sending mails.
 */
module.exports = function (config) {
    var debug = require('debug')('baboon:LxMail');
    debug('Init');

    if (!lxHelpers.isObject(config)) {
        throw new Error('Parameter config is required!');
    }

    // default type to SMTP
    config.type = config.type || 'SMTP';

    // check if type is supported
    if (config.type !== 'SMTP' && config.type !== 'PICKUP') {
        throw new Error('Type ' + config.type + ' not supported! Only SMTP or PICKUP allowed!');
    }

    // set options
    var options = {
        maxConnections: config.maxConnections,
        maxMessages: config.maxMessages,
        debug: config.debug,
        ignoreTLS: config.ignoreTLS
    };

    // set options depending on type
    if (config.type === 'SMTP') {
        options.host = config.host;
        options.port = config.port;
        options.auth = config.auth;
        options.secure = config.useSsl;
        options.tls = {rejectUnauthorized: false};
    } else { // must be "PICKUP" because of validation before
        options.directory = config.directory;
    }

    // load transport
    debug('Load transport');
    var transport = mailer.createTransport(getTransport(config.type, options));
    var pub = {};

    /**
     * Sends a mail with the specified mail message.
     *
     * @param {Object} mail The mail message object.
     * @param {function} callback The callback function.
     */
    pub.sendMail = function (mail, callback) {
        configureMail(mail, config);

        // add html to text compiler
        if (mail.html) {
            var htmlToText = require('nodemailer-html-to-text').htmlToText;
            transport.use('compile', htmlToText());
        }

        debug('Send mail', mail);

        transport.sendMail(mail, function (error, result) {
            callback(error, result);
        });
    };

    /**
     * Sends a mail with the specified mail message und file templates.
     *
     * @param {Object} mail The mail message object.
     * @param {String} htmlFile Path to the html template.
     * @param {String} txtFile Path to the text template.
     * @param {Object} replaceValues An array with key value objects to replace dynamic content.
     * @param {function} callback The callback function.
     */
    pub.sendMailFromTemplate = function (mail, htmlFile, txtFile, replaceValues, callback) {
        //var mailMessage = configureMail(mail, config);
        configureMail(mail, config);

        // add html to text compiler
        if (mail.html) {
            var htmlToText = require('nodemailer-html-to-text').htmlToText;
            transport.use('compile', htmlToText());
        }

        async.auto({
            readHtmlFile: function (next) {
                if (!htmlFile) {
                    next(null, '');
                } else {
                    fs.readFile(path.resolve(config.templatePath, htmlFile), {encoding: 'utf8'}, next);
                }
            },
            readTextFile: function (next) {
                if (!txtFile) {
                    next(null, '');
                } else {
                    fs.readFile(path.resolve(config.templatePath, txtFile), {encoding: 'utf8'}, next);
                }
            },
            sendMail: ['readHtmlFile', 'readTextFile', function (next, innerResults) {
                if (replaceValues) {
                    for (var i = 0; i < replaceValues.length; i++) {
                        var item = replaceValues[i];
                        innerResults.readHtmlFile = innerResults.readHtmlFile.replace(new RegExp(item.key, 'g'), item.value || '');
                        innerResults.readTextFile = innerResults.readTextFile.replace(new RegExp(item.key, 'g'), item.value || '');
                    }
                }

                mail.html = innerResults.readHtmlFile;
                mail.text = innerResults.readTextFile;

                debug('Send mail from template', mail);

                transport.sendMail(mail, next);
            }]
        }, function (error, results) {
            callback(error, results.sendMail);
        });
    };

    return pub;
};
