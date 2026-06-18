import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Favorite {
  book_id: number;
  title: string;
  cover_url: string;
  price: number;
  product_type: string;
  added_at: Date;
}

export const findByUser = async (userId: number): Promise<Favorite[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT b.id AS book_id, b.title, b.cover_url, b.price, b.product_type, f.created_at AS added_at
     FROM favorites f
     JOIN books b ON f.book_id = b.id
     WHERE f.user_id = ? AND b.status = 'activo'
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows as Favorite[];
};

export const add = async (userId: number, bookId: number): Promise<void> => {
  await pool.query<ResultSetHeader>(
    'INSERT IGNORE INTO favorites (user_id, book_id) VALUES (?, ?)',
    [userId, bookId]
  );
};

export const remove = async (userId: number, bookId: number): Promise<void> => {
  await pool.query<ResultSetHeader>(
    'DELETE FROM favorites WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );
};