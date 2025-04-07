import { Book } from "./../models/Book";
import db from "./../db/db";
import { Author } from "../models/Author";
import { AssetFile } from "../models/AssetFile";

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
  book_image?: string;
  author_book_count?: number;
  author_id?: number;
  author_name?: string;
  author_dob?: string;
  author_bio?: string;
  author_nationality?: string;
  audio_count?: number;
  documents_count?: number;
  image_id?: number;
  image_file_url?: string;
  image_name?: string;
  audio_id?: number;
  audio_file_url?: string;
  audio_name?: string;
  audio_file_size?: number;
  audio_duration?: number;
  audio_language?: string;
  document_id?: number;
  document_file_url?: string;
  document_name?: string;
  document_file_size?: number;
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
      description: row.book_description,
      audioCount: row.audio_count,
      documentsCount: row.documents_count,
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

    if (row.book_image) {
      book.images = [
        new AssetFile({
          fileUrl: row.book_image,
        }),
      ];
    }

    return book;
  }

  private mapToImages(row: DbRowData): AssetFile {
    return new AssetFile({
      id: row.image_id,
      fileUrl: row.image_file_url,
      name: row.image_name,
    });
  }

  private mapToAudio(row: DbRowData): AssetFile {
    return new AssetFile({
      id: row.audio_id,
      fileUrl: row.audio_file_url,
      name: row.audio_name,
      fileSize: row.audio_file_size,
      duration: row.audio_duration,
      language: row.audio_language,
    });
  }

  private mapToDocument(row: DbRowData): AssetFile {
    return new AssetFile({
      id: row.document_id,
      fileUrl: row.document_file_url,
      name: row.document_name,
      fileSize: row.document_file_size,
      language: row.audio_language,
    });
  }

  private fetchBooks(query: string, params: any): DbRowData[] {
    const queryStmt = db.prepare(query);
    return queryStmt.all(params) as DbRowData[];
  }

  getBooks(params: BookQueryParams): Book[] {
    const { page, limit, orderBy, orderDir } = params;
    const offset = (page - 1) * limit;
    const validOrderFields = ["title", "year", "reader_age_group"];
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
        books.description AS book_description, 
        authors.id AS author_id, 
        authors.name AS author_name, 
        authors.dob AS author_dob, 
        authors.bio AS author_bio, 
        authors.nationality AS author_nationality,
        (SELECT asset_files.file_url 
          FROM asset_files 
          WHERE asset_files.entity_id = books.id 
            AND asset_files.entity_type = 'book' 
            AND asset_files.file_type = 'image' 
          ORDER BY asset_files.id ASC LIMIT 1
        ) AS book_image,
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
        ) AS documents_count
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
        books.description AS book_description, 
        authors.id AS author_id, 
        authors.name AS author_name, 
        authors.dob AS author_dob, 
        authors.bio AS author_bio, 
        authors.nationality AS author_nationality, 
        image_files.id AS image_id,
        image_files.file_url AS image_file_url,
        image_files.name AS image_name,
        audio_files.id AS audio_id,
        audio_files.file_url AS audio_file_url,
        audio_files.name AS audio_name,
        audio_files.file_size AS audio_file_size,
        audio_files.duration AS audio_duration,
        audio_files.language AS audio_language,
        documents_files.id AS document_id,
        documents_files.file_url AS document_file_url,
        documents_files.name AS document_name,
        documents_files.file_size AS document_file_size
      FROM books
      LEFT JOIN authors ON books.author_id = authors.id
      LEFT JOIN asset_files AS image_files ON image_files.entity_id = books.id 
        AND image_files.entity_type = 'book' 
        AND image_files.file_type = 'image'
      LEFT JOIN asset_files AS audio_files ON audio_files.entity_id = books.id
        AND audio_files.entity_type = 'book' 
        AND audio_files.file_type = 'audio'
      LEFT JOIN asset_files AS documents_files ON documents_files.entity_id = books.id
        AND documents_files.entity_type = 'book' 
        AND documents_files.file_type = 'text'
      WHERE books.id = @bookId
    `;

    const rows = this.fetchBooks(query, { bookId });

    if (rows.length === 0) return null;

    const firstRow = rows[0];
    const book = this.mapToBook(firstRow);

    const imageMap = new Map<number, any>();
    const audioMap = new Map<number, any>();
    const documentMap = new Map<number, any>();

    rows.forEach((row) => {
      if (row.image_id && !imageMap.has(row.image_id)) {
        imageMap.set(row.image_id, this.mapToImages(row));
      }
      if (row.audio_id && !audioMap.has(row.audio_id)) {
        audioMap.set(row.audio_id, this.mapToAudio(row));
      }
      if (row.document_id && !documentMap.has(row.document_id)) {
        documentMap.set(row.document_id, this.mapToDocument(row));
      }
    });

    book.audioCount = audioMap.size;
    book.documentsCount = documentMap.size;

    book.images = Array.from(imageMap.values());
    book.audio = Array.from(audioMap.values());
    book.documents = Array.from(documentMap.values());

    return book;
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
        books.description AS book_description, 
        authors.id AS author_id, 
        authors.name AS author_name, 
        authors.dob AS author_dob, 
        authors.bio AS author_bio, 
        authors.nationality AS author_nationality,
        (SELECT asset_files.file_url 
          FROM asset_files 
          WHERE asset_files.entity_id = books.id 
            AND asset_files.entity_type = 'book' 
            AND asset_files.file_type = 'image' 
          ORDER BY asset_files.id ASC LIMIT 1
        ) AS book_image,
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
        ) AS documents_count
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

    console.log(rawBooks);

    return rawBooks.map(this.mapToBook);
  }
}

export default new BookService();
