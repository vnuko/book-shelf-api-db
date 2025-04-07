import { AssetFile } from "../models/AssetFile";
import { Author } from "../models/Author";
import { Book } from "../models/Book";
import db from "./../db/db";

interface AuthorQueryParams {
  page: number;
  limit: number;
  orderBy: string;
  orderDir: string;
}

interface AuthorSearchParams {
  query?: string;
  nationality?: string;
}

interface DbRowData {
  author_id: number;
  author_name: string;
  author_dob: string;
  author_bio: string;
  author_nationality: string;
  author_image: string;
  book_id?: number;
  book_title?: string;
  book_subtitle?: string;
  book_series?: string;
  book_year?: number;
  book_reader_age_group?: string;
  book_language?: string;
  book_description?: string;
  image_id?: number;
  image_file_url?: string;
  image_name?: string;
  author_book_count?: number;
  audio_count?: number;
  document_count?: number;
}

class AuthorService {
  private mapToAuthor(row: DbRowData): Author {
    const author: Author = new Author({
      id: row.author_id,
      name: row.author_name,
      dob: row.author_dob,
      bio: row.author_bio,
      nationality: row.author_nationality,
      bookCount: row.author_book_count,
    });

    if (row.author_image) {
      author.images = [
        new AssetFile({
          fileUrl: row.author_image,
        }),
      ];
    }

    return author;
  }

  private mapToBook(row: DbRowData): Book {
    const book: Book = new Book({
      id: row.book_id,
      title: row.book_title,
      subtitle: row.book_subtitle,
      series: row.book_series,
      year: row.book_year,
      readerAgeGroup: row.book_reader_age_group,
      description: row.book_description,
      audioCount: row.audio_count,
      documentsCount: row.document_count,
    });

    return book;
  }

  private mapToAssetFile(row: DbRowData): AssetFile {
    return new AssetFile({
      id: row.image_id,
      fileUrl: row.image_file_url,
      name: row.image_name,
    });
  }

  private fetchAuthors(query: string, params: any): DbRowData[] {
    const queryStmt = db.prepare(query);
    return queryStmt.all(params) as DbRowData[];
  }

  getAuthors(params: AuthorQueryParams): Author[] {
    const { page, limit, orderBy, orderDir } = params;
    const offset = (page - 1) * limit;
    const validOrderFields = ["name", "dob", "nationality"];
    const orderField = validOrderFields.includes(orderBy) ? orderBy : "name";
    const orderDirection = orderDir.toLowerCase() === "desc" ? "DESC" : "ASC";

    const query = `
      SELECT 
        authors.id AS author_id, 
        authors.name AS author_name, 
        authors.dob AS author_dob, 
        authors.bio AS author_bio, 
        authors.nationality AS author_nationality, 
        COUNT(books.id) AS author_book_count,
        ( SELECT asset_files.file_url 
            FROM asset_files 
            WHERE asset_files.entity_id = authors.id 
            AND asset_files.entity_type = 'author' 
            AND asset_files.file_type = 'image' 
            ORDER BY asset_files.id ASC LIMIT 1
          ) AS author_image
      FROM authors
      LEFT JOIN books ON books.author_id = authors.id
      GROUP BY authors.id
      ORDER BY ${orderField} ${orderDirection} 
      LIMIT ? OFFSET ?
    `;
    const rawAuthors = this.fetchAuthors(query, [limit, offset]);

    return rawAuthors.map(this.mapToAuthor);
  }

  getAuthor(authorId: number): Author | null {
    const query = `
      SELECT 
        authors.id AS author_id, 
        authors.name AS author_name, 
        authors.dob AS author_dob, 
        authors.bio AS author_bio, 
        authors.nationality AS author_nationality,
        books.id AS book_id, 
        books.title AS book_title, 
        books.subtitle AS book_subtitle, 
        books.series AS book_series, 
        books.year AS book_year, 
        books.reader_age_group AS book_reader_age_group,
        books.description AS book_description,
        (SELECT COUNT(*) 
          FROM asset_files 
          WHERE asset_files.entity_id = books.id 
            AND asset_files.entity_type = 'book'
    		AND asset_files.file_type = 'audio'
        ) AS audio_count,
        (SELECT COUNT(*) 
          FROM asset_files 
          WHERE asset_files.entity_id = books.id 
            AND asset_files.entity_type = 'book'
    		AND asset_files.file_type = 'text'
        ) AS documents_count,
        asset_files.id AS image_id, 
        asset_files.file_url AS image_file_url, 
        asset_files.name AS image_name
      FROM authors 
      LEFT JOIN books ON books.author_id = authors.id
      LEFT JOIN asset_files ON asset_files.entity_id = authors.id 
        AND asset_files.entity_type = 'author' 
        AND asset_files.file_type = 'image'
      WHERE authors.id = @authorId
    `;
    const rows = this.fetchAuthors(query, { authorId });

    if (!rows || rows.length === 0) {
      return null;
    }

    const firstRow = rows[0];
    const author = this.mapToAuthor(firstRow);

    const books = rows.filter((row) => row.book_id).map(this.mapToBook);
    const images = rows.filter((row) => row.image_id).map(this.mapToAssetFile);

    author.books = books;
    author.images = images;
    author.bookCount = books.length;

    return author;
  }

  searchAuthors(params: AuthorSearchParams): Author[] {
    let sql = `
      SELECT 
        authors.id AS author_id, 
        authors.name AS author_name, 
        authors.dob AS author_dob, 
        authors.bio AS author_bio, 
        authors.nationality AS author_nationality, 
        COUNT(books.id) AS author_book_count,
        ( SELECT asset_files.file_url 
            FROM asset_files 
            WHERE asset_files.entity_id = authors.id 
            AND asset_files.entity_type = 'author' 
            AND asset_files.file_type = 'image' 
            ORDER BY asset_files.id ASC LIMIT 1
          ) AS author_image
      FROM authors
      LEFT JOIN books ON books.author_id = authors.id
      WHERE 1=1`;

    const queryParams: AuthorSearchParams = {};

    if (params.query) {
      sql +=
        " AND (name LIKE '%' || @query || '%' OR bio LIKE '%' || @query || '%')";
      queryParams.query = params.query;
    }

    if (params.nationality) {
      sql += " AND nationality = @nationality";
      queryParams.nationality = params.nationality;
    }

    sql += " GROUP BY authors.id";

    const rawAuthors = this.fetchAuthors(sql, queryParams);

    return rawAuthors.map(this.mapToAuthor);
  }
}

export default new AuthorService();
