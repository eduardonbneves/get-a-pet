import { Router } from 'express';

import PetController from '../controllers/PetController';
import { addUuidToRequest } from '../helpers/add-uuid-to-request';
import { authUserByToken } from '../helpers/auth-user-by-token';
import imageUpload from '../helpers/image-upload';

const router = Router();

router.post('/create', authUserByToken, addUuidToRequest, imageUpload.array('images'), PetController.create);
router.get('/my_pets', authUserByToken, PetController.getAllUserPets);
router.get('/my_adoptions', authUserByToken, PetController.getAllUserAdoptions);
router.get('/:id', PetController.getPetById);
router.delete('/:id', authUserByToken, PetController.removePetById);
router.patch('/:id', authUserByToken, addUuidToRequest, imageUpload.array('images'), PetController.editPet);
router.patch('/schedule/:id', authUserByToken, PetController.schedule);
router.patch('/conclude/:id', authUserByToken, PetController.concludeAdoption);
router.get('/', PetController.getAll);

export default router;