import { Router } from 'express';
import * as ExternalBookController from '../controllers/external-book.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/isbn/:isbn', authenticate, authorize(1), ExternalBookController.getByISBN);

export default router;