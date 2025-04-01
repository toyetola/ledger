import { Router } from 'express';
import AdminController from '../controllers/AdminController';

const router = Router();

//Routes
router.get('/fetch/users', AdminController.getUsers);
router.get('/fetch/users/:userId', AdminController.getUser)
router.get('/fetch/transactions', AdminController.getTransactions);
router.get('/get/transactions/:transactionId', AdminController.getTransaction)

export default router;