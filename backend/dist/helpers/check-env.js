"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _logger = require('./logger'); var _logger2 = _interopRequireDefault(_logger);

 function checkEnv() {
	const requiredEnvs = [
		'MONGO_URI',
		'JWT_SECRET'
	];
	const emptyEnvs = [];

	for (const env of requiredEnvs) {
		if (!process.env[env]) {
			_logger2.default.error(`${env} environment variable not set`);
			emptyEnvs.push(env);
		}
	}

	if (emptyEnvs.length > 0) {
		process.exit(1);
	}
} exports.default = checkEnv;