import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { RowDataPacket } from 'mysql2';
import pool from '../config/database';

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totals, ordersByStatus, lowStock, recentOrders, topProducts] = await Promise.all([

      pool.query<RowDataPacket[]>(`
        SELECT
          (SELECT COUNT(*) FROM books WHERE status = 'activo') AS total_books,
          (SELECT COUNT(*) FROM users) AS total_users,
          (SELECT COUNT(*) FROM orders) AS total_orders,
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'cancelado') AS total_revenue
      `),

      pool.query<RowDataPacket[]>(
        'SELECT status, COUNT(*) AS count FROM orders GROUP BY status'
      ),

      pool.query<RowDataPacket[]>(`
        SELECT id, title, stock, product_type
        FROM books WHERE status = 'activo' AND stock <= 5
        ORDER BY stock ASC LIMIT 10
      `),

      pool.query<RowDataPacket[]>(`
        SELECT o.id, u.name AS customer, o.total, o.status, o.created_at
        FROM orders o JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC LIMIT 5
      `),

      pool.query<RowDataPacket[]>(`
        SELECT b.id, b.title, SUM(oi.quantity) AS units_sold
        FROM order_items oi JOIN books b ON oi.book_id = b.id
        GROUP BY b.id, b.title
        ORDER BY units_sold DESC LIMIT 5
      `)
    ]);

    res.json({
      totals: totals[0][0],
      orders_by_status: ordersByStatus[0],
      low_stock: lowStock[0],
      recent_orders: recentOrders[0],
      top_products: topProducts[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};