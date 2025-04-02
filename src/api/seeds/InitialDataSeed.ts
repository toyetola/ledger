import ExchangeRate from '../models/ExchangeRate';
import Account from '../models/Account';
import User from '../models/User';




async function seedExchangeRateData() {
    try {
        const exchangeRates = [
            { fromCurrency: "USD", toCurrency: "NGN", rate: 1400 },
            { fromCurrency: "EUR", toCurrency: "NGN", rate: 1500 },
            { fromCurrency: "USD", toCurrency: "EUR", rate: 0.91 },
            { fromCurrency: "EUR", toCurrency: "USD", rate: 1.1 }
        ];
        
        for (const rate of exchangeRates) {
            const existingRate = await ExchangeRate.findOne({
                baseCurrency: rate.fromCurrency,
                targetCurrency: rate.toCurrency
            });
    
            if (!existingRate) {
                await ExchangeRate.create({baseCurrency:rate.fromCurrency, targetCurrency:rate.toCurrency, rate: rate.rate});
                console.log(`Exchange Rate Added: ${rate.fromCurrency} → ${rate.toCurrency}`);
            } else {
                console.log(`Exchange Rate Exists: ${rate.fromCurrency} → ${rate.toCurrency}`);
            }
        }
        console.log(`Seeded exchange rates successfully`)
    } catch (error) {
        console.log(`Seeded exchange rates failure ${error}`)
    }
    
}

async function seedAccountData() {
    try {
        const currencies = ["USD", "NGN", "EUR"];
        for (const [index, currency] of currencies.entries()) {
            const existingAccount = await Account.findOne({ currency, type: "bank_reserve" });

            if (!existingAccount) {
                const newUser = new User({email: `email${index}@email.co`, password: `pawword${index}`, name:`BankReeserve${index}`})
                const user = await newUser.save();
                await Account.create({ userId: user._id, balance: 1000000, currency, type: "bank_reserve" });
                console.log(`Bank Reserve Account Created for ${currency}`);
            } else {
                console.log(`Bank Reserve Account Exists for ${currency}`);
            }
        }

        console.log("Seeding Accounts Complete!");
    
    } catch (error) {
        console.error("Seeding Accounts Error:", error);
    }
}

seedExchangeRateData();
seedAccountData();