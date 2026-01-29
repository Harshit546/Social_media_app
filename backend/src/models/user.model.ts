import {model, Schema, Document} from "mongoose"

export interface IUser extends Document {
    email: string;
    password: string;
    role: string;
    isDeleted: boolean;
}

const userSchema = new Schema<IUser>({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, default: "user"},
    isDeleted: {type: Boolean, default: false}
}, {timestamps: true});

export default model<IUser>("User", userSchema);