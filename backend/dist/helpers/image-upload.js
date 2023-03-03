"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _multer = require('multer'); var _multer2 = _interopRequireDefault(_multer);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);

const imageStorage = _multer2.default.diskStorage({
	destination: (req, _, cb) => {

		let folder = '';

		if (req.baseUrl.includes('users'))
			folder = 'users';
		else
		if (req.baseUrl.includes('pets'))
			folder = 'pets';

		cb(null, process.env.IMAGES_DIR  + folder);
	},
	filename: (_, file, cb) => {
		cb(null, Date.now() + _path2.default.extname(file.originalname));
	}
});

const imageUpload = _multer2.default.call(void 0, {
	storage: imageStorage,
	fileFilter(_, file, cb) {
		if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
			return cb(new Error('Please, send just PNG|JPG|JPEG image file'));
		}
		cb(null, true);
	}
});

exports. default = imageUpload;