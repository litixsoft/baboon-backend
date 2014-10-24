'use strict';

var crypto = require('crypto');

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
        var data = {};
        crypto.randomBytes(saltLen, function (error, buffer) {
            if (error) {
                callback(error);
                return;
            }

            data.salt = buffer.toString('hex');

            crypto.pbkdf2(password, data.salt, iterations, keyLen, function (error, encodedPassword) {
                if (error) {
                    callback(error);
                    return;
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
        crypto.randomBytes(length, callback);
    };

    self.randomString = function(length, callback) {
        crypto.randomBytes(length, function(error, buffer) {
            callback(error, buffer.toString('base64'));
        });
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
        crypto.pbkdf2(plain, salt, iterations, keyLen, function (error, encodedPassword) {
            if (error) {
                callback(error);
                return;
            }

            var hashToCompare = encodedPassword.toString('hex');

            callback(null, { is_equal: hash === hashToCompare });
        });
    };

    return self;
};
