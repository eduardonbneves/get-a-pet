import { Router } from 'express';

import PetController from '../controllers/PetController';
import { authUserByToken } from '../helpers/auth-user-by-token';
import imageUpload from '../helpers/image-upload';

const router = Router();

router.post('/create', authUserByToken, imageUpload.array('images'), PetController.create);
router.get('/', PetController.getAll);

export default router;