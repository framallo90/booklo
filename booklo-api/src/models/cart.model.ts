import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface CartItem {
  book_id: number;
  title: string;
  cover_url: string;
  price: number;
  stock: number;
  allows_backorder: boolean;
  quantity: number;
}

const getOrCreateCart = async (userId: number): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO carts (user_id) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
    [userId]
  );
  return result.insertId;
};

export const findByUser = async (userId: number): Promise<CartItem[]> => {
  const cartId = await getOrCreateCart(userId);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT b.id AS book_id, b.title, b.cover_url, b.price, b.stock, b.allows_backorder, ci.quantity
     FROM cart_items ci
     JOIN books b ON ci.book_id = b.id
     WHERE ci.cart_id = ?`,
    [cartId]
  );
  return rows as CartItem[];
};

export const addItem = async (userId: number, bookId: number, quantity: number): Promise<void> => {
  const cartId = await getOrCreateCart(userId);
  await pool.query(
    `INSERT INTO cart_items (cart_id, book_id, quantity) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [cartId, bookId, quantity]
  );
};

export const updateItem = async (userId: number, bookId: number, quantity: number): Promise<void> => {
  const cartId = await getOrCreateCart(userId);
  await pool.query(
    'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND book_id = ?',
    [quantity, cartId, bookId]
  );
};

export const removeItem = async (userId: number, bookId: number): Promise<void> => {
  const cartId = await getOrCreateCart(userId);
  await pool.query(
    'DELETE FROM cart_items WHERE cart_id = ? AND book_id = ?',
    [cartId, bookId]
  );
};

export const clear = async (userId: number): Promise<void> => {
  const cartId = await getOrCreateCart(userId);
  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
};