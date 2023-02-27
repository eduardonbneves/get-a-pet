'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}
var _dotenv = require('dotenv');
var _dotenv2 = _interopRequireDefault(_dotenv);
var _express = require('express');
var _express2 = _interopRequireDefault(_express);
var _cors = require('cors');
var _cors2 = _interopRequireDefault(_cors);
var _mongoose = require('mongoose');
var _mongoose2 = _interopRequireDefault(_mongoose);
var _helmet = require('helmet');
var _helmet2 = _interopRequireDefault(_helmet);

var _userRoutes = require('./routes/userRoutes');
var _userRoutes2 = _interopRequireDefault(_userRoutes);

_dotenv2.default.config();

class App {
	__init() {
		this.port = process.env.PORT || 3333;
	}

	constructor() {
		App.prototype.__init.call(this);
		this.express = _express2.default.call(void 0);
		this.middlewares();
		this.routes();
		this.database();
		this.listen();
	}

	middlewares() {
		this.express.use(_express2.default.json());
		this.express.use(
			_cors2.default.call(void 0, {
				credentials: true,
				origin: 'http://localhost:3000',
			})
		);
		this.express.use(_helmet2.default.call(void 0));
	}

	routes() {
		this.express.use('/users', _userRoutes2.default);
		this.express.use((_, res) => {
			return res.status(404).send('Route not found');
		});
	}

	async database() {
		try {
			_mongoose2.default.set('strictQuery', false);
			await _mongoose2.default.connect(process.env.MONGOOSE_URI);
			console.log('Connected to MongoDB');
		} catch (error) {
			console.error(error);
		}
	}

	getApp() {
		return this.express;
	}

	listen() {
		this.express.listen(this.port, () => {
			console.log(`API listening on port ${this.port}`);
		});
	}
}
exports.default = App;
