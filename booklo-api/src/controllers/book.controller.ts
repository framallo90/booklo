import { Request, Response } from 'express';
import * as BookModel from '../models/book.model';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: BookModel.BookFilters = {
      search: req.query.search as string,
      category_id: req.query.category_id ? Number(req.query.category_id) : undefined,
      product_type: req.query.product_type as string,
      featured: req.query.featured === 'true' ? true : undefined,
      available: req.query.available === 'true' ? true : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const books = await BookModel.findAll(filters);
    res.json(books);
 } catch (error) {
  res.status(500).json({ message: 'Error al obtener los libros' });
}
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const book = await BookModel.findById(id);

    if (!book) {
      res.status(404).json({ message: 'Libro no encontrado' });
      return;
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el libro' });
  }
};