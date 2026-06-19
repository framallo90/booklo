import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, OrderController.getOrders);
router.get('/:id', authenticate, OrderController.getOrderById);
router.post('/', authenticate, OrderController.createOrder);
router.patch('/:id/status', authenticate, authorize(1), OrderController.updateOrderStatus);

export default router;