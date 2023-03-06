import fs from 'fs';
import multer from 'multer';
import path from 'path';

const imageStorage = multer.diskStorage({
	destination: (req, _, cb) => {

		let folder = '';

		if (req.baseUrl.includes('users')) {

			folder = path.join(process.env.IMAGES_DIR as string, 'users/', req.userId as string);

			if (!fs.existsSync(folder)) {
				fs.mkdirSync(folder, { recursive: true });
			}

			cb(null, folder);

		} else {
			if (req.baseUrl.includes('pets')) {
				folder = 'pets';
				cb(null, process.env.IMAGES_DIR as string + folder);
			}
		}

	},
	filename: (req, file, cb) => {

		cb(null, `${req.userId}.${Date.now()}.${req.uuid}.${String(Math.floor(Math.random() * 1000)) + path.extname(file.originalname)}`);
	}
});

const imageUpload = multer({
	storage: imageStorage,
	fileFilter(_, file, cb) {
		if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
			return cb(new Error('Please, send just PNG|JPG|JPEG image file'));
		}
		cb(null, true);
	}
});

export default imageUpload;