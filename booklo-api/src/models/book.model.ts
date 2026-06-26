import pool from '../config/database';
import { RowDataPacket, ResultSetHeader, OkPacket } from 'mysql2';



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
  condition: 'nuevo' | 'usado';
  binding: string;
  collection: string;
  weight_grams: number;
  country: string;
  dimensions: string;
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
  condition?: 'nuevo' | 'usado';
  publisher?: string;
  language?: string;
  available?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface BooksPage {
  data: Book[];
  total: number;
  page: number;
  limit: number;
}

export const findAll = async (filters: BookFilters = {}): Promise<BooksPage> => {
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

  if (filters.condition) {
    conditions.push('b.condition = ?');
    params.push(filters.condition);
  }

  if (filters.publisher) {
    conditions.push('b.publisher LIKE ?');
    params.push(`%${filters.publisher}%`);
  }

  if (filters.language) {
    conditions.push('b.language = ?');
    params.push(filters.language);
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

  const countSql = `SELECT COUNT(*) AS total FROM books b WHERE ${where}`;
  const [countRows] = await pool.query<RowDataPacket[]>(countSql, params);
  const total = (countRows[0] as any).total;

  const dataSql = `
    SELECT b.id, b.title, b.cover_url, b.price, b.original_price,
           b.stock, b.product_type, b.condition, b.publisher, b.published_date,
           c.name AS category_name,
           GROUP_CONCAT(a.name SEPARATOR ', ') AS authors
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN book_authors ba ON b.id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.id
    WHERE ${where}
    GROUP BY b.id
    ORDER BY b.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await pool.query<RowDataPacket[]>(dataSql, [...params, limit, offset]);

  return { data: rows as Book[], total, page, limit };
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

export interface BookData {
  title: string;
  subtitle?: string;
  isbn_10?: string;
  isbn_13?: string;
  description?: string;
  publisher?: string;
  published_date?: string;
  page_count?: number;
  language?: string;
  cover_url?: string;
  price: number;
  original_price?: number;
  original_currency?: string;
  stock?: number;
  product_type: 'libro' | 'comic' | 'manga' | 'revista';
  condition?: 'nuevo' | 'usado';
  binding?: string;
  collection?: string;
  weight_grams?: number;
  country?: string;
  dimensions?: string;
  featured?: boolean;
  allows_backorder?: boolean;
  category_id?: number;
  authors?: string[];
}

export const create = async (data: BookData): Promise<number> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [bookResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO books (title, subtitle, isbn_10, isbn_13, description, publisher,
        published_date, page_count, language, cover_url, price, original_price,
        original_currency, stock, product_type, \`condition\`, binding, collection,
        weight_grams, country, dimensions, featured, allows_backorder, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title, data.subtitle || null, data.isbn_10 || null, data.isbn_13 || null,
        data.description || null, data.publisher || null, data.published_date || null,
        data.page_count || null, data.language || null, data.cover_url || null,
        data.price, data.original_price || null, data.original_currency || 'ARS',
        data.stock || 0, data.product_type, data.condition || 'nuevo',
        data.binding || null, data.collection || null, data.weight_grams || null,
        data.country || null, data.dimensions || null,
        data.featured || false, data.allows_backorder || false, data.category_id || null
      ]
    );

    const bookId = bookResult.insertId;

    if (data.authors && data.authors.length > 0) {
      for (const authorName of data.authors) {
        const [authorResult] = await connection.query<ResultSetHeader>(
          'INSERT INTO authors (name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
          [authorName]
        );
        await connection.query(
          'INSERT IGNORE INTO book_authors (book_id, author_id) VALUES (?, ?)',
          [bookId, authorResult.insertId]
        );
      }
    }

    await connection.commit();
    return bookId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const update = async (id: number, data: Partial<BookData>): Promise<boolean> => {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.title !== undefined) { fields.push('title = ?'); params.push(data.title); }
  if (data.subtitle !== undefined) { fields.push('subtitle = ?'); params.push(data.subtitle); }
  if (data.isbn_10 !== undefined) { fields.push('isbn_10 = ?'); params.push(data.isbn_10); }
  if (data.isbn_13 !== undefined) { fields.push('isbn_13 = ?'); params.push(data.isbn_13); }
  if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
  if (data.price !== undefined) { fields.push('price = ?'); params.push(data.price); }
  if (data.stock !== undefined) { fields.push('stock = ?'); params.push(data.stock); }
  if (data.featured !== undefined) { fields.push('featured = ?'); params.push(data.featured); }
  if (data.allows_backorder !== undefined) { fields.push('allows_backorder = ?'); params.push(data.allows_backorder); }
  if (data.category_id !== undefined) { fields.push('category_id = ?'); params.push(data.category_id); }
  if (data.cover_url !== undefined)      { fields.push('cover_url = ?');      params.push(data.cover_url); }
  if (data.condition !== undefined)      { fields.push('`condition` = ?');    params.push(data.condition); }
  if (data.binding !== undefined)        { fields.push('binding = ?');        params.push(data.binding); }
  if (data.collection !== undefined)     { fields.push('collection = ?');     params.push(data.collection); }
  if (data.weight_grams !== undefined)   { fields.push('weight_grams = ?');   params.push(data.weight_grams); }
  if (data.country !== undefined)        { fields.push('country = ?');        params.push(data.country); }
  if (data.dimensions !== undefined)     { fields.push('dimensions = ?');     params.push(data.dimensions); }
  if (data.original_price !== undefined) { fields.push('original_price = ?'); params.push(data.original_price); }
  if (data.publisher !== undefined)      { fields.push('publisher = ?');      params.push(data.publisher); }
  if (data.language !== undefined)       { fields.push('language = ?');       params.push(data.language); }

  if (fields.length === 0) return false;

  params.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE books SET ${fields.join(', ')} WHERE id = ?`,
    params
  );
  return result.affectedRows > 0;
};

export const deactivate = async (id: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE books SET status = "inactivo" WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

export const logImport = async (
  isbn: string,
  source: string,
  rawResponse: object
): Promise<void> => {
  await pool.query(
    'INSERT INTO external_imports (isbn, source, raw_response) VALUES (?, ?, ?)',
    [isbn, source, JSON.stringify(rawResponse)]
  );
};

