import mongoose, { Document, Schema } from "mongoose";

const ExchangeRateSchema = new mongoose.Schema({
    baseCurrency: { type: String, required: true }, // e.g., "USD"
    targetCurrency: { type: String, required: true }, // e.g., "EUR"
    rate: { type: Number, required: true } // e.g., 1 USD = 0.85 EUR
},{
    timestamps: true
});

const ExchangeRate = mongoose.model("Transaction", ExchangeRateSchema);

export default ExchangeRate;