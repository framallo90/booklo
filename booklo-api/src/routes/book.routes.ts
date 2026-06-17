import { Router } from 'express';
import * as BookController from '../controllers/book.controller';

const router = Router();

router.get('/', BookController.getAll);
router.get('/:id', BookController.getById);

export default router;