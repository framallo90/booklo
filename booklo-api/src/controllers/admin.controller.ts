import { Request, Response } from 'express';
import * as UserModel from '../models/user.model';
import * as BookModel from '../models/book.model';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = (req.query.search as string) || '';
    const page   = req.query.page  ? Number(req.query.page)  : 1;
    const limit  = req.query.limit ? Number(req.query.limit) : 20;
    const result = await UserModel.findAll(search, page, limit);
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { is_active, role_id } = req.body;

    if (is_active !== undefined) {
      await UserModel.setActive(id, Boolean(is_active));
    }
    if (role_id !== undefined) {
      const allowed = [1, 2];
      if (!allowed.includes(Number(role_id))) {
        res.status(400).json({ message: 'Rol inválido' });
        return;
      }
      await UserModel.setRole(id, Number(role_id));
    }

    res.json({ message: 'Usuario actualizado' });
  } catch {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

export const getOutdatedBooks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const books = await BookModel.getOutdated();
    res.json(books);
  } catch {
    res.status(500).json({ message: 'Error al obtener libros desactualizados' });
  }
};

export const getStockMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, book_id, search, page = 1, limit = 50 } = req.query;

    let sql = `
      SELECT
        sm.id,
        sm.book_id,
        b.title AS book_title,
        sm.type,
        sm.quantity,
        sm.reason,
        sm.created_at
      FROM stock_movements sm
      JOIN books b ON sm.book_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (type) {
      sql += ' AND sm.type = ?';
      params.push(type);
    }
    if (book_id) {
      sql += ' AND sm.book_id = ?';
      params.push(Number(book_id));
    }
    if (search) {
      sql += ' AND b.title LIKE ?';
      params.push(`%${search}%`);
    }

    const countSql = sql.replace(
      /SELECT[\s\S]+?FROM stock_movements/,
      'SELECT COUNT(*) AS total FROM stock_movements'
    );
    const [countRows] = await pool.query<RowDataPacket[]>(countSql, params);
    const total = (countRows as any[])[0]?.total ?? 0;

    const offset = (Number(page) - 1) * Number(limit);
    sql += ' ORDER BY sm.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    res.json({ total, data: rows });
  } catch {
    res.status(500).json({ message: 'Error al obtener movimientos de stock' });
  }
};
