import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as IsbnService from '../services/isbn.service';

export const getByISBN = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isbn = req.params.isbn as string;

    if (!isbn || isbn.length < 10) {
      res.status(400).json({ message: 'ISBN inválido' });
      return;
    }

    const book = await IsbnService.searchByISBN(isbn);

    if (!book) {
      res.status(404).json({ message: 'No se encontró ningún libro con ese ISBN' });
      return;
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el libro' });
  }
};
