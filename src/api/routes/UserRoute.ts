import { Router } from 'express';
import UserController from '../controllers/UserController';
import AuthController from '../controllers/AuthController';



const router = Router();

// Define routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register)
router.post('/transfer', UserController.doTransfer);
router.get('/profile/', UserController.getProfile);
router.post('/deposit', UserController.depositFund);
router.post('/withdraw', UserController.withdrawFund);
router.get('/balance', UserController.getBalance);

export default router;