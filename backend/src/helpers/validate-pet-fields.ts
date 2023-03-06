import { Request } from 'express';
import fs from 'fs';
import PasswordValidator from 'password-validator';
import validator from 'validator';

import { PetInterface } from '../models/Pet';
import logger from './logger';
import { existsEmptyFields } from './verify-empty-fields';

function validateName(name: string): string[] {

	const validator = new PasswordValidator();

	validator
		.is().min(3)
		.is().max(128)
		.has().not().symbols()
		.has().not().digits();

	return validator.validate(name, { details: true }) as string[];

}

export async function validatePetFields(pet: Request['body'], uuidReq: string, petToCompare?: PetInterface) {

	const isEdit = petToCompare ? true : false;

	const errorResponse = [];

	// empty fields
	const emptyFields = existsEmptyFields(pet);

	if (emptyFields.length > 0) {
		errorResponse.push({ message: `Required: ${emptyFields.join(', ')}` });
		return errorResponse;
	}

	// validate name
	const nameInvalidations = validateName(pet.name);

	if (nameInvalidations.length !== 0) {
		errorResponse.push({ name: nameInvalidations });
	}

	if (!validator.isDate(pet.birthdate, { format: 'DD/MM/YYYY' })) {
		errorResponse.push({ birthdate: 'Invalid Date Format: only DD/MM/YYYY allowed' });
	}

	// birthdate
	const currentDate = new Date().getTime();

	const birthdate = new Date(new Date(pet.birthdate).toLocaleDateString(process.env.LOCALE || 'pt-BR')).getTime();

	if (birthdate > currentDate)
		errorResponse.push({ birthdate: 'Invalid Date: only past or present days allowed' });

	// weight
	if (!validator.isNumeric(pet.weight)) {
		errorResponse.push({ weight: 'Invalid weight format' });
	}

	//color
	const colorInvalidations = validateName(pet.color);

	if (colorInvalidations.length !== 0) {
		errorResponse.push({ color: colorInvalidations });
	}

	// delete this pet photos
	if (errorResponse.length > 0) {
		if (!isEdit) {

			const dirPath = `${process.env.IMAGES_DIR}pets/`;

			fs.readdir(dirPath, (error, files) => {
				if (error) logger.error(error);

				files
					.filter(file => {
						return file.includes(uuidReq);
					})
					.map(file => {
						fs.unlink(dirPath + file, error => {
							if (error) {
								logger.error(error);
								return;
							}
						});
					});
			});
		}
	} else {
		// apagar todas imagens antigas e colocar as novas
	}

	if (isEdit && errorResponse.length === 0) {

		if (petToCompare?.name !== pet.name || petToCompare?.birthdate !== pet.birthdate
			|| petToCompare?.weight !== pet?.weight || petToCompare?.color !== pet.color
			|| petToCompare?.images !== pet.images) {
			return pet as PetInterface;
		}

		errorResponse.push({ message: 'All up to date' });
	}

	return errorResponse;

}