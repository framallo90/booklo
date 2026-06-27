import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, authorize(1));

router.get('/users',                  AdminController.getUsers);
router.patch('/users/:id',            AdminController.updateUser);
router.get('/catalog/outdated',       AdminController.getOutdatedBooks);
router.get('/stock-movements',        AdminController.getStockMovements);

export default router;
