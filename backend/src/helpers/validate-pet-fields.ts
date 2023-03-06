import { Request } from 'express';
import fs from 'fs';
import PasswordValidator from 'password-validator';
import validator from 'validator';

import Pet, { PetInterface } from '../models/Pet';
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

	const isEdit = !petToCompare ? false : true;

	const errorResponse = [];

	// return userEdited if user is not undefined
	// const userEdited = {
	// 	name: user?.name,
	// 	email: user?.email,
	// 	phone: user?.phone,
	// 	password: user?.password,
	// 	image: user?.image
	// };

	// let fields;

	// if (isEdit) {
	// 	fields = {
	// 		name: body.name,
	// 		email: body.email,
	// 		phone: body.phone
	// 	};
	// } else {
	// fields = {
	// 	name: body.name,
	// 	birthdate: body.birthdate,
	// 	weight: body.weight,
	// 	color: body.color
	// };
	// }

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

	// if (isEdit && fields.name !== user?.name)
	// 	userEdited.name = fields.name;

	// delete this pet photos
	if (errorResponse.length > 0) {
		const dirPath = `${process.env.IMAGES_DIR}pets/`;

		fs.readdir(dirPath, (error, files) => {
			if (error) logger.error(error);

			const images = files.filter(file => {
				return file.includes(uuidReq);
			});

			images.forEach(file => {
				fs.unlink(dirPath + file, error => {
					if (error) {
						logger.error(error);
						return;
					}
				});
			});
		});
	}

	// fs.unlink(process.env.IMAGES_DIR as string + 'users/' + user?.image, (error) => {
	// 	if (error) {
	// 		logger.error(error);
	// 		return;
	// 	}
	// });

	// if (isEdit && errorResponse.length === 0) {

	// 	if (user?.name !== userEdited.name || user?.email !== userEdited.email
	// 		|| user?.phone !== userEdited.phone || user?.password !== userEdited.password
	// 		|| user?.image !== userEdited.image) {
	// 		return userEdited;
	// 	}

	// 	errorResponse.push({ message: 'All up to date' });
	// }

	return errorResponse;

}