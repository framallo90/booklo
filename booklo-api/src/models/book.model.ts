import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export interface Book {
  id: number;
  title: string;
  subtitle: string;
  isbn_10: string;
  isbn_13: string;
  description: string;
  publisher: string;
  published_date: string;
  page_count: number;
  language: string;
  price: number;
  original_price: number;
  original_currency: string;
  stock: number;
  cover_url: string;
  product_type: 'libro' | 'comic' | 'manga' | 'revista';
  featured: boolean;
  allows_backorder: boolean;
  status: 'activo' | 'inactivo';
  category_id: number;
  created_at: Date;
}

export interface BookFilters {
  search?: string;
  category_id?: number;
  product_type?: string;
  available?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export const findAll = async (filters: BookFilters = {}): Promise<Book[]> => {
  const conditions: string[] = ['b.status = "activo"'];
  const params: unknown[] = [];

  if (filters.search) {
    conditions.push('(b.title LIKE ? OR b.isbn_10 LIKE ? OR b.isbn_13 LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.category_id) {
    conditions.push('b.category_id = ?');
    params.push(filters.category_id);
  }

  if (filters.product_type) {
    conditions.push('b.product_type = ?');
    params.push(filters.product_type);
  }

  if (filters.featured !== undefined) {
    conditions.push('b.featured = ?');
    params.push(filters.featured);
  }

  if (filters.available) {
    conditions.push('(b.stock > 0 OR b.allows_backorder = TRUE)');
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const where = conditions.join(' AND ');
  const sql = `SELECT b.* FROM books b WHERE ${where} ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows as Book[];
};

export const findById = async (id: number): Promise<Book | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT b.*, 
      GROUP_CONCAT(a.name SEPARATOR ', ') AS authors
     FROM books b
     LEFT JOIN book_authors ba ON b.id = ba.book_id
     LEFT JOIN authors a ON ba.author_id = a.id
     WHERE b.id = ? AND b.status = "activo"
     GROUP BY b.id`,
    [id]
  );
  return rows.length > 0 ? (rows[0] as Book) : null;
};