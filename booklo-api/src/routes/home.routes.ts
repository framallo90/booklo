import { Router } from 'express';
import * as HomeController from '../controllers/home.controller';

const router = Router();

router.get('/featured', HomeController.featured);
router.get('/novedades', HomeController.novedades);
router.get('/top-ventas', HomeController.topVentas);

export default router;
