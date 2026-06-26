import axios from 'axios';

export interface ExternalBookData {
  title: string;
  subtitle?: string;
  isbn_10?: string;
  isbn_13?: string;
  description?: string;
  publisher?: string;
  published_date?: string;
  page_count?: number;
  language?: string;
  binding?: string;
  collection?: string;
  cover_url?: string;
  authors: string[];
  source: 'openlibrary' | 'googlebooks';
}

/**
 * Normaliza un ISBN: elimina guiones, espacios y convierte a mayúsculas.
 * También convierte entre ISBN-10 e ISBN-13 para ampliar la búsqueda.
 */
const normalizeISBN = (isbn: string): string => {
  return isbn.replace(/[-\s]/g, '').trim();
};

/**
 * Convierte ISBN-10 a ISBN-13 agregando prefijo 978 y recalculando el dígito verificador.
 */
const isbn10ToIsbn13 = (isbn10: string): string | null => {
  if (isbn10.length !== 10) return null;
  const base = '978' + isbn10.slice(0, 9);
  const digits = base.split('').map(Number);
  const checksum = digits.reduce((sum, d, i) => sum + d * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (checksum % 10)) % 10;
  return base + check;
};

/**
 * Convierte ISBN-13 (prefijo 978) a ISBN-10 recalculando el dígito verificador.
 */
const isbn13ToIsbn10 = (isbn13: string): string | null => {
  if (isbn13.length !== 13 || !isbn13.startsWith('978')) return null;
  const base = isbn13.slice(3, 12);
  const digits = base.split('').map(Number);
  const sum = digits.reduce((acc, d, i) => acc + d * (10 - i), 0);
  const check = (11 - (sum % 11)) % 11;
  const checkChar = check === 10 ? 'X' : String(check);
  return base + checkChar;
};

/**
 * Devuelve un array con el ISBN original y su variante (10↔13) si aplica.
 */
const getISBNVariants = (isbn: string): string[] => {
  const normalized = normalizeISBN(isbn);
  const variants = [normalized];

  if (normalized.length === 13) {
    const isbn10 = isbn13ToIsbn10(normalized);
    if (isbn10) variants.push(isbn10);
  } else if (normalized.length === 10) {
    const isbn13 = isbn10ToIsbn13(normalized);
    if (isbn13) variants.push(isbn13);
  }

  return variants;
};

/**
 * Busca en Google Books. Con country=AR se obtienen resultados de la región
 * hispanohablante, mejorando la cobertura de ediciones latinoamericanas y españolas.
 */
const searchGoogleBooks = async (isbn: string): Promise<ExternalBookData | null> => {
  try {
    // country=AR prioriza ediciones disponibles en Argentina/Latinoamérica
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&country=AR`;
    const response = await axios.get(url, { timeout: 10000 });
    const items = response.data.items;

    if (!items || items.length === 0) return null;

    const info = items[0].volumeInfo;
    const identifiers = info.industryIdentifiers || [];

    return {
      title: info.title || '',
      subtitle: info.subtitle,
      isbn_10: identifiers.find((i: any) => i.type === 'ISBN_10')?.identifier,
      isbn_13: identifiers.find((i: any) => i.type === 'ISBN_13')?.identifier,
      description: info.description,
      publisher: info.publisher,
      published_date: info.publishedDate,
      page_count: info.pageCount,
      language: info.language ?? undefined,
      cover_url: info.imageLinks?.thumbnail?.replace('http://', 'https://'),
      authors: info.authors || [],
      source: 'googlebooks',
    };
  } catch {
    return null;
  }
};

/**
 * Busca en Open Library. Usa tanto la API de libros como la endpoint REST por ISBN.
 * Open Library tiene buena cobertura de libros en español pero a veces es lenta.
 */
const searchOpenLibrary = async (isbn: string): Promise<ExternalBookData | null> => {
  // Intentar con la API de books primero
  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const response = await axios.get(url, { timeout: 8000 });
    const data = response.data[`ISBN:${isbn}`];

    if (data) {
      return {
        title: data.title || '',
        subtitle: data.subtitle,
        isbn_10: data.identifiers?.isbn_10?.[0],
        isbn_13: data.identifiers?.isbn_13?.[0],
        publisher: data.publishers?.[0]?.name,
        published_date: data.publish_date,
        page_count: data.number_of_pages,
        binding: data.physical_format ?? undefined,
        collection: data.series?.[0]?.name ?? data.series?.[0] ?? undefined,
        cover_url: data.cover?.large || data.cover?.medium,
        authors: data.authors?.map((a: any) => a.name) || [],
        source: 'openlibrary',
      };
    }
  } catch {
    // continuar con el fallback
  }

  // Fallback: endpoint REST de OpenLibrary (más completo para algunos libros)
  try {
    const url = `https://openlibrary.org/isbn/${isbn}.json`;
    const response = await axios.get(url, { timeout: 8000 });
    const data = response.data;

    if (!data || !data.title) return null;

    // El endpoint REST no incluye autores directamente, hay que buscarlos
    let authors: string[] = [];
    if (data.authors?.length) {
      try {
        const authorRequests = data.authors.slice(0, 3).map((a: any) =>
          axios.get(`https://openlibrary.org${a.key}.json`, { timeout: 5000 })
            .then(r => r.data.name || r.data.personal_name || '')
            .catch(() => '')
        );
        authors = (await Promise.all(authorRequests)).filter(Boolean);
      } catch {
        // autores no disponibles
      }
    }

    const identifiers = data.identifiers || {};
    return {
      title: data.title || '',
      subtitle: data.subtitle,
      isbn_10: identifiers.isbn_10?.[0],
      isbn_13: identifiers.isbn_13?.[0],
      publisher: data.publishers?.[0],
      published_date: data.publish_date,
      page_count: data.number_of_pages,
      binding: data.physical_format ?? undefined,
      collection: data.series?.[0]?.name ?? data.series?.[0] ?? undefined,
      cover_url: data.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
        : undefined,
      authors,
      source: 'openlibrary',
    };
  } catch {
    return null;
  }
};


export const searchByISBN = async (isbn: string): Promise<ExternalBookData | null> => {
  const variants = getISBNVariants(isbn);

  // 1. Open Library (primero — sin límite de quota)
  for (const variant of variants) {
    const result = await searchOpenLibrary(variant);
    if (result) return result;
  }

  // 2. Google Books (fallback — tiene quota diaria limitada sin API key)
  for (const variant of variants) {
    const result = await searchGoogleBooks(variant);
    if (result) return result;
  }

  return null;
};
