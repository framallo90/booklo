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

export const createBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, price, product_type } = req.body;

    if (!title || !price || !product_type) {
      res.status(400).json({ message: 'Título, precio y tipo de producto son requeridos' });
      return;
    }

    const id = await BookModel.create(req.body);
    res.status(201).json({ id, message: 'Libro creado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el libro' });
  }
};

export const updateBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const updated = await BookModel.update(id, req.body);

    if (!updated) {
      res.status(404).json({ message: 'Libro no encontrado o sin cambios' });
      return;
    }

    res.json({ message: 'Libro actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el libro' });
  }
};

export const deactivateBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const deactivated = await BookModel.deactivate(id);

    if (!deactivated) {
      res.status(404).json({ message: 'Libro no encontrado' });
      return;
    }

    res.json({ message: 'Libro desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al desactivar el libro' });
  }
};
