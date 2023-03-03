"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _compression = require('compression'); var _compression2 = _interopRequireDefault(_compression);
var _cors = require('cors'); var _cors2 = _interopRequireDefault(_cors);

var _dotenv = require('dotenv'); var _dotenv2 = _interopRequireDefault(_dotenv);
var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _helmet = require('helmet'); var _helmet2 = _interopRequireDefault(_helmet);
var _mongoose = require('mongoose'); var _mongoose2 = _interopRequireDefault(_mongoose);
var _redis = require('redis');
var _swaggeruiexpress = require('swagger-ui-express'); var _swaggeruiexpress2 = _interopRequireDefault(_swaggeruiexpress);

var _checkenv = require('./helpers/check-env'); var _checkenv2 = _interopRequireDefault(_checkenv);
var _logger = require('./helpers/logger'); var _logger2 = _interopRequireDefault(_logger);
var _userRoutes = require('./routes/userRoutes'); var _userRoutes2 = _interopRequireDefault(_userRoutes);
var _swaggerjson = require('./swagger.json'); var _swaggerjson2 = _interopRequireDefault(_swaggerjson);

_dotenv2.default.config();
_checkenv2.default.call(void 0, );

 class App {
	
	 __init() {this.port = process.env.NODE_PORT|| 3333}
	

	constructor() {;App.prototype.__init.call(this);
		this.express = _express2.default.call(void 0, );
		this.redisClient = _redis.createClient.call(void 0, {
			url: process.env.REDIS_URL || 'redis://localhost:6379',
			name: 'refresh-token'
		});
		this.redis();
		this.database();
		this.middlewares();
		this.routes();
		this.listen();
	}

	 middlewares() {
		this.express.use(_helmet2.default.call(void 0, ));
		this.express.use(_cors2.default.call(void 0, { credentials: true, origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
		this.express.use(_compression2.default.call(void 0, ));
		this.express.use(_express2.default.urlencoded({ extended: true }));
		this.express.use(_express2.default.json());
		this.express.use('/api-docs', _swaggeruiexpress2.default.serve, _swaggeruiexpress2.default.setup(_swaggerjson2.default));
	}

	 routes() {
		this.express.use('/users', _userRoutes2.default);
		this.express.use((_, res) => {
			return res.status(404).json({ message: 'Route not found' });
		});
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		this.express.use((error, _, res, next) => {
			_logger2.default.error(error);
			return res.status(500).json({ message: error.message });
		});
	}

	 async redis() {
		try {
			await this.redisClient.connect();
			_logger2.default.info('Connected to Redis');
		} catch (error) {
			_logger2.default.error(error);
			process.exit(1);
		}
	}

	 async database() {
		try {
			_mongoose2.default.set('strictQuery', false);
			await _mongoose2.default.connect(process.env.MONGO_URI );
			_logger2.default.info('Connected to MongoDB');
		} catch (error) {
			_logger2.default.error(error);
			process.exit(1);
		}
	}


	 async listen() {
		try {
			this.express.listen(this.port, () => {
				_logger2.default.info(`API listening on port ${this.port}`);
			});
		} catch (error) {
			_logger2.default.error(error);
		}

	}

	 getRedisClient() {
		return this.redisClient;
	}

	 getApp() {
		return this.express;
	}

} exports.App = App;