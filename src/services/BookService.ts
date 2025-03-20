import { Book } from "./../models/Book";
import db from "./../db/db";
import { Author } from "../models/Author";

interface BookQueryParams {
  page: number;
  limit: number;
  orderBy: string;
  orderDir: string;
}

interface BookSearchParams {
  query?: string;
}

interface DbRowData {
  book_id: number;
  book_title: string;
  book_subtitle: string;
  book_series: string;
  book_year: number;
  book_reader_age_group: string;
  book_language: string;
  book_description: string;
  image_id?: number;
  image_file_url?: string;
  image_name?: string;
  author_book_count?: number;
  author_id?: number;
  author_name?: string;
  author_dob?: string;
  author_bio?: string;
  author_nationality?: string;
}

class BookService {
  private mapToBook(row: DbRowData): Book {
    const book: Book = new Book({
      id: row.book_id,
      title: row.book_title,
      subtitle: row.book_subtitle,
      series: row.book_series,
      year: row.book_year,
      readerAgeGroup: row.book_reader_age_group,
      language: row.book_language,
      description: row.book_description,
    });

    if (row.author_id) {
      book.authors = [
        new Author({
          id: row.author_id,
          name: row.author_name,
          dob: row.author_dob,
          bio: row.author_bio,
          nationality: row.author_nationality,
        }),
      ];
    }

    return book;
  }

  private fetchBooks(query: string, params: any): DbRowData[] {
    const queryStmt = db.prepare(query);
    return queryStmt.all(params) as DbRowData[];
  }

  getBooks(params: BookQueryParams): Book[] {
    const { page, limit, orderBy, orderDir } = params;
    const offset = (page - 1) * limit;
    const validOrderFields = ["title", "year", "reader_age_group", "language"];
    const orderField = validOrderFields.includes(orderBy) ? orderBy : "title";
    const orderDirection = orderDir.toLowerCase() === "desc" ? "DESC" : "ASC";

    const query = `
      SELECT 
        books.id AS book_id, 
        books.title AS book_title, 
        books.subtitle AS book_subtitle, 
        books.series AS book_series, 
        books.year AS book_year, 
        books.reader_age_group AS book_reader_age_group, 
        books.language AS book_language, 
        books.description AS book_description, 
        authors.id AS author_id, 
        authors.name AS author_name, 
        authors.dob AS author_dob, 
        authors.bio AS author_bio, 
        authors.nationality AS author_nationality 
      FROM books
      LEFT JOIN authors ON books.author_id = authors.id
      ORDER BY ${orderField} ${orderDirection}
      LIMIT ? OFFSET ?
    `;

    const rawBooks = this.fetchBooks(query, [limit, offset]);
    return rawBooks.map(this.mapToBook);
  }

  // Get a specific book by ID
  getBook(bookId: number): Book | null {
    const query = `
      SELECT 
        books.id AS book_id, 
        books.title AS book_title, 
        books.subtitle AS book_subtitle, 
        books.series AS book_series, 
        books.year AS book_year, 
        books.reader_age_group AS book_reader_age_group, 
        books.language AS book_language, 
        books.description AS book_description, 
        authors.id AS author_id, 
        authors.name AS author_name, 
        authors.dob AS author_dob, 
        authors.bio AS author_bio, 
        authors.nationality AS author_nationality 
      FROM books
      LEFT JOIN authors ON books.author_id = authors.id
      WHERE books.id = @bookId
    `;

    const rows = this.fetchBooks(query, { bookId });

    if (rows.length === 0) return null;

    const firstRow = rows[0];
    return this.mapToBook(firstRow);
  }

  searchBooks(params: BookSearchParams): Book[] {
    let sql = `
      SELECT 
        books.id AS book_id, 
        books.title AS book_title, 
        books.subtitle AS book_subtitle, 
        books.series AS book_series, 
        books.year AS book_year, 
        books.reader_age_group AS book_reader_age_group, 
        books.language AS book_language, 
        books.description AS book_description, 
        authors.id AS author_id, 
        authors.name AS author_name
      FROM books
      LEFT JOIN authors ON books.author_id = authors.id
      WHERE 1=1
    `;

    const queryParams: BookSearchParams = {};

    if (params.query) {
      sql +=
        " AND (title LIKE '%' || @query || '%' OR subtitle LIKE '%' || @query || '%' OR description LIKE '%' || @query || '%')";
      queryParams.query = params.query;
    }

    const rawBooks = this.fetchBooks(sql, queryParams);

    return rawBooks.map(
      (row) =>
        new Book({
          id: row.book_id,
          title: row.book_title,
          subtitle: row.book_subtitle,
          series: row.book_series,
          year: row.book_year,
          readerAgeGroup: row.book_reader_age_group,
          language: row.book_language,
          description: row.book_description,
          authors: [],
        })
    );
  }
}

export default new BookService();
