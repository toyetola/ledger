import mongoose, { Document, Schema } from "mongoose";

export interface IAccount extends Document {
    userId: mongoose.Types.ObjectId;
    balance: number;
    currency: string; // e.g., "USD", "EUR"
    type: "user" | "bank_reserve"; // User account or bank reserve
    createdAt: Date;
}

const AccountSchema = new Schema<IAccount>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true },
    type: { type: String, enum: ["user", "bank_reserve"], required: true },
}, {timestamps: true});

const Account = mongoose.model<IAccount>("Account", AccountSchema);

export default Account;