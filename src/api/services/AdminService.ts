import Account from '../models/Account';
import Transaction from '../models/Transaction';
import User from '../models/User';

class AdminService {
    static async getUsers (limit:any, page:any) {
        try {
            const users = await User.find({})
              .limit(Number(limit))
              .skip((Number(page) - 1) * Number(limit));
              console.log(users)
            return {success: true, users}
        } catch (error) {
            return { message: "Error fetching users", error: error.message };
        }
        
    }

    static async getUser (userId: any) {
        try {
            const user = await User.findById(userId);

            if (!user) return { success: false, message: "User not found" };

            return { success: true, user };
        } catch (error) {
            return { message: "could not get user", error: error.message };
        }
    }


    static async getTransactions (page: any, limit: any) {
        try {
            const transactions = await Transaction.find({})
              .limit(Number(limit))
              .skip((Number(page) - 1) * Number(limit));
            return {success: true, transactions}
        } catch (error) {
            return { message: "Error fetching transactions", error: error.message };
        }
    }

    static async getTransaction (transactionId : any) {
        try {
            const transaction = await Transaction.findById(transactionId);
        
            if (!transaction) return { message: "Transaction not found", success: false};
        
            return { success: true, transaction };
        } catch (error) {
            return { message: "Could not get transaction", error: error.message };
        }
    }

    static async getAccounts (page: any, limit: any) {
        try {
            const accounts = await Account.find({})
              .limit(Number(limit))
              .skip((Number(page) - 1) * Number(limit));
            return {success: true, accounts}
        } catch (error) {
            return { message: "Error fetching accounts", error: error.message };
        }
    }
}

export default AdminService;