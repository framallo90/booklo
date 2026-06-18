import { Router } from 'express';
import * as BookController from '../controllers/book.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', BookController.getAll);
router.get('/:id', BookController.getById);
router.post('/import', authenticate, authorize(1), BookController.importBook);
router.post('/', authenticate, authorize(1), BookController.createBook);
router.patch('/:id', authenticate, authorize(1), BookController.updateBook);
router.delete('/:id', authenticate, authorize(1), BookController.deactivateBook);

export default router;