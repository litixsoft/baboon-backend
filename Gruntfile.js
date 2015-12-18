'use strict';

var path = require('path');
var grunt = require('grunt');

/**
 * Gets the index.html file from the code coverage folder.
 *
 * @param {!string} folder The path to the code coverage folder.
 * @returns {string} The path to the index.html file
 */
function getCoverageReport (folder) {
    var reports = grunt.file.expand(folder + '*/index.html');

    if (reports && reports.length > 0) {
        return reports[0];
    }

    return '';
}

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    grunt.initConfig({

        // Set paths
        src: {
            reports: './build/reports',
            test: './test',
            api: './api',
            lib: './lib',
            server: './server',
            lint: [
                'api/**/*.js',
                'lib/**/*.js',
                'server/**/*.js',
                'test/**/*.js',
                'Gruntfile.js',
                'baboon-backend.js',
                'validate-commit-msg.js'
            ]
        },

        // Clean before build
        clean: {
            reports: {
                src: ['<%= src.reports %>']
            },
            coverage: {
                src: ['<%= src.reports %>/coverage']
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        eslint: {
            all: {
                src: '<%= src.lint %>'
            },
            jslint: {
                options: {
                    format: 'jslint-xml',
                    outputFile: '<%= src.reports %>/lint/eslint.xml'
                },
                files: {
                    src: '<%= src.lint %>'
                }
            },
            checkstyle: {
                options: {
                    format: 'checkstyle',
                    outputFile: '<%= src.reports %>/lint/eslint_checkstyle.xml'
                },
                files: {
                    src: '<%= src.lint %>'
                }
            }
        },

        // open browser
        open: {
            coverage: {
                path: function () {
                    return path.join(__dirname, getCoverageReport('build/reports/coverage/'));
                }
            },
            inspector: {
                path: 'http://localhost:8080/debug?port=5858'
            }
        },

        concurrent: {
            debug: {
                tasks: [
                    'nodemon:debug',
                    'node-inspector'
                ],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        // Debugging with node inspector
        'node-inspector': {
            custom: {
                options: {
                    'web-host': 'localhost'
                }
            }
        },

        // Use nodemon to run server in debug mode with an initial breakpoint
        nodemon: {
            debug: {
                script: 'baboon-backend.js',
                options: {
                    nodeArgs: ['--debug-brk'],
                    env: {
                        DEBUG: '*',
                        PORT: 8081,
                        HOST: '127.0.0.1',
                        NODE_ENV: 'development'
                    },
                    callback: function (nodemon) {
                        nodemon.on('log', function (event) {
                            console.log(event.colour);
                        });

                        // opens browser on initial server start
                        nodemon.on('config:update', function () {
                            setTimeout(function () {
                                require('open')('http://localhost:8080/debug?port=5858');
                            }, 500);
                        });
                    }
                }
            },
            dev: {
                script: 'baboon-backend.js',
                options: {
                    env: {
                        DEBUG: '*',
                        PORT: 8081,
                        HOST: 'localhost',
                        NODE_ENV: 'development'
                    },
                    callback: function (nodemon) {
                        nodemon.on('log', function (event) {
                            console.log(event.colour);
                        });
                    },
                    watch: ['api/**/*.js', 'lib/*.js', 'server/*.js', 'Gruntfile.js']
                }
            }
        },

        // Shell commands for jasmine, coverage, reports and tests
        shell: {
            coverage: {
                command: 'node node_modules/istanbul/lib/cli.js cover --dir build/reports/coverage node_modules/jasmine-node/bin/jasmine-node -- test/ --forceexit',
                options: {
                    async: false
                }
            },
            cobertura: {
                command: 'node node_modules/istanbul/lib/cli.js report --root build/reports/coverage --dir build/reports/coverage cobertura',
                options: {
                    async: false
                }
            }
        },
        jasmine_node: {
            options: {
                forceExit: true,
                match: '.',
                matchall: false,
                extensions: 'js',
                specNameMatcher: 'spec'
            },
            unit: ['test/api/'],
            regApi: ['test/regressions/'],
            all: ['test/'],
            ci: {
                options: {
                    jUnit: {
                        report: true,
                        savePath: '<%= src.reports %>/jasmine/',
                        useDotNotation: true,
                        consolidate: true
                    }
                },
                src: ['test/']
            }
        },
        conventionalChangelog: {
            options: {
                changelogOpts: {
                    preset: 'angular'
                }
            },
            release: {
                src: 'CHANGELOG.md'
            }
        },
        bump: {
            options: {
                commitFiles: ['.'],
                commitMessage: 'chore: release v%VERSION%',
                files: ['package.json'],
                push: false
            }
        }
    });

    /**
     * Serve tasks
     *
     * Task serve start server and watch
     * Task serve:debug start server in debug mode open node-inspector
     */
    grunt.registerTask('serve', function (target) {

        if (target === 'debug') {
            return grunt.task.run(['concurrent:debug']);
        }

        grunt.task.run(['nodemon:dev']);
    });

    /**
     * Test tasks
     *
     * Task test start eslint and all jasmine tests
     * Task test:eslint start only eslint tests
     * Task test:unit start only unit tests
     * Task test:regApi start only regression api tests
     */
    grunt.registerTask('test', function (target) {

        // Task test:eslint
        if (target === 'eslint') {
            return grunt.task.run(['eslint:all']);
        }

        // Task test:unit
        if (target === 'unit') {
            return grunt.task.run(['jasmine_node:unit']);
        }

        // Task test:unit
        if (target === 'regApi') {
            return grunt.task.run(['jasmine_node:regApi']);
        }

        // Task test
        grunt.task.run(['eslint:all', 'jasmine_node:all']);
    });

    /**
     * Coverage for tests
     */
    grunt.registerTask('cover', [
        'clean:coverage',
        'shell:coverage',
        'shell:cobertura',
        'open:coverage'
    ]);

    /**
     * Task for continuous integration server process
     * Reports save in build/reports
     */
    grunt.registerTask('ci', [
        'clean:reports',
        'eslint:jslint',
        'eslint:checkstyle',
        'jasmine_node:ci',
        'shell:coverage',
        'shell:cobertura'
    ]);

    /**
     * Task for check git commit message format
     */
    grunt.registerTask('git:commitHook', 'Install git commit hook', function () {
        grunt.file.copy('validate-commit-msg.js', '.git/hooks/commit-msg');
        require('fs').chmodSync('.git/hooks/commit-msg', '0755');
        grunt.log.ok('Registered git hook: commit-msg');
    });

    /**
     * Task for publish release
     * Update version in package.json, update CHANGELOG.md, tag version and commit
     */
    grunt.registerTask('release', 'Bump version, update changelog and tag version', function (version) {
        grunt.task.run([
            'bump:' + (version || 'patch') + ':bump-only',
            'conventionalChangelog:release',
            'bump-commit'
        ]);
    });

    grunt.registerTask('default', 'test');
};
