# baboon-backend
> REST and Socket.io API backend server, based on NodeJS and ExpressJS.

> [![npm](http://img.shields.io/npm/v/baboon-backend.svg)](https://www.npmjs.org/package/baboon-backend)
[![Build Status](https://secure.travis-ci.org/litixsoft/baboon-backend.svg?branch=0.10.0_unstable)](https://travis-ci.org/litixsoft/baboon-backend) 
[![david-dm](https://david-dm.org/litixsoft/baboon-backend.svg?theme=shields.io)](https://david-dm.org/litixsoft/baboon-backend/) 
[![david-dm](https://david-dm.org/litixsoft/baboon-backend/dev-status.svg?theme=shields.io)](https://david-dm.org/litixsoft/baboon-backend#info=devDependencies&view=table)


    Baboon-Backend 0.10.X works only with Node 10.X.X. Just bug fixing, No new features :-( .

Baboon backend server is a toolkit to create backends on the basis of NodeJS and ExpressJS with an API which can be accessed via REST and WebSocket.
The toolkit is independent of any front-end and can be developed separately. The application structure is already set and ready to run. 

With the help of the features in the toolkit and the generator-baboon-backend you can develop your backend functionality in record time.
Especially helpful in development mode is the live-reload, and the already built-in test suite.

Baboon backend is completely open source and available under the MIT license. If you need commercial support, you send an email to us. [support@litixsoft.de](mailto:support@litixsoft.de)

* Issues: https://github.com/litixsoft/baboon-backend/issues

## Features
* Complete Application Structure 
* Ready to run
* Create API with simple controllers 
* Call controller via REST and WebSocket
* Controller can be nested in modules structure
* Application can monitor changes in the development mode and self-reload. (livereload)
* Application is easy to test
* Test Suite jasmine-node integrated
* High test coverage with regression tests
* MongoDB integration with lxMongoDb or native driver
* Coverage reports integrated
* Grunt with development, test and report tasks

## Installation 
There are several ways to install Baboon backend and use. 
This project is a reference implementation and can be used as a template for your own project. More you can find already under [Contributing and testing](#Contributing)

### We recommend the Generator for baboon-backend
We recommend the [generator-baboon-backend](https://github.com/litixsoft/generator-baboon-backend) for the creation of a project. The installation is very easy.

Install global dependencies yeoman and grunt-cli

    $ sudo npm install -g yo grunt-cli
    
Install generator-baboon-backend as global module from npm

    $ sudo npm install -g generator-baboon-backend
    
Finally, create a project directory and initiate the generator

    $ mkdir my-project && cd my-project    
    $ yo baboon-backend
    
Follow the instructions of the generator and Yeoman create your application.

You can run the application in live-reload mode with:

    $ grunt serve
    
Or Manual without live-reload with:

    $ npm start
    
Debug your application with:
    
    $ grunt debug
    
Test your application (unit tests and jshint) with:

    $ grunt test   
    
Only unit tests without jshint:

    $grunt jasmine
    
Coverage your tests with:

    $grunt cover
    
Reports of your tests and coverage for ci systems with:

    $grunt reports
    
Release a new patch with:

    $ grunt release

Release a new minor version with:

    $ grunt release:minor

Release a new major version with:

    $ grunt release:major
    
Another possibility is to only use the library.   
If you only want to use the library in your own application design, it is enough just to install this

    $ npm install baboon-backend
    
But remember that you will receive nothing more than the library. Everything else you must implement yourself.

## <a name="Contributing"></a>Contributing and testing 
Use the reference application as seed for your project or help the project expand.
The following instructions describe how to install the reference application. 
If you would like to participate in the project, note the advice of the coverage and the examples.

### Install global dependencies

    $ npm install -g grunt-cli 
    
### Install reference application

    $ git clone https://github.com/litixsoft/baboon-backend.git
    $ cd baboon-backend
    $ npm install
    
### Run and test reference application
### Run
Start the application with Live reload. Very helpful during development. The configuration of the command can be set in the Gruntfile.js/nodemon/dev.

    $ grunt serve
    
Start the application without Live reload. The configuration of the command can be set in the package.json/scripts/start.

    $npm start

Start the application manually without live reload. Note here the environment variables.
This command is run in the background when npm start

    $ DEBUG=* PORT=3000 HOST=localhost NODE_ENV=development CONFIG=test PROTOCOL=http node baboon-backend.js
    
### Debug
We debug the application frequently about our WebStorm IDE. But you can also debug your app with nodemon and node-inspector.

    $ grunt debug
    
### Testing
#### Run jshint
Only jshint, no unit tests

    $ grunt jshint

#### Run unit tests
Only unit tests, no jshint.

    $ grunt jasmine

#### Run all tests
Complete testing the application with unit tests and jshint.
    
    $ grunt test
    
#### Run code coverage
    
    $ grunt cover
    
#### Run all tests with reports for ci systems
    
    $ grunt reports

Instead of us handing out a formal style guide, simply stick to the existing programming style. Please create descriptive commit messages.
We use a git hook to validate the commit messages against these [rules](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#heading=h.uyo6cb12dt6w).
Easily expand Baboon with your own extensions or changes in the functionality of Baboon itself. Use this workflow:

1. Write your functionality
2. Create an example of your functionality in the reference application (optional)
3. Write unit and regression tests for the example
4. All tests should be successful
5. Check your test coverage (90 - 100%)
6. Make a pull request

We will check the tests, the example and test coverage. In case your changes are useful and well tested, we will merge your requests.

### Release a new version
We use [grunt-bump](https://github.com/vojtajina/grunt-bump) and [grunt-conventional-changelog](https://github.com/btford/grunt-conventional-changelog) internally to manage our releases.
To handle the workflow, we created a grunt task `release`. This happens:

* Bump version in package.json
* Update the CHANGELOG.md file
* Commit in git with message "chore: release v[`the new version number`]"
* Create a git tag v[`the new version number`]

#### Create a new release
Release a new patch

    $ grunt release

Release a new minor version

    $ grunt release:minor

Release a new major version

    $ grunt release:major

## [CHANGELOG](./CHANGELOG.md)

## Roadmap
Baboon backend is a rolling release and is constantly evolving. Roadmap we list the features that will be integrated next.

* Extension of system configuration 
* In addition to debug even a logger for console, file and database 
* Based on an audit logger system
* Login and user management. 
* Rights management and protection of REST and WebSocket API

# Author
[Litixsoft GmbH](http://www.litixsoft.de)

### License
Copyright (c) 2014-2018 Litixsoft GmbH Licensed under the MIT license.
