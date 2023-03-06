import { Request, Response } from 'express';

import { redisClient } from '..';

import getUserByToken from '../helpers/get-user-by-token';
import logger from '../helpers/logger';
import { validatePetFields } from '../helpers/validate-pet-fields';
import Pet, { PetInterface } from '../models/Pet';

class PetController {

	public async create(req: Request, res: Response): Promise<Response> {

		const pet = {
			name: req.body.name,
			birthdate: req.body.birthdate,
			weight: req.body.weight,
			color: req.body.color,
			images: req.files
		};

		const available = true;

		// validations
		const errorResponse = await validatePetFields(pet, req.uuid as string) as [];

		if (errorResponse.length !== 0) {
			return res.status(422).json({ errors: errorResponse });
		}

		// get pet owner
		const user = await getUserByToken(req.headers.authorization as string);

		const imagesBody = pet.images as [];
		const imagesToBD: string[] = [];

		imagesBody.map((image: Express.Multer.File) => {
			return imagesToBD.push(image.filename);
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

			await redisClient.del('pet.getAll');

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

		const petsFromCache = await redisClient.get('pet.getAll');

		if (petsFromCache) {

			const pets = JSON.parse(petsFromCache);

			return res.status(200).json({ pets: pets });
		}

		const pets = await Pet.find().sort('-createdAt');

		await redisClient.set('pet.getAll', JSON.stringify(pets));

		return res.status(200).json({ pets: pets });
	}
}

export default new PetController();