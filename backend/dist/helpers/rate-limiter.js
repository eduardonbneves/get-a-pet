"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _expressratelimit = require('express-rate-limit'); var _expressratelimit2 = _interopRequireDefault(_expressratelimit);
var _ratelimitredis = require('rate-limit-redis'); var _ratelimitredis2 = _interopRequireDefault(_ratelimitredis);
var _redis = require('redis');

const client = _redis.createClient.call(void 0, {
	url: process.env.REDIS_URL || 'redis://localhost:6379',
	name: 'rate-limiter',
	database: 1
});

client.connect();

 const rateLimiter = _expressratelimit2.default.call(void 0, {
	windowMs: 60 * 1000, // 1 minute
	max: 5, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	handler: (req, res, next, options) =>
		res.status(options.statusCode).json({ message: options.message }),
	store: new (0, _ratelimitredis2.default)({
		prefix: 'rate-limit:',
		sendCommand: (...args) => client.sendCommand(args)
	})
}); exports.rateLimiter = rateLimiter;