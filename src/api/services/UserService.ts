import mongoose from "mongoose";
import Account from '../models/Account'; 
import Transaction from '../models/Transaction';
import User from '../models/User';

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

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            return { 
                success: true, 
                message: "Withdrawal successful", 
                transactionId: transaction[0]._id, 
                amount, 
                currency 
            };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Withdrawal failed:", error.message);

            return { 
                success: false, 
                message: "Withdrawal failed", 
                error: error.message 
            };
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

            return { 
                success: true, 
                message: "Deposit successful", 
                transactionId: transaction[0]._id, 
                amount, 
                currency 
            }

            
        }catch(error){
            await session.abortTransaction();
            session.endSession();
            console.error("Deposit failed:", error.message);
            return { 
                success: false, 
                message: "Deposit failed", 
                error: error.message 
            }
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
            // Fetch user details
            const user = await User.findById(userId).select("-password"); // Exclude password field
            if (!user) throw new Error("User not found");
    
            // Fetch user's accounts
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
            
            const fromAccount = await Account.findById(fromAccountId).session(session);
            const toAccount = await Account.findById(toAccountId).session(session);

            if (!fromAccount || !toAccount) throw new Error("One or both accounts not found");

            // Check currency compatibility
            if (fromAccount.currency !== toAccount.currency) {
            throw new Error("Currency mismatch between accounts");
            }

            
            if (fromAccount.balance < amount) throw new Error("Insufficient funds");

            
            fromAccount.balance -= amount;
            await fromAccount.save({ session });

            // Credit to receiver
            toAccount.balance += amount;
            await toAccount.save({ session });

            // Create transaction records (double-entry)
            await Transaction.create(
            [
                { fromAccount: fromAccountId, toAccount: toAccountId, amount, currency: fromAccount.currency,
                    entries: [
                        { account: fromAccountId, type: "debit", amount }, // Sender debited
                        { account: toAccountId, type: "credit", amount }   // Receiver credited
                      ], type: "transfer" }
            ],
            { session }
            );

            // ✅ Commit transaction
            await session.commitTransaction();
            session.endSession();

            return { success: true, message: "Transfer successful" };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new Error(error.message || "Transaction failed");
        }

    }


}

export default new UserService();