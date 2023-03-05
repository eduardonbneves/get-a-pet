import { Request, Response } from 'express';

import { redisClient } from '..';

import getUserByToken from '../helpers/get-user-by-token';
import logger from '../helpers/logger';
import { validatePetFields } from '../helpers/validate-pet-fields';
import Pet, { PetInterface } from '../models/Pet';

class PetController {

	public async create(req: Request, res: Response): Promise<Response> {

		// apagar fotos dos pets quando der erro

		//e

		// add redis na consulta

		const pet = {
			name: req.body.name,
			birthdate: req.body.birthdate,
			weight: req.body.weight,
			color: req.body.color,
			images: req.files
		};

		const available = true;

		// validations
		const errorResponse = await validatePetFields(pet) as [];

		if (errorResponse.length !== 0) {
			return res.status(422).json({ errors: errorResponse });
		}

		// get pet owner
		const user = await getUserByToken(req.headers.authorization as string);


		const imagesBody= pet.images as [];
		const imagesToBD: string[] = [];

		imagesBody.map((image: Express.Multer.File) => {
			imagesToBD.push(image.filename);
		});

		try {

			const newPet = await new Pet({
				name: req.body.name,
				birthdate: req.body.birthdate,
				weight: req.body.weight,
				color: req.body.color,
				images: imagesToBD,
				available: available,
				user: {
					_id: user._id,
					name: user.name,
					phone: user.phone,
					email: user.email,
					image: user.image
				}
			}).save();

			return res.status(201).json({
				message: 'Pet successfully created',
				pet: newPet
			});
		} catch (error) {
			logger.error(error);
			return res.status(500).json({ message: 'Error creating pet' });
		}

	}

	public async getAll(req: Request, res: Response): Promise<Response> {

		const pets = await Pet.find().sort('-createdAt');

		return res.status(200).json({ pets: pets });
	}
}

export default new PetController();