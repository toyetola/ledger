import mongoose, { Document, Schema } from "mongoose";

const TransactionSchema = new mongoose.Schema({
    fromAccount: mongoose.Schema.Types.ObjectId,
    toAccount: mongoose.Schema.Types.ObjectId,
    amount: { type: Number, required: true }, // Original amount
    currency: { type: String, required: true }, // Original currency
    convertedAmount: { type: Number }, // After exchange rate conversion
    exchangeRate: { type: Number }, // Rate used
    type: { type: String, enum: ["deposit", "withdrawal", "transfer"], required: true },
    entries: [
        {
            accountId: mongoose.Schema.Types.ObjectId,
            amount: Number // Negative for debit, positive for credit
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

export default Transaction;