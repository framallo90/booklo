import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.getProfile);
router.patch('/me', authenticate, AuthController.updateProfile);
router.patch('/me/password', authenticate, AuthController.updatePassword);

export default router;
