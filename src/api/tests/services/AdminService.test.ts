// adminService.test.ts
import AdminService from '../../services/AdminService';
import User from '../../models/User';
import Transaction from '../../models/Transaction';
import Account from '../../models/Account';


jest.mock('../../models/User', () => ({
  __esModule: true,
  default: {
      find: jest.fn(),
      findById: jest.fn(),
  }
}));
jest.mock('../../models/Transaction', () => ({
  __esModule: true,
  default: {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn()
  }
}));
jest.mock('../../models/Account', () => ({
  __esModule: true,
  default: {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn()
  }
}));

describe('AdminService', () => {
  describe('getUsers', () => {
    it('should return users with success true', async () => {
      const mockUsers = [{ id: 1, name: 'User1' }];


      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockUsers)
      };

      
      (User.find as jest.Mock).mockImplementation(() => mockQuery);

      const result = await AdminService.getUsers(10, 1);
      expect(result).toEqual({ success: true, users: mockUsers });
      expect(User.find).toHaveBeenCalledWith({});
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
    });

    it('should handle errors', async () => {
      const errorMessage = 'Error fetching users';
      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockRejectedValue(new Error(errorMessage))
      };

      (User.find as jest.Mock).mockImplementation(() => mockQuery);

      const result = await AdminService.getUsers(10, 1);
      expect(result).toEqual({ message: errorMessage, error: errorMessage });
    });
  });

  describe('getUser', () => {
    it('should return a user with success true', async () => {
      const mockUser = { id: 1, name: 'User1' };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await AdminService.getUser(1);
      expect(result).toEqual({ success: true, user: mockUser });
      expect(User.findById).toHaveBeenCalledWith(1);
    });

    it('should return user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const result = await AdminService.getUser(1);
      expect(result).toEqual({ success: false, message: 'User not found' });
    });

    it('should handle errors', async () => {
      const errorMessage = 'could not get user';
      (User.findById as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const result = await AdminService.getUser(1);
      expect(result).toEqual({ message: errorMessage, error: errorMessage });
    });
  });

  describe('getTransactions', () => {
    it('should return transactions with success true', async () => {
      const mockTransactions = [{ id: 1, amount: 100 }];

      
      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockTransactions)
      };

      (Transaction.find as jest.Mock).mockImplementation(() => mockQuery);

      const result = await AdminService.getTransactions(1, 10);
      expect(result).toEqual({ success: true, transactions: mockTransactions });
      expect(Transaction.find).toHaveBeenCalledWith({});
    });

    it('should handle errors', async () => {
      const errorMessage = 'Error fetching transactions';
      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockRejectedValue(new Error(errorMessage))
      };

      (Transaction.find as jest.Mock).mockImplementation(() => mockQuery);

      const result = await AdminService.getTransactions(1, 10);
      expect(result).toEqual({ message: errorMessage, error: errorMessage });
    });
  });

  describe('getTransaction', () => {
    it('should return a transaction with success true', async () => {
      const mockTransaction = { id: 1, amount: 100 };
      (Transaction.findById as jest.Mock).mockResolvedValue(mockTransaction);

      const result = await AdminService.getTransaction(1);
      expect(result).toEqual({ success: true, transaction: mockTransaction });
      expect(Transaction.findById).toHaveBeenCalledWith(1);
    });

    it('should return transaction not found', async () => {
      (Transaction.findById as jest.Mock).mockResolvedValue(null);


      const result = await AdminService.getTransaction("transactionId");
      expect(result).toEqual({ message: 'Transaction not found', success: false });
    });

    it('should handle errors', async () => {
      const errorMessage = 'Could not get transaction';
      (Transaction.findById as jest.Mock).mockRejectedValue(new Error(errorMessage));


      const result = await AdminService.getTransaction(1);
      expect(result).toEqual({ message: errorMessage, error: errorMessage });
    });
  });

  describe('getAccounts', () => {
    it('should return accounts with success true', async () => {
      const mockAccounts = [{ id: 1, balance: 1000 }];
      
      
      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockAccounts)
      };

      
      (Account.find as jest.Mock).mockImplementation(() => mockQuery);


        const result = await AdminService.getAccounts(1, 10);
        expect(result).toEqual({ success: true, accounts: mockAccounts });
        expect(Account.find).toHaveBeenCalledWith({});
      });

    it('should handle errors', async () => {
      const errorMessage = 'Error fetching accounts';

      const mockQuery = {
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockRejectedValue(new Error(errorMessage))
      };

      
      (Account.find as jest.Mock).mockImplementation(() => mockQuery);

      const result = await AdminService.getAccounts(1, 10);
      expect(result).toEqual({ message: errorMessage, error: errorMessage });
    });
  });
});