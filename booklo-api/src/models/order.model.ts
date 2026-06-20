import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { CartItem } from './cart.model';

export interface Order {
  id: number;
  user_id: number;
  status: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
  total: number;
  payment_method: string;
  notes: string;
  created_at: Date;
}

export const create = async (
  userId: number,
  items: CartItem[],
  paymentMethod?: string,
  notes?: string
): Promise<number> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [orderResult] = await connection.query<ResultSetHeader>(
      'INSERT INTO orders (user_id, total, payment_method, notes) VALUES (?, ?, ?, ?)',
      [userId, total, paymentMethod || null, notes || null]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      const subtotal = item.price * item.quantity;
      await connection.query(
        'INSERT INTO order_items (order_id, book_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.book_id, item.quantity, item.price, subtotal]
      );
      await connection.query(
        'UPDATE books SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.book_id]
      );
      await connection.query(
        'INSERT INTO stock_movements (book_id, type, quantity, reason) VALUES (?, "venta", ?, ?)',
        [item.book_id, item.quantity, `Pedido #${orderId}`]
      );
    }

    await connection.query(
      'DELETE ci FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE c.user_id = ?',
      [userId]
    );

    await connection.commit();
    return orderId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const findByUser = async (userId: number): Promise<Order[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows as Order[];
};

export const findById = async (orderId: number, userId: number): Promise<(Order & { items: any[] }) | null> => {
  const [orders] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId]
  );
  if (orders.length === 0) return null;
  const [items] = await pool.query<RowDataPacket[]>(
    `SELECT oi.*, b.title, b.cover_url FROM order_items oi
     JOIN books b ON oi.book_id = b.id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return { ...(orders[0] as Order), items: items as any[] };
};

export const updateStatus = async (
  orderId: number,
  status: Order['status']
): Promise<void> => {
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
};

export const findAll = async (status?: string): Promise<(Order & { user_email: string })[]> => {
  let query = `
    SELECT o.*, u.email as user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
  `;
  const params: any[] = [];
  if (status) {
    query += ' WHERE o.status = ?';
    params.push(status);
  }
  query += ' ORDER BY o.created_at DESC';
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows as (Order & { user_email: string })[];
};

export const findByIdAdmin = async (orderId: number): Promise<(Order & { user_email: string; items: any[] }) | null> => {
  const [orders] = await pool.query<RowDataPacket[]>(
    'SELECT o.*, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
    [orderId]
  );
  if (orders.length === 0) return null;
  const [items] = await pool.query<RowDataPacket[]>(
    `SELECT oi.*, b.title, b.cover_url FROM order_items oi
     JOIN books b ON oi.book_id = b.id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return { ...(orders[0] as Order & { user_email: string }), items: items as any[] };
};