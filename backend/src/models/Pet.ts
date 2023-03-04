import { Schema, model, Document } from 'mongoose';

interface PetInterface extends Document {
	name: string;
	birthdate: Date;
	weight: number;
	color: string;
	images: Array<string>;
	available?: boolean;
	user?: object;
	adopter?: object;
}

const Pet = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		birthdate: {
			type: Date,
			required: true,
			get: (value: Date) => value.toLocaleDateString(process.env.LOCALE || 'pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
		},
		weight: {
			type: Number,
			required: true
		},
		color: {
			type: String,
			required: true
		},
		images: {
			type: Array,
			required: true
		},
		available: {
			type: Boolean
		},
		user: Object,
		adopter: Object
	},
	{ timestamps: true }
);

export default model<PetInterface>('Pet', Pet);
export { PetInterface };