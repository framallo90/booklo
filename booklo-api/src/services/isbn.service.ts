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
  cover_url?: string;
  authors: string[];
  source: 'openlibrary' | 'googlebooks';
}

const searchOpenLibrary = async (isbn: string): Promise<ExternalBookData | null> => {
  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const response = await axios.get(url, { timeout: 5000 });
    const data = response.data[`ISBN:${isbn}`];

    if (!data) return null;

    return {
      title: data.title || '',
      subtitle: data.subtitle,
      isbn_10: data.identifiers?.isbn_10?.[0],
      isbn_13: data.identifiers?.isbn_13?.[0],
      publisher: data.publishers?.[0]?.name,
      published_date: data.publish_date,
      page_count: data.number_of_pages,
      cover_url: data.cover?.large || data.cover?.medium,
      authors: data.authors?.map((a: any) => a.name) || [],
      source: 'openlibrary',
    };
  } catch {
    return null;
  }
};

const searchGoogleBooks = async (isbn: string): Promise<ExternalBookData | null> => {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
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
      cover_url: info.imageLinks?.thumbnail?.replace('http://', 'https://'),
      authors: info.authors || [],
      source: 'googlebooks',
    };
  } catch {
    return null;
  }
};

export const searchByISBN = async (isbn: string): Promise<ExternalBookData | null> => {
  const result = await searchOpenLibrary(isbn);
  if (result) return result;
  return searchGoogleBooks(isbn);
};
