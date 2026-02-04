// backend/src/models/like.model.ts
import { Schema, model, Types, Document } from "mongoose";

export interface ILike extends Document {
    post: Types.ObjectId;        // Reference to Post
    users: Types.ObjectId[];     // Array of User IDs who liked the post
    count: number;               // Total number of likes
    createdAt: Date;
    updatedAt: Date;
}

const likeSchema = new Schema<ILike>(
    {
        post: { type: Schema.Types.ObjectId, ref: "Post", unique: true, required: true },
        users: [{ type: Schema.Types.ObjectId, ref: "User" }],
        count: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export default model<ILike>("Like", likeSchema);
