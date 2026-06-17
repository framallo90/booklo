import { Router } from 'express';
import * as CategoryController from '../controllers/category.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', authenticate, authorize(1), CategoryController.create);
router.patch('/:id', authenticate, authorize(1), CategoryController.update);
router.delete('/:id', authenticate, authorize(1), CategoryController.deactivate);

export default router;
