'use strict';

var crypto = require('crypto');
var lxHelpers = require('lx-helpers');

/**
 * The crypto module.
 *
 * @return {Object} An object with methods for cryptographic functions.
 */
module.exports = function () {

    var self = {};
    var saltLen = 64;
    var iterations = 1000;
    var keyLen = 128;

    /**
     * Generates a hash with a random salt.
     *
     * @param {String} password The password to be hashed.
     * @param {Function} callback The callback function.
     */
    self.hashWithRandomSalt = function (password, callback) {
        if (!lxHelpers.isString(password)) {
            return callback(lxHelpers.getTypeError('password', password, ''));
        }

        var data = {};
        crypto.randomBytes(saltLen, function (error, buffer) {
            if (error) {
                return callback(error);
            }

            data.salt = buffer.toString('hex');

            crypto.pbkdf2(password, data.salt, iterations, keyLen, 'sha1', function (error, encodedPassword) {
                if (error) {
                    return callback(error);
                }

                data.password = encodedPassword.toString('hex');
                callback(error, data);
            });
        });
    };

    /**
     * Generates cryptographically strong pseudo-random data.
     *
     * @param {Number} length The length for the salt.
     * @param {Function} callback The callback function.
     */
    self.randomBytes = function (length, callback) {
        try {
            crypto.randomBytes(length, callback);
        } catch (e) {
            callback(e);
        }
    };

    self.randomString = function (length, callback) {
        try {
            crypto.randomBytes(length, function (error, buffer) {
                callback(error, buffer.toString('base64'));
            });
        } catch (e) {
            callback(e);
        }
    };

    /**
     * Compares cryptographically strong pseudo-random data.
     *
     * @param {String} plain Data to compare.
     * @param {String} hash Data to be compared to.
     * @param {String} salt Hash for data to be compared to.
     * @param {Function} callback The callback function.
     */
    self.compare = function (plain, hash, salt, callback) {
        if (!lxHelpers.isString(plain)) {
            return callback(lxHelpers.getTypeError('plain', plain, ''));
        }

        if (!lxHelpers.isString(salt)) {
            return callback(lxHelpers.getTypeError('salt', salt, ''));
        }

        crypto.pbkdf2(plain, salt, iterations, keyLen, 'sha1', function (error, encodedPassword) {
            if (error) {
                return callback(error);
            }

            var hashToCompare = encodedPassword.toString('hex');

            callback(null, {is_equal: hash === hashToCompare});
        });
    };

    return self;
};
