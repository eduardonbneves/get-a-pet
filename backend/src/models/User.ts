import bcrypt from 'bcryptjs';
import { Schema, model, Document } from 'mongoose';

interface UserInterface extends Document {
	name: string;
	email: string;
	image?: string;
	phone: string;
	password: string;
	passwordsCompare(password: string): Promise<boolean>;
}

const User = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		image: {
			type: String
		},
		phone: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		}
	},
	{ timestamps: true }
);

User.pre<UserInterface>('save', async function () {
	const salt = await bcrypt.genSalt(13);
	this.password = await bcrypt.hash(this.password, salt);
});

User.methods.passwordsCompare = async function (password: string): Promise<boolean> {
	return await bcrypt.compare(password, this.password);
};

export default model<UserInterface>('User', User);
export { UserInterface };