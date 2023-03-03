"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _pino = require('pino'); var _pino2 = _interopRequireDefault(_pino);

exports. default = _pino2.default.call(void 0, {
	level: 'info',
	transport: {
		target: 'pino-pretty'
	}
});