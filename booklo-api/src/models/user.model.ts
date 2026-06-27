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

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  created_at: Date;
  order_count: number;
}

export const findAll = async (
  search: string,
  page: number,
  limit: number
): Promise<{ data: UserListItem[]; total: number }> => {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (search) {
    conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [[{ total }]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM users u ${where}`,
    params
  ) as any;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.id, u.name, u.email, u.role_id, u.is_active, u.created_at,
            COUNT(o.id) AS order_count
     FROM users u
     LEFT JOIN orders o ON o.user_id = u.id
     ${where}
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { data: rows as UserListItem[], total };
};

export const setActive = async (id: number, is_active: boolean): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE users SET is_active = ? WHERE id = ?',
    [is_active, id]
  );
  return result.affectedRows > 0;
};

export const setRole = async (id: number, role_id: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE users SET role_id = ? WHERE id = ?',
    [role_id, id]
  );
  return result.affectedRows > 0;
};