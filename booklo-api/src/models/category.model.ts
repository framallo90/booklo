import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Category {
    id: number;
    name: string;
    is_active: boolean;
}

export const findAll = async (): Promise<Category[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC'
    );
    return rows as Category[];
}

export const findById = async (id: number): Promise<Category | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM categories WHERE id = ? AND is_active = TRUE',
    [id]
  );
  return rows.length > 0 ? (rows[0] as Category) : null;
};

export const create = async (name: string): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO categories (name) VALUES (?)',
    [name]
  );
  return result.insertId;
};

export const update = async (id: number, name: string): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE categories SET name = ? WHERE id = ? AND is_active = TRUE',
    [name, id]
  );
  return result.affectedRows > 0;
};

export const deactivate = async (id: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE categories SET is_active = FALSE WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};
