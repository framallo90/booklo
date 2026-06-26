import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

const SELECT_FIELDS = `
  b.id, b.title, b.cover_url, b.price, b.original_price,
  b.stock, b.product_type, b.condition, b.publisher,
  c.name AS category_name,
  GROUP_CONCAT(a.name SEPARATOR ', ') AS authors
`;

const JOINS = `
  LEFT JOIN categories c ON b.category_id = c.id
  LEFT JOIN book_authors ba ON b.id = ba.book_id
  LEFT JOIN authors a ON ba.author_id = a.id
`;

export const getFeatured = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT ${SELECT_FIELDS}
    FROM books b ${JOINS}
    WHERE b.featured = true AND b.status = 'activo'
    GROUP BY b.id
    LIMIT 8
  `);
  return rows;
};

export const getNovedades = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT ${SELECT_FIELDS}
    FROM books b ${JOINS}
    WHERE b.status = 'activo'
    GROUP BY b.id
    ORDER BY b.created_at DESC
    LIMIT 8
  `);
  return rows;
};

export const getTopVentas = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT ${SELECT_FIELDS},
           COALESCE(SUM(oi.quantity), 0) AS sales_count
    FROM books b ${JOINS}
    LEFT JOIN order_items oi ON oi.book_id = b.id
    LEFT JOIN orders o ON o.id = oi.order_id AND o.status != 'cancelado'
    WHERE b.status = 'activo'
    GROUP BY b.id
    HAVING sales_count > 0
    ORDER BY sales_count DESC
    LIMIT 8
  `);
  return rows;
};
