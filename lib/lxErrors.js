'use strict';

var util = require('util');

/**
 * Creates a new AccessError.
 * @constructor
 */
var AccessError = function (message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = 'AccessError';
    this.message = message || '403: Forbidden';
    this.status = 403;
};

/**
 * Creates a new AuthError.
 * @constructor
 */
var AuthError = function (message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = 'AuthError';
    this.message = message || '401: Unauthorized';
    this.status = 401;
};

/**
 * Creates a new BadRequestError.
 * @constructor
 */
var BadRequestError = function (message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = 'BadRequestError';
    this.message = message || '400: Bad request';
    this.status = 400;
};

/**
 * Creates a new ValidationError.
 * @constructor
 *
 * @param {?array} errors
 */
var ValidationError = function (errors) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = 'ValidationError'; //set our function’s name as error name.
    this.message = '422: Unprocessable Entity';
    this.status = 422;
    this.errors = errors || [];
};

// inherit from Error
util.inherits(AccessError, Error);
util.inherits(AuthError, Error);
util.inherits(BadRequestError, Error);
util.inherits(ValidationError, Error);

exports.AccessError = AccessError;
exports.AuthError = AuthError;
exports.BadRequestError = AuthError;
exports.ValidationError = ValidationError;
