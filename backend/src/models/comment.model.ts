// backend/src/models/comment.model.ts
import { Schema, model, Types, Document } from "mongoose";

interface ICommentEntry {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    content: string;
    createdAt?: Date;
}

export interface IComment extends Document {
    post: Types.ObjectId;
    comments: ICommentEntry[];
    users: Types.ObjectId[];
    count: number;
    createdAt: Date;
    updatedAt: Date;
}

const commentEntrySchema = new Schema<ICommentEntry>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    },
    { _id: true } // ✅ ensures _id is auto-generated
);

const commentSchema = new Schema<IComment>(
    {
        post: { type: Schema.Types.ObjectId, ref: "Post", unique: true, required: true },
        comments: [commentEntrySchema], // ✅ use subdocument schema
        users: [{ type: Schema.Types.ObjectId, ref: "User" }],
        count: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export default model<IComment>("Comment", commentSchema);
