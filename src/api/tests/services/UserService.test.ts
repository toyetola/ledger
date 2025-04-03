import mongoose from 'mongoose';
import UserService from '../../services/UserService';
import Account from '../../models/Account';
import Transaction from '../../models/Transaction';
import User from '../../models/User';
import ExchangeRate from '../../models/ExchangeRate';

jest.mock('../../models/Account', () => ({
    __esModule: true,
    default: {
        findById: jest.fn(),
        findOne: jest.fn(),
        updateOne: jest.fn(),
        find: jest.fn(),
    },
}));
jest.mock('../../models/Transaction', () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
    },
}));
jest.mock('../../models/User', () => ({
    __esModule: true,
    default: {
        findById: jest.fn(),
        find: jest.fn(),
    },
}));
jest.mock('../../models/ExchangeRate', () => ({ 
    __esModule: true,
    default: {
        findOne: jest.fn()
    }
}));

describe('UserService', () => {
  let session: any;

  beforeEach(() => {
    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
      inTransaction: jest.fn().mockReturnValue(true),
    };
    mongoose.startSession = jest.fn().mockResolvedValue(session);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('withdrawFund', () => {
    it('should withdraw funds successfully', async () => {
      const accountId = 'accountId';
      const amount = 100;
      const currency = 'USD';

      (Account.findById as jest.Mock).mockImplementationOnce(() => ({
        session: jest.fn().mockReturnValue({ _id: accountId, balance: 200 }),
      }));
      (Account.findOne as jest.Mock).mockImplementation(() => ({
        session: jest.fn().mockReturnValue({ _id: 'bankReserveAccountId', balance: 1000 })
      }))
      Account.updateOne = jest.fn().mockResolvedValue({});
      Transaction.create = jest.fn().mockResolvedValue([{ _id: 'transactionId' }]);


      const result = await UserService.withdrawFund(accountId, amount, currency);

      expect(result).toEqual({
        success: true,
        message: 'Withdrawal successful',
        transactionId: 'transactionId',
        amount,
        currency,
      });
      expect(session.commitTransaction).toHaveBeenCalled();
    });

    it('should handle errors during withdrawal', async () => {
      const accountId = 'accountId';
      const amount = 100;
      const currency = 'USD';

      (Account.findById as jest.Mock).mockImplementation(() => ({
        session: jest.fn().mockReturnValue(null),
      }));
      
      const result = await UserService.withdrawFund(accountId, amount, currency);

      expect(result).toEqual({
        success: false,
        message: 'Withdrawal failed',
        error: 'Account not found',
      });
      expect(session.abortTransaction).toHaveBeenCalled();
    });
  });

  describe('depositFund', () => {
    it('should deposit funds successfully', async () => {
      const accountId = 'accountId';
      const amount = 100;
      const currency = 'USD';

      (Account.findById as jest.Mock).mockImplementationOnce(() => ({
        session: jest.fn().mockReturnValue({ _id: accountId, balance: 200 }),
      }));

      (Account.findOne as jest.Mock).mockImplementationOnce(() => ({
        session: jest.fn().mockReturnValue({ _id: 'bankReserveAccountId', balance: 1000 }),
      }));

      Account.updateOne = jest.fn().mockResolvedValue({});
      Transaction.create = jest.fn().mockResolvedValue([{ _id: 'transactionId' }]);

      const result = await UserService.depositFund(accountId, amount, currency);

      expect(result).toEqual({
        success: true,
        message: 'Deposit successful',
        transactionId: 'transactionId',
        amount,
        currency,
      });
      expect(session.commitTransaction).toHaveBeenCalled();
    });

    it('should handle errors during deposit', async () => {
      const accountId = 'accountId';
      const amount = 100;
      const currency = 'USD';

      (Account.findById as jest.Mock).mockImplementationOnce(() => ({
        session: jest.fn().mockReturnValue(null),
      }));

      const result = await UserService.depositFund(accountId, amount, currency);

      expect(result).toEqual({
        success: false,
        message: 'Deposit failed',
        error: 'Account not found',
      });
      expect(session.abortTransaction).toHaveBeenCalled();
    });
  });

  describe('getBalance', () => {
    it('should return account balance successfully', async () => {
      const accountId = 'accountId';

      Account.findOne = jest.fn().mockResolvedValue({ _id: accountId, balance: 200, currency: 'USD' });

      const result = await UserService.getBalance(accountId);

      expect(result).toEqual({
        success: true,
        accountId,
        balance: 200,
        currency: 'USD',
      });
    });

    it('should handle errors during getBalance', async () => {
      const accountId = 'accountId';

      Account.findOne = jest.fn().mockResolvedValue(null);

      const result = await UserService.getBalance(accountId);

      expect(result).toEqual({
        success: false,
        message: 'Failed to retrieve balance',
        error: 'Account not found',
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const userId = 'userId';

      (User.findById as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValueOnce({ _id: 'userId', name: 'John Doe', email:'john@example.com', currency: 'NGN', createdAt: new Date() })
      }));

      (Account.find as jest.Mock).mockResolvedValue([{ _id: 'accountId', balance: 200, currency: 'NGN', type: 'savings' }])

      const result = await UserService.getProfile(userId);

      expect(result).toEqual({
        success: true,
        user: {
          id: userId,
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: expect.any(Date),
        },
        accounts: [
          {
            accountId: 'accountId',
            balance: 200,
            currency: 'NGN',
            type: 'savings',
          },
        ],
      });
    });

    it('should handle errors during getProfile', async () => {
      const userId = 'userId';

      (User.findById as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValueOnce(null)
      }));

      const result = await UserService.getProfile(userId);

      expect(result).toEqual({
        success: false,
        message: 'Failed to retrieve user profile',
        error: 'User not found',
      });
    });
  });

  describe('doTransfer', () => {
    it('should transfer funds successfully', async () => {
        const fromAccountId = 'fromAccountId';
        const toAccountId = 'toAccountId';
        const amount = 100;
    
        const fromAccount = { _id: fromAccountId, balance: 200, currency: 'USD' };
        const toAccount = { _id: toAccountId, balance: 100, currency: 'USD' };
        const mockExchangeRate = { rate: 1 };

        (Account.findById as jest.Mock).mockImplementationOnce(() => ({
            session: jest.fn().mockReturnValue({ ...fromAccount, save: jest.fn()}),
        }));

        (Account.findById as jest.Mock).mockImplementationOnce(() => ({
            session: jest.fn().mockReturnValue({ ...toAccount, save: jest.fn() }),
        }));
    
        (ExchangeRate.findOne as jest.Mock).mockResolvedValue(mockExchangeRate);
        (Transaction.create as jest.Mock).mockResolvedValue([{ _id: 'transactionId' }]);
        
    
        const result = await UserService.doTransfer(fromAccountId, toAccountId, amount);
    
        expect(result).toEqual({
          success: true,
          message: 'Transfer successful',
          convertedAmount: amount,
        });
        expect(session.commitTransaction).toHaveBeenCalled();
        expect(Account.findById).toHaveBeenCalledWith(fromAccountId);
        expect(Account.findById).toHaveBeenCalledWith(toAccountId);
        expect(Transaction.create).toHaveBeenCalled();
      });
  
  });
  
});