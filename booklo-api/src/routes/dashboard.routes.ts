import { Router } from 'express';
import * as DashboardController from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize(1), DashboardController.getStats);

export default router;