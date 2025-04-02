import { Router } from 'express';
import UserController from '../controllers/UserController';
import AuthController from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/AuthMiddleware'



const router = Router();

router.get('/health', UserController.healthCheck)

// Define routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register)
router.post('/transfer', authMiddleware, UserController.doTransfer);
router.get('/profile/', authMiddleware, UserController.getProfile);
router.post('/deposit', authMiddleware, UserController.depositFund);
router.post('/withdraw', authMiddleware, UserController.withdrawFund);
router.get('/balance', authMiddleware, UserController.getBalance);

export default router;