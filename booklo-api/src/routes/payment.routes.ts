import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { createPreference, webhook, confirmByRedirect } from '../controllers/payment.controller';

const router = Router();

router.post('/create-preference', authenticate, createPreference);
router.post('/webhook',           webhook);
router.post('/confirm/:orderId',  authenticate, confirmByRedirect);

export default router;
