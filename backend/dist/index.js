"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _app = require('./app');

const app = new (0, _app.App)();
app.getApp();
 const redisClient = app.getRedisClient(); exports.redisClient = redisClient;