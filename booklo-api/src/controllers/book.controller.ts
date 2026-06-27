import { Request, Response } from 'express';
import * as BookModel from '../models/book.model';
import * as IsbnService from '../services/isbn.service';


export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: BookModel.BookFilters = {
      search: req.query.search as string,
      letter: req.query.letter as string | undefined,
      category_id: req.query.category_id ? Number(req.query.category_id) : undefined,
      product_type: req.query.product_type as string,
      condition: req.query.condition as 'nuevo' | 'usado' | undefined,
      featured: req.query.featured === 'true' ? true : undefined,
      available: req.query.available === 'true' ? true : undefined,
      min_price: req.query.min_price ? Number(req.query.min_price) : undefined,
      max_price: req.query.max_price ? Number(req.query.max_price) : undefined,
      sort: req.query.sort as BookModel.BookFilters['sort'],
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

export const importBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isbn, price, stock, category_id, product_type } = req.body;

    if (!isbn || !price || !product_type) {
      res.status(400).json({ message: 'ISBN, precio y tipo de producto son requeridos' });
      return;
    }

    const externalData = await IsbnService.searchByISBN(isbn);

    if (!externalData) {
      res.status(404).json({ message: 'No se encontró ningún libro con ese ISBN. Podés cargarlo manualmente con POST /books' });
      return;
    }

    const bookData: BookModel.BookData = {
      ...externalData,
      price: Number(price),
      stock: stock ? Number(stock) : 0,
      category_id: category_id ? Number(category_id) : undefined,
      product_type: product_type || externalData.source,
    };

    const id = await BookModel.create(bookData);
    await BookModel.logImport(isbn, externalData.source, externalData);

    res.status(201).json({ id, message: 'Libro importado correctamente', source: externalData.source });
  } catch (error) {
    res.status(500).json({ message: 'Error al importar el libro' });
  }
};