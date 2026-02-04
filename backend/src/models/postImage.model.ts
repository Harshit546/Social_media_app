import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPostImages extends Document {
    post: Types.ObjectId;
    urls: string[]; // array of S3 URLs
    createdAt?: Date;
    updatedAt?: Date;
}

function arrLimit(val: any) {
    return Array.isArray(val) && val.length <= 5;
}

const PostImagesSchema = new Schema<IPostImages>(
    {
        post: { type: Schema.Types.ObjectId, ref: "Post", required: true, unique: true },
        urls: {
            type: [String],
            required: true,
            default: [],
            validate: {
                validator: arrLimit,
                message: "{PATH} exceeds limit of 5"
            }
        }
    },
    { timestamps: true }
);

export const PostImage = mongoose.model<IPostImages>("PostImage", PostImagesSchema);
