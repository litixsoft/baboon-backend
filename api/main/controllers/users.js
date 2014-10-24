'use strict';

/**
 * Users controller
 *
 * @returns {{}}
 */
module.exports = function (injects) {

    var self = {};
    var db = injects.db;
    var users = db.connection('bbTest').collection('users');

    /**
     * Get all users from db
     *
     * @param req
     * @param res
     * @param next
     */
    self.getAll = function getAll(req, res, next) {
        users.find({}).toArray(function (err, success) {

            if (success) {
                return res.status(200).json(success);
            }

            err = err || new Error('Unknown db error by users.find');
            err.status = 400;
            return next(err);
        });
    };

    /**
     * Get user by id from db
     *
     * @param req
     * @param res
     * @param next
     */
    self.getById = function getById(req, res, next) {
        if (!req.params || !req.params.id) {

            var err = new Error('Missing req.params or req.params.id');
            err.status = 400;
            return next(err);
        }

        var id = db.convertToMongoId(req.params.id);
        users.find({_id: id}).toArray(function (err, success) {

            if (success) {
                return res.status(200).json(success);
            }

            err = err || new Error('Unknown db error by users.find');
            err.status = 400;

            return next(err);
        });
    };

    return self;
};
