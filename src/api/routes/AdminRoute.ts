import { Router } from 'express';
import AdminController from '../controllers/AdminController';
import { authMiddleware } from '../middlewares/AuthMiddleware'

const router = Router();

//Routes
router.get('/users', authMiddleware, AdminController.getUsers);
router.get('/users/:userId', authMiddleware, AdminController.getUser)
router.get('/transactions', authMiddleware, AdminController.getTransactions);
router.get('/transactions/:transactionId', authMiddleware, AdminController.getTransaction)

export default router;