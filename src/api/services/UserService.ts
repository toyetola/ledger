import mongoose from "mongoose";
import Account from '../models/Account'; 
import Transaction from '../models/Transaction';
import User from '../models/User';
import ExchangeRate from "../models/ExchangeRate";

class UserService {

    withdrawFund = async (accountId: string, amount: number, currency:string) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const account = await Account.findById(accountId).session(session);
            if (!account) throw new Error("Account not found");

            if (account.balance < amount) throw new Error("Insufficient funds");

            const bankReserveAccount = await Account.findOne({ type: "bank_reserve", currency }).session(session);
            if (!bankReserveAccount) throw new Error("Bank reserve account not found");

            // Debit user's account (reduce balance)
            await Account.updateOne(
                { _id: accountId },
                { $inc: { balance: -amount } },
                { session }
            );

            // Credit bank reserve account (increase balance)
            await Account.updateOne(
                { _id: bankReserveAccount._id },
                { $inc: { balance: amount } },
                { session }
            );

            // Record transaction (double-entry accounting)
            const transaction = await Transaction.create([{
                fromAccount: accountId,
                toAccount: bankReserveAccount._id,
                amount,
                currency,
                type: "withdrawal",
                entries: [
                    { accountId: accountId, amount: -amount }, // Debit user
                    { accountId: bankReserveAccount._id, amount: amount } // Credit bank reserve
                ],
                createdAt: new Date()
            }], { session });

            
            if (session.inTransaction()) {  
                await session.commitTransaction();
            }

            return { 
                success: true, 
                message: "Withdrawal successful", 
                transactionId: transaction[0]._id, 
                amount, 
                currency 
            };

        } catch (error) {
            if(session.inTransaction()){
                await session.abortTransaction();
            }
            
            console.error("Withdrawal failed:", error.message);

            return { 
                success: false, 
                message: "Withdrawal failed", 
                error: error.message 
            };
        }finally {
            session.endSession();
        }
    }

    depositFund = async (accountId : string, amount: number, currency: string) => {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            const account = await Account.findById(accountId).session(session);
            if (!account) throw new Error("Account not found");
    
            const bankReserveAccount = await Account.findOne({ type: "bank_reserve", currency }).session(session);
            if (!bankReserveAccount) throw new Error("Bank reserve account not found");
    
            // Increase user's balance (credit)
            await Account.updateOne(
                { _id: accountId },
                { $inc: { balance: amount } },
                { session }
            );
    
            // Decrease reserve balance (debit)
            await Account.updateOne(
                { _id: bankReserveAccount._id },
                { $inc: { balance: -amount } },
                { session }
            );
    
            // Record the transaction (double-entry accounting)
            const transaction = await Transaction.create([
                {
                    fromAccount: bankReserveAccount._id,
                    toAccount: accountId,
                    amount,
                    currency,
                    type: "deposit",
                    entries: [
                        { accountId: bankReserveAccount._id, amount: -amount }, // Debit bank
                        { accountId: accountId, amount: amount } // Credit user
                    ],
                    createdAt: new Date()
                }
            ], { session });

            if(session.inTransaction()){
                session.commitTransaction()
            }

            return { 
                success: true, 
                message: "Deposit successful", 
                transactionId: transaction[0]._id, 
                amount, 
                currency 
            }

            
        }catch(error){

            if(session.inTransaction()){
                await session.abortTransaction();
            }
           
            console.error("Deposit failed:", error.message);
            return { 
                success: false, 
                message: "Deposit failed", 
                error: error.message 
            }
        }finally {
            session.endSession();
        }
    }

    getBalance = async (accountId: string) => {
        try {
            const account = await Account.findById(accountId);
            if (!account) throw new Error("Account not found");
    
            return {
                success: true,
                accountId: account._id,
                balance: account.balance,
                currency: account.currency,
            };
        } catch (error) {
            console.error("Error fetching balance:", error.message);
    
            return {
                success: false,
                message: "Failed to retrieve balance",
                error: error.message,
            };
        }
    }

    getProfile = async (userId: any) => {
        try {
            // Fetching user details
            const user = await User.findById(userId).select("-password"); // Exclude password field
            if (!user) throw new Error("User not found");
    
            // Fetching user's accounts
            const accounts = await Account.find({ userId });
    
            return {
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                },
                accounts: accounts.map(account => ({
                    accountId: account._id,
                    balance: account.balance,
                    currency: account.currency,
                    type: account.type,
                })),
            };
        } catch (error) {
            console.error("Error fetching user profile:", error.message);
    
            return {
                success: false,
                message: "Failed to retrieve user profile",
                error: error.message,
            };
        }
    }

    doTransfer = async (fromAccountId: string, toAccountId: string, amount: number) => {

        if (amount <= 0) throw new Error("Transfer amount must be greater than zero");

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Fetch sender and receiver accounts
            const fromAccount = await Account.findById(fromAccountId).session(session);
            const toAccount = await Account.findById(toAccountId).session(session);

            if (!fromAccount || !toAccount) throw new Error("One or both accounts not found");

            // Fetch exchange rates
            const fromCurrency = fromAccount.currency;
            const toCurrency = toAccount.currency;

            let convertedAmount = amount;

            if (fromCurrency !== toCurrency) {
                // Find exchange rate for conversion
                const exchangeRate = await ExchangeRate.findOne({ baseCurrency: fromCurrency, targetCurrency: toCurrency }).session(session);

                if (!exchangeRate) throw new Error(`No exchange rate found from ${fromCurrency} to ${toCurrency}`);

                // Convert the amount
                convertedAmount = amount * exchangeRate.rate;
            }

            // Check sender's balance after conversion
            if (fromAccount.balance < amount) throw new Error("Insufficient funds");

            // Deduct from sender
            fromAccount.balance -= amount;
            await fromAccount.save({ session });

            // Credit receiver
            toAccount.balance += convertedAmount;
            await toAccount.save({ session });

            // Create transaction records (double-entry accounting)
            await Transaction.create(
                [
                    {
                        fromAccount: fromAccountId,
                        toAccount: toAccountId,
                        amount,
                        convertedAmount,
                        fromCurrency,
                        toCurrency,
                        entries: [
                            { account: fromAccountId, type: "debit", amount, currency: fromCurrency },
                            { account: toAccountId, type: "credit", amount: convertedAmount, currency: toCurrency }
                        ],
                        type: "transfer"
                    }
                ],
                { session }
            );

            // Commit the transaction
            if (session.inTransaction()) {
                await session.commitTransaction();
            }

            return { success: true, message: "Transfer successful", convertedAmount };
        } catch (error) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
            throw new Error(error.message || "Transaction failed");
        } finally {
            session.endSession();
        }

    }


}

export default new UserService();