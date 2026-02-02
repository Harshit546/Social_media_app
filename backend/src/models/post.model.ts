import { model, Schema, Document, Types } from "mongoose";

export interface IComment {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    content: string;
    createdAt?: Date;
}

export interface IPost extends Document {
    user: Types.ObjectId;
    content: string;
    likes: Types.ObjectId[];
    comments: IComment[];
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    likesCount?: number;
    commentsCount?: number;
}

const commentSchema = new Schema<IComment>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true, maxLength: 500 }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const postSchema = new Schema<IPost>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true, maxLength: 500 },
        likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
        comments: { type: [commentSchema], default: [] },
        isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// virtuals for counts
postSchema.virtual("likesCount").get(function (this: any) {
    return this.likes ? this.likes.length : 0;
});
postSchema.virtual("commentsCount").get(function (this: any) {
    return this.comments ? this.comments.length : 0;
});

postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

export default model<IPost>("Post", postSchema);