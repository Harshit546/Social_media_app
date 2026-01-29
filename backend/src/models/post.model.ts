import {model, Schema, Document, Types} from "mongoose"

export interface IPost extends Document {
    user: Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>({
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    content: {type: String, required: true, trim: true, maxLength: 500},
}, {timestamps: true} )

export default model<IPost>("Post", postSchema);