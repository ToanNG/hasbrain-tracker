'use strict';

let env = require('./env');
require('babel-core/register');
require(env[process.env.NODE_ENV].serverScript);
