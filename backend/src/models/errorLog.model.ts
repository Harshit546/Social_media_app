import { Schema, model, Document, Types } from "mongoose";

export interface IErrorLog extends Document {
    apiName?: string;
    service: "backend" | "frontend";
    errorDetail: any;
    userId?: Types.ObjectId | string | null;
    errorOccurredTime: Date;
    createdAt: Date;
    updatedAt: Date;
}

const errorLogSchema = new Schema<IErrorLog>(
    {
        apiName: { type: String },
        service: {
            type: String,
            enum: ["backend", "frontend"],
            required: true,
            default: "backend",
        },
        errorDetail: {
            type: Schema.Types.Mixed,
            required: true,
        },
        userId: {
            type: Schema.Types.Mixed,
            required: false,
        },
        errorOccurredTime: {
            type: Date,
            required: true,
            default: () => new Date(),
        },
    },
    {
        timestamps: true,
    }
);

errorLogSchema.index({ service: 1, errorOccurredTime: -1 });

export default model<IErrorLog>("ErrorLog", errorLogSchema);

