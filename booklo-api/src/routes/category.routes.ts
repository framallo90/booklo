import { Router } from 'express';
import * as CategoryController from '../controllers/category.controller';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', CategoryController.create);
router.patch('/:id', CategoryController.update);
router.delete('/:id', CategoryController.deactivate);

export default router;
