import { AssetFile } from "./AssetFile";
import { Author } from "./Author";
import db from "./../db/db";

export interface BookProps {
  id?: number;
  authorId?: number;
  title?: string;
  subtitle?: string;
  series?: string;
  year?: number;
  readerAgeGroup?: string;
  language?: string;
  description?: string;
  images?: AssetFile[];
  audio?: AssetFile[];
  documents?: AssetFile[];
  authors?: Author[];
}

export class Book {
  constructor(private props: BookProps) {}

  get id() {
    return this.props.id;
  }

  get authorId() {
    return this.props.authorId;
  }

  set authorId(id: number | undefined) {
    this.props.authorId = id;
  }

  get title() {
    return this.props.title ?? "";
  }

  get subtitle() {
    return this.props.subtitle ?? "";
  }

  get series() {
    return this.props.series ?? "";
  }

  get year() {
    return this.props.year ?? 0;
  }

  get readerAgeGroup() {
    return this.props.readerAgeGroup ?? "";
  }

  get language() {
    return this.props.language ?? "";
  }

  get description() {
    return this.props.description ?? "";
  }

  get images(): AssetFile[] {
    return this.props.images ?? [];
  }

  get audio(): AssetFile[] {
    return this.props.audio ?? [];
  }

  get documents(): AssetFile[] {
    return this.props.documents ?? [];
  }

  get authors(): Author[] {
    return this.props.authors ?? [];
  }

  set authors(authors: Author[] | undefined) {
    this.props.authors = authors;
  }

  toJSON(includeAuthors: boolean = true) {
    const result: any = {
      id: this.id,
      authorId: this.authorId, // Include authorId
      title: this.title,
      subtitle: this.subtitle,
      series: this.series,
      year: this.year,
      readerAgeGroup: this.readerAgeGroup,
      language: this.language,
      description: this.description,
      authors: includeAuthors
        ? this.authors.map((author) => author.toJSON(false)) // Prevent deep nesting
        : undefined,
    };

    if (Array.isArray(this.images) && this.images.length > 0) {
      result.images = this.images.map((image) => image.toJSON());
    }

    if (Array.isArray(this.documents) && this.documents.length > 0) {
      result.documents = this.documents.map((document) => document.toJSON());
    }

    if (Array.isArray(this.audio) && this.audio.length > 0) {
      result.audio = this.audio.map((autdio_track) => autdio_track.toJSON());
    }

    return result;
  }

  public save(): Book {
    const query = db.prepare(`
      INSERT INTO books (id, author_id, title, subtitle, series, year, reader_age_group, language, description)
      VALUES (@id, @authorId, @title, @subtitle, @series, @year, @readerAgeGroup, @language, @description)
      ON CONFLICT(id) DO UPDATE SET 
        author_id = excluded.author_id,
        title = excluded.title, 
        subtitle = excluded.subtitle, 
        series = excluded.series,
        year = excluded.year,
        reader_age_group = excluded.reader_age_group,
        language = excluded.language,
        description = excluded.description;
    `);

    const result = query.run({
      id: this.id || null,
      authorId: this.authorId,
      title: this.title,
      subtitle: this.subtitle,
      series: this.series,
      year: this.year,
      readerAgeGroup: this.readerAgeGroup,
      language: this.language,
      description: this.description,
    });

    // If the book was newly inserted, set its ID
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

    // have audio?
    if (Array.isArray(this.audio) && this.audio.length > 0) {
      this.audio.forEach((a) => {
        if (a) {
          a.entityId = this.id as number;
          a.save();
        }
      });
    }

    // have documents?
    if (Array.isArray(this.documents) && this.documents.length > 0) {
      this.documents.forEach((document) => {
        if (document) {
          document.entityId = this.id as number;
          document.save();
        }
      });
    }

    return this;
  }

  static fromRaw(raw: any): Book {
    const bookProps: BookProps = {
      id: raw.id,
      authorId: raw.author_id,
      title: raw.title,
      subtitle: raw.subtitle,
      series: raw.series,
      year: raw.year,
      readerAgeGroup: raw.reader_age_group,
      language: raw.language,
      description: raw.description,
      images: [],
      audio: [],
      documents: [],
      authors: [],
    };

    return new Book(bookProps);
  }
}
