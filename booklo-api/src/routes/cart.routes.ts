import { Router } from 'express';
import * as CartController from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, CartController.getCart);
router.post('/', authenticate, CartController.addItem);
router.patch('/:bookId', authenticate, CartController.updateItem);
router.delete('/:bookId', authenticate, CartController.removeItem);
router.delete('/', authenticate, CartController.clearCart);

export default router;