import { Request } from 'express';

export function existsEmptyFields(body: Request['body']): string[] {

	const emptyFields: string[] = [];
	for (const [key, value] of Object.entries(body)) {
		if (!value) {
			emptyFields.push(key);
		}
	}

	return emptyFields;

}