import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role_id: number;
  is_active: boolean;
  created_at: Date;
}

export const findByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
    [email]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
};

export const findById = async (id: number): Promise<User | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
    [id]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
};

export const create = async (
  name: string,
  email: string,
  hashedPassword: string,
  role_id: number
): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role_id]
  );
  return result.insertId;
};

export const updateProfile = async (
  id: number,
  name: string,
  email: string
): Promise<void> => {
  await pool.query(
    'UPDATE users SET name = ?, email = ? WHERE id = ?',
    [name, email, id]
  );
};

export const updatePassword = async (
  id: number,
  hashedPassword: string
): Promise<void> => {
  await pool.query(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, id]
  );
};