import { Request, Response } from 'express';
import fs from 'fs';
import { Types } from 'mongoose';

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

		if ('errors' in errorResponse)
			return res.status(422).json({ errors: errorResponse });

		if (pet.images?.length === 0)
			return res.status(422).json({ message: 'Required: image' });

		// get pet owner
		const user = await getUserByToken(req.headers.authorization as string);

		const imagesBody = pet.images as Express.Multer.File[];
		const imagesToBD = imagesBody.map((image) => image.filename);

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

	public async getAll(_: Request, res: Response): Promise<Response> {

		const petsFromCache = await redisClient.get('pet.getAll');

		if (petsFromCache) {

			const pets = JSON.parse(petsFromCache);

			return res.status(200).json({ pets: pets });
		}

		const pets = await Pet.find().sort('-createdAt');

		await redisClient.set('pet.getAll', JSON.stringify(pets));

		return res.status(200).json({ pets: pets });
	}

	public async getAllUserPets(req: Request, res: Response): Promise<Response> {

		const user = await getUserByToken(req.headers.authorization as string);

		const pets = await Pet.find({ 'user._id': user._id }).sort('-createdAt');

		return res.status(200).json({ pets: pets });
	}

	public async getAllUserAdoptions(req: Request, res: Response): Promise<Response> {

		const user = await getUserByToken(req.headers.authorization as string);

		const pets = await Pet.find({ 'adopter._id': user._id }).sort('-createdAt');

		return res.status(200).json({ adoptions: pets });
	}

	public async getPetById(req: Request, res: Response): Promise<Response> {

		const id = req.params.id;

		if (!Types.ObjectId.isValid(id)) {
			return res.status(422).json({ message: 'Invalid ID' });
		}

		const pet = await Pet.findById({ _id: id });

		if (!pet) {
			return res.status(404).json({ message: 'Pet not found' });
		}

		return res.status(200).json({ pet: pet });
	}

	public async removePetById(req: Request, res: Response): Promise<Response> {

		const id = req.params.id;

		if (!Types.ObjectId.isValid(id)) {
			return res.status(422).json({ message: 'Invalid ID' });
		}

		const pet = await Pet.findById({ _id: id });

		if (!pet) {
			return res.status(404).json({ message: 'Pet not found' });
		}

		const petUser = pet.user as PetInterface;
		const petUserId = petUser._id;

		if (petUserId.toString() !== req.userId) {
			return res.status(404).json({ message: 'Unauthorized' });
		}

		await Pet.findByIdAndDelete(id);

		const dirPath = `${process.env.IMAGES_DIR}pets/`;

		pet.images.forEach((image: string) => {
			fs.unlink(dirPath + image, error => {
				if (error) {
					logger.error(error);
					return;
				}
			});
		});

		await redisClient.del('pet.getAll');

		return res.status(200).json({ message: 'Pet sucessfully removed' });
	}

	public async editPet(req: Request, res: Response): Promise<Response> {

		const id = req.params.id;

		const petToUpdate = {
			name: req.body.name,
			birthdate: req.body.birthdate,
			weight: req.body.weight,
			color: req.body.color,
			images: req.files,
			available: req.body.available
		};

		const pet = await Pet.findById({ _id: id });

		if (!pet) {
			return res.status(404).json({ message: 'Pet not found' });
		}

		const petUser = pet.user as PetInterface;
		const petUserId = petUser._id;

		if (petUserId.toString() !== req.userId) {
			return res.status(404).json({ message: 'Unauthorized' });
		}

		// validations
		const errorResponse = await validatePetFields(petToUpdate, req.uuid as string, pet) as [];

		if ('errors' in errorResponse)
			return res.status(422).json({ errors: errorResponse });

		if (petToUpdate.images?.length === 0)
			return res.status(422).json({ message: 'Required: image' });

		const imagesBody = petToUpdate.images as Express.Multer.File[];
		const imagesToBD = imagesBody.map((image) => image.filename);

		const updatedPet = {
			name: req.body.name,
			birthdate: req.body.birthdate,
			weight: req.body.weight,
			color: req.body.color,
			images: imagesToBD,
			available: req.body.available
		};

		await Pet.findByIdAndUpdate(id, updatedPet);

		await redisClient.del('pet.getAll');

		return res.status(200).json({ message: 'Pet sucessfully updated', pet: updatedPet });
	}

	public async schedule(req: Request, res: Response): Promise<Response> {

		const id = req.params.id;

		if (!Types.ObjectId.isValid(id)) {
			return res.status(422).json({ message: 'Invalid ID' });
		}

		const pet = await Pet.findById({ _id: id });

		if (!pet) {
			return res.status(404).json({ message: 'Pet not found' });
		}

		const user = await getUserByToken(req.headers.authorization as string);

		// check is my pet
		const petUser = pet.user as PetInterface;

		if (petUser._id.equals(user._id))
			return res.status(422).json({ message: 'Its your pet' });

		// check if user has already scheduled a visit
		const petAdopter = pet.adopter as PetInterface;

		if (pet.adopter) {
			if (petAdopter._id.equals(user._id))
				return res.status(422).json({ message: 'You already scheduled a visit for this pet' });
		}

		pet.adopter = {
			_id: user._id,
			name: user.name,
			phone: user.phone,
			email: user.email,
			image: user.image
		};

		await Pet.findByIdAndUpdate(id, pet);

		await redisClient.del('pet.getAll');

		return res.status(200).json({ message: 'Scheduled visit with success. Enter contact with the pet owner.' });
	}

	public async concludeAdoption(req: Request, res: Response): Promise<Response> {

		const id = req.params.id;

		if (!Types.ObjectId.isValid(id)) {
			return res.status(422).json({ message: 'Invalid ID' });
		}

		const pet = await Pet.findById({ _id: id });

		if (!pet) {
			return res.status(404).json({ message: 'Pet not found' });
		}

		const petUser = pet.user as PetInterface;
		const petUserId = petUser._id;

		if (petUserId.toString() !== req.userId) {
			return res.status(404).json({ message: 'Unauthorized' });
		}

		pet.available = false;

		await Pet.findByIdAndUpdate(id, pet);

		await redisClient.del('pet.getAll');

		return res.status(200).json({ message: 'Congratulations! The adoption cicle was finished with success' });
	}

}

export default new PetController();