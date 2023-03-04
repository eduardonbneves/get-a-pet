import { Router } from 'express';

import PetController from '../controllers/PetController';
import { authUserByToken } from '../helpers/auth-user-by-token';
import imageUpload from '../helpers/image-upload';
import { rateLimiter } from '../helpers/rate-limiter';

const router = Router();

router.post('/create', authUserByToken, PetController.create);

export default router;