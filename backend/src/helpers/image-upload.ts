import multer from 'multer';
import path from 'path';

const imageStorage = multer.diskStorage({
	destination: (req, _, cb) => {

		let folder = '';

		if (req.baseUrl.includes('users'))
			folder = 'users';
		else
		if (req.baseUrl.includes('pets'))
			folder = 'pets';

		cb(null, process.env.IMAGES_DIR as string + folder);
	},
	filename: (_, file, cb) => {
		cb(null, Date.now() + String(Math.floor(Math.random() * 1000)) + path.extname(file.originalname));
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