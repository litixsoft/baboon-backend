'use strict';

var sut = require('../../lib/LxCrypto')();

describe('LxCrypto', function () {
    describe('.hashWithRandomSalt()', function () {
        it('should hash the password', function (done) {
            sut.hashWithRandomSalt('test', function (err, res) {
                expect(err).toBeNull();
                expect(res.salt).toBeDefined();
                expect(typeof res.salt).toBe('string');
                expect(res.salt.length).toBeGreaterThan(0);
                expect(res.password).toBeDefined();
                expect(typeof res.password).toBe('string');
                expect(res.password.length).toBeGreaterThan(0);
                expect(res.password === 'test').toBeFalsy();

                done();
            });
        });

        it('should return an error when the password is a number', function (done) {
            sut.hashWithRandomSalt(123, function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toBe('Param "password" is of type number! Type string expected');
                expect(res).toBeUndefined();

                done();
            });
        });

        it('should return an error when the password is null', function (done) {
            sut.hashWithRandomSalt(null, function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toBe('Param "password" is of type null! Type string expected');
                expect(res).toBeUndefined();

                done();
            });
        });

        it('should return an error when the password is undefined', function (done) {
            sut.hashWithRandomSalt(null, function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toBe('Param "password" is of type null! Type string expected');
                expect(res).toBeUndefined();

                done();
            });
        });
    });

    describe('.randomBytes()', function () {
        it('should create random bytes', function () {
            sut.randomBytes(10, function (err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                expect(typeof res).toBe('object');
            });
        });

        it('should return an error when param length is a string', function () {
            sut.randomBytes('dd', function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toContain('number');
                expect(res).toBeUndefined();
            });
        });

        it('should return an error when param length is a string', function () {
            sut.randomBytes('10', function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toContain('number');
                expect(res).toBeUndefined();
            });
        });

        it('should return an error when param length is null', function () {
            sut.randomBytes(null, function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toContain('number');
                expect(res).toBeUndefined();
            });
        });

        it('should return an error when param length is undefined', function () {
            sut.randomBytes(null, function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toContain('number');
                expect(res).toBeUndefined();
            });
        });

        it('should return an error when param length is an object', function () {
            sut.randomBytes({}, function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toContain('number');
                expect(res).toBeUndefined();
            });
        });
    });

    describe('.randomString()', function () {
        it('should create a random string', function () {
            sut.randomString(10, function (err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                expect(typeof res).toBe('string');
            });
        });

        it('should return an error when param length is a string', function () {
            sut.randomString('dd', function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toContain('number');
                expect(res).toBeUndefined();
            });
        });

        it('should return an error when param length is a string', function () {
            sut.randomString('10', function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toContain('number');
                expect(res).toBeUndefined();
            });
        });

        it('should return an error when param length is null', function () {
            sut.randomString(null, function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toContain('number');
                expect(res).toBeUndefined();
            });
        });

        it('should return an error when param length is undefined', function () {
            sut.randomString(null, function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toContain('number');
                expect(res).toBeUndefined();
            });
        });

        it('should return an error when param length is an object', function () {
            sut.randomString({}, function (err, res) {
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toContain('number');
                expect(res).toBeUndefined();
            });
        });
    });

    describe('.compare()', function () {
        it('should compare a password with a hash', function (done) {
            sut.hashWithRandomSalt('test', function (err, res) {
                expect(err).toBeNull();
                expect(res.salt).toBeDefined();
                expect(res.password).toBeDefined();
                expect(res.password === 'test').toBeFalsy();

                sut.compare('test', res.password, res.salt, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({ is_equal: true });

                    done();
                });
            });
        });

        it('should return false when the password is wrong', function (done) {
            sut.hashWithRandomSalt('test', function (err, res) {
                expect(err).toBeNull();
                expect(res.salt).toBeDefined();
                expect(res.password).toBeDefined();
                expect(res.password === 'test').toBeFalsy();

                sut.compare('abc', res.password, res.salt, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({ is_equal: false });

                    done();
                });
            });
        });

        it('should return false when the password is empty', function (done) {
            sut.hashWithRandomSalt('test', function (err, res) {
                expect(err).toBeNull();
                expect(res.salt).toBeDefined();
                expect(res.password).toBeDefined();
                expect(res.password === 'test').toBeFalsy();

                sut.compare('', res.password, res.salt, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({ is_equal: false });

                    done();
                });
            });
        });

        it('should return false when the password is a number', function (done) {
            sut.hashWithRandomSalt('test', function (err, res) {
                expect(err).toBeNull();
                expect(res.salt).toBeDefined();
                expect(res.password).toBeDefined();
                expect(res.password === 'test').toBeFalsy();

                sut.compare(123, res.password, res.salt, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param "plain" is of type number! Type string expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });
        });

        it('should return false when the password is null', function (done) {
            sut.hashWithRandomSalt('test', function (err, res) {
                expect(err).toBeNull();
                expect(res.salt).toBeDefined();
                expect(res.password).toBeDefined();
                expect(res.password === 'test').toBeFalsy();

                sut.compare(null, res.password, res.salt, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param "plain" is of type null! Type string expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });
        });

        it('should return false when the password is undefined', function (done) {
            sut.hashWithRandomSalt('test', function (err, res) {
                expect(err).toBeNull();
                expect(res.salt).toBeDefined();
                expect(res.password).toBeDefined();
                expect(res.password === 'test').toBeFalsy();

                sut.compare(null, res.password, res.salt, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param "plain" is of type null! Type string expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });
        });

        it('should return false when the salt is a number', function (done) {
            sut.hashWithRandomSalt('test', function (err, res) {
                expect(err).toBeNull();
                expect(res.salt).toBeDefined();
                expect(res.password).toBeDefined();
                expect(res.password === 'test').toBeFalsy();

                sut.compare('test', res.password, 123, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param "salt" is of type number! Type string expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });
        });

        it('should return false when the salt is a null', function (done) {
            sut.hashWithRandomSalt('test', function (err, res) {
                expect(err).toBeNull();
                expect(res.salt).toBeDefined();
                expect(res.password).toBeDefined();
                expect(res.password === 'test').toBeFalsy();

                sut.compare('test', res.password, null, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param "salt" is of type null! Type string expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });
        });

        it('should return false when the salt is a null', function (done) {
            sut.hashWithRandomSalt('test', function (err, res) {
                expect(err).toBeNull();
                expect(res.salt).toBeDefined();
                expect(res.password).toBeDefined();
                expect(res.password === 'test').toBeFalsy();

                sut.compare('test', res.password, null, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param "salt" is of type null! Type string expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });
        });
    });
});
