import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as FavoriteModel from '../models/favorite.model';

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const favorites = await FavoriteModel.findByUser(userId);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener favoritos' });
  }
};

export const addFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const bookId = Number(req.params.bookId);
    if (!bookId) { res.status(400).json({ message: 'ID de libro inválido' }); return; }
    await FavoriteModel.add(userId, bookId);
    res.status(201).json({ message: 'Libro agregado a favoritos' });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar favorito' });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const bookId = Number(req.params.bookId);
    if (!bookId) { res.status(400).json({ message: 'ID de libro inválido' }); return; }
    await FavoriteModel.remove(userId, bookId);
    res.status(200).json({ message: 'Libro eliminado de favoritos' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar favorito' });
  }
};