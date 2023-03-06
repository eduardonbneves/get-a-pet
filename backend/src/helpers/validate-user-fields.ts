import bcrypt from 'bcryptjs';
import { Request } from 'express';
import fs from 'fs';
import PasswordValidator from 'password-validator';
import path from 'path';
import validator from 'validator';

import User, { UserInterface } from '../models/User';
import logger from './logger';
import { existsEmptyFields } from './verify-empty-fields';

function validateName(name: string): string[] {

	const validator = new PasswordValidator();

	validator
		.is().min(3)
		.is().max(128)
		.has().not().symbols()
		.has().not().digits()
		.has().spaces();

	return validator.validate(name, { details: true }) as string[];

}

export function validatePassword(password: string): string[] {

	const validator = new PasswordValidator();

	validator
		.is().min(6)
		.is().max(128)
		.has().uppercase()
		.has().lowercase()
		.has().symbols()
		.has().digits()
		.has().not().spaces()
		.is().not().oneOf(['@Passw0rdd', 'Password@123']);

	return validator.validate(password, { details: true }) as string[];

}

export async function validateUserFields(body: Request['body'], user?: UserInterface) {

	const isEdit = !user ? false : true;

	const errorResponse = [];

	// return userEdited if user is not undefined
	const userEdited = {
		name: user?.name,
		email: user?.email,
		phone: user?.phone,
		password: user?.password,
		image: user?.image
	};

	let fields;

	if (isEdit) {
		fields = {
			name: body.name,
			email: body.email,
			phone: body.phone
		};
	} else {
		fields = {
			name: body.name,
			email: body.email,
			phone: body.phone,
			password: body.password,
			confirmPassword: body.confirmPassword
		};
	}

	// empty fields
	const emptyFields = existsEmptyFields(fields);

	if (emptyFields.length > 0) {
		errorResponse.push({ message: `Required: ${emptyFields.join(', ')}` });
		return errorResponse;
	}

	// validate name
	const nameInvalidations = validateName(fields.name);

	if (nameInvalidations.length !== 0) {
		errorResponse.push({ name: nameInvalidations });
	}

	if (isEdit && fields.name !== user?.name)
		userEdited.name = fields.name;

	// validate email
	if (!validator.isEmail(fields.email)) {
		errorResponse.push({ email: 'Enter a valid email' });
	}

	if (isEdit) {
		if (fields.email !== user?.email && await User.exists({ email: fields.email })) {
			errorResponse.push({ email: 'Email already registered' });
		} else
		if (fields.email !== user?.email)
			userEdited.email = fields.email;
	} else {
		if (await User.exists({ email: fields.email })) {
			errorResponse.push({ email: 'Email already registered' });
		}
	}

	// validate phone
	if (!validator.isMobilePhone(fields.phone, (process.env.LOCALE as validator.MobilePhoneLocale) || 'pt-BR')) {
		errorResponse.push({ phone: 'Invalid phone number' });
	} else {
		if (fields.phone !== user?.phone)
			userEdited.phone = fields.phone;
	}

	// validate password
	if (!isEdit) {
		if (fields.password !== fields.confirmPassword) {
			errorResponse.push({ 'password fields': 'Password and confirmation password do not match' });
		} else {
			const passwordInvalidations = validatePassword(fields.password);

			if (passwordInvalidations.length !== 0) {
				errorResponse.push({ password: passwordInvalidations });
			}
		}
	} else {
		if (body.password || body.confirmPassword) {
			if (body.password !== body.confirmPassword) {
				errorResponse.push({ 'password fields': 'Password and confirmation password do not match' });
			} else {
				const passwordInvalidations = validatePassword(body.password);

				if (passwordInvalidations.length !== 0) {
					errorResponse.push({ password: passwordInvalidations });
				}

				if (!await user?.passwordsCompare(body.password)) {
					const salt = await bcrypt.genSalt(13);
					const hashPassword = await bcrypt.hash(body.password, salt);
					userEdited.password = hashPassword;
				}
			}
		}

		if (body.image) {

			const dirPath = `${process.env.IMAGES_DIR}users/${user?.id}/`;

			fs.readdir(dirPath, (error, files) => {
				if (error) logger.error(error);

				// select all old images
				let timestampCache = '0';
				files.forEach(file => {
					const timestamp = file.split('.')[1];

					if (timestamp > timestampCache) {
						timestampCache = timestamp;
					}
				});

				// exclude all old images from user
				files.forEach(file => {
					const timestamp = file.split('.')[1];
					if (timestampCache > timestamp) {
						if (errorResponse.length === 0) {
							fs.unlink(dirPath + file, (error) => {
								if (error) {
									logger.error(error);
									return;
								}
							});
						} else {
							files.forEach(file => {
								if (file !== user?.image) {
									fs.unlink(dirPath + file, error => {
										if (error) {
											logger.error(error);
											return;
										}
									});
								}
							});
						}
					}
				});
			});

			userEdited.image = body.image;
		}

	}

	if (isEdit && errorResponse.length === 0) {

		if (user?.name !== userEdited.name || user?.email !== userEdited.email
			|| user?.phone !== userEdited.phone || user?.password !== userEdited.password
			|| user?.image !== userEdited.image) {
			return userEdited;
		}

		errorResponse.push({ message: 'All up to date' });
	}

	return errorResponse;

}