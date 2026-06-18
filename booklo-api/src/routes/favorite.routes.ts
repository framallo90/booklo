import { Router } from 'express';
import * as FavoriteController from '../controllers/favorite.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, FavoriteController.getFavorites);
router.post('/:bookId', authenticate, FavoriteController.addFavorite);
router.delete('/:bookId', authenticate, FavoriteController.removeFavorite);

export default router;