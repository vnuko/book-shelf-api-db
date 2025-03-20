import { AssetFile } from "./AssetFile";
import { Book } from "./Book";
import db from "./../db/db";
import { AssetFileType } from "../enums/AssetFileType";

export interface AuthorProps {
  id?: number;
  name?: string;
  dob?: string; // ISO 8601 format (YYYY-MM-DD)
  bio?: string;
  nationality?: string;
  bookCount?: number;
  books?: Book[];
  images?: AssetFile[];
}

export class Author {
  constructor(private props: AuthorProps = {}) {}

  // Getters
  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name ?? "";
  }
  get dob() {
    return this.props.dob ?? "";
  }
  get bio() {
    return this.props.bio ?? "";
  }
  get nationality() {
    return this.props.nationality ?? "";
  }
  get books() {
    return this.props.books ?? undefined;
  }
  set books(books: Book[] | undefined) {
    this.props.books = books;
  }
  get images() {
    return this.props.images ?? [];
  }
  set images(images: AssetFile[] | undefined) {
    this.props.images = images;
  }
  get bookCount() {
    return this.props.bookCount;
  }
  set bookCount(bookCount: number | undefined) {
    this.props.bookCount = bookCount;
  }

  toJSON(includeBooks: boolean = true): any {
    const result: any = {
      id: this.id,
      name: this.name,
      dob: this.dob,
      bio: this.bio,
      nationality: this.nationality,
      bookCount: this.bookCount,
    };

    if (Array.isArray(this.books) && this.books.length > 0) {
      result.books = this.books.map((book) => book.toJSON(false));
    }

    if (Array.isArray(this.images) && this.images.length > 0) {
      result.images = this.images.map((image) => image.toJSON());
    }

    return result;
  }

  public save(): Author {
    const query = db.prepare(`
      INSERT INTO authors (id, name, dob, bio, nationality)
      VALUES (@id, @name, @dob, @bio, @nationality)
      ON CONFLICT(id) DO UPDATE SET 
        name = excluded.name, 
        dob = excluded.dob, 
        bio = excluded.bio, 
        nationality = excluded.nationality;
    `);

    const result = query.run({
      id: this.id ?? null, // Null triggers AUTOINCREMENT if id is undefined
      name: this.name,
      dob: this.dob,
      bio: this.bio,
      nationality: this.nationality,
    });

    // If id was undefined, return the last inserted row id
    if (!this.id) {
      this.props.id = result.lastInsertRowid as number;
    }

    // have images?
    if (Array.isArray(this.images) && this.images.length > 0) {
      this.images.forEach((image) => {
        if (image) {
          image.entityId = this.id as number;
          image.save();
        }
      });
    }

    // have books?
    if (Array.isArray(this.books) && this.books.length > 0) {
      this.books.forEach((book) => {
        if (book) {
          book.authorId = this.id as number;
          book.save();
        }
      });
    }

    return this;
  }

  static fromRaw(row: any): Author {
    return new Author({
      id: row.id,
      name: row.name,
      dob: row.dob,
      bio: row.bio,
      nationality: row.nationality,
      bookCount: row.bookCount,
      images: row.images,
    });
  }
}
