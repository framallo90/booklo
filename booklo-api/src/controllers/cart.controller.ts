import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as CartModel from '../models/cart.model';
import * as BookModel from '../models/book.model';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await CartModel.findByUser(req.user!.id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el carrito' });
  }
};

export const addItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId, quantity = 1 } = req.body;
    if (!bookId) { res.status(400).json({ message: 'ID de libro requerido' }); return; }

    const book = await BookModel.findById(Number(bookId));
    if (!book) { res.status(404).json({ message: 'Libro no encontrado' }); return; }

    if (book.stock < quantity && !book.allows_backorder) {
      res.status(400).json({ message: `Stock insuficiente. Disponible: ${book.stock}` }); return;
    }

    await CartModel.addItem(req.user!.id, Number(bookId), Number(quantity));
    res.status(201).json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar al carrito' });
  }
};

export const updateItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookId = Number(req.params.bookId);
    const { quantity } = req.body;
    if (!quantity || quantity < 1) { res.status(400).json({ message: 'Cantidad inválida' }); return; }

    const book = await BookModel.findById(bookId);
    if (!book) { res.status(404).json({ message: 'Libro no encontrado' }); return; }

    if (book.stock < quantity && !book.allows_backorder) {
      res.status(400).json({ message: `Stock insuficiente. Disponible: ${book.stock}` }); return;
    }

    await CartModel.updateItem(req.user!.id, bookId, Number(quantity));
    res.json({ message: 'Cantidad actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el carrito' });
  }
};

export const removeItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await CartModel.removeItem(req.user!.id, Number(req.params.bookId));
    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar del carrito' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await CartModel.clear(req.user!.id);
    res.json({ message: 'Carrito vaciado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al vaciar el carrito' });
  }
};