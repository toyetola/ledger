import ExchangeRate from "../models/ExchangeRate"; // Your Mongoose model

export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number | undefined> {
    if (fromCurrency === toCurrency) return 1; // No conversion needed

    
    const rateDoc = await ExchangeRate.findOne({
        baseCurrency: fromCurrency,
        targetCurrency: toCurrency
    });

    if (rateDoc) {
        return rateDoc.rate;
    }

    // If not found, we could fetch from an external API but I won't be doing that here
   
}

export async function updateExchangeRate(fromCurrency: string, toCurrency: string, exchangeRate: number){
    await ExchangeRate.updateOne(
        { baseCurrency: fromCurrency, targetCurrency: toCurrency },
        { rate: exchangeRate, updatedAt: new Date() },
        { upsert: true } // Create a new entry if it doesn't exist
    );
    
    return exchangeRate;
}