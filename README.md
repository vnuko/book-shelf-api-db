# Book Shelf API DB

## Overview

Book Shelf API is a lightweight backend service written in TypeScript for managing collections of audiobooks and text-based books. The service provides an easy-to-use API that scans a dedicated folder (`data/`) with authors and books and stores it a local SQLite database, eliminating the need for an external database.

## How It Works

- The API scans the `data/` folder with your authors and books and builds an internal cache a local DB `(database.sqlite)`.
- The database stores structured data for authors, books, and associated files, allowing efficient querying and filtering.
- The API provides endpoints to fetch authors, books, and related details from the database.

## Source Folder Structure

The `data/` folder must follow an opinionated structure:

- **Authors**: Each author should have a folder named using a lowercase, dash-separated format (e.g., stephen-king).
- **Books**: Inside each author folder, books are stored in their own folders, following the same naming convention (e.g., it, the-shining etc.).
- **Files**: Books can contain text files: `.pdf`, `.txt` and/or supported audio formats: `.mp3`, `.wav`, `.ogg`, `.aac`.
- **Metadata**: Each author and book can have an `info.js` file containing additional structured JSON data.
- **Images**: Authors and books can have associated images (supported formats: `.jpg`, `.jpeg`, `.png`, `.svg`).

## Example of the Metadata Files

### Author Info (`data/stephen-king/info.js`)

```json
{
  "name": "Stephen King",
  "dob": "1947-09-21",
  "bio": "Stephen King is an American author known for his horror, supernatural fiction, suspense, and fantasy novels.",
  "nationality": "American"
}
```

### Book Info (data/stephen-king/the-shining/info.js)

```json
{
  "title": "The Shining",
  "genre": "Horror",
  "year": 1977,
  "language": "English",
  "description": "A psychological horror novel about a family isolated in a haunted hotel.",
  "keywords": ["horror", "psychological", "supernatural"]
}
```

For more information about the file structure, refer to repository `data/` folder

## API Endpoints

### Cache Handling

- `GET /api/cache`: Scans the folder structure and stores the data into the SQLite database.

### Authors Endpoints

- `GET /authors`: Returns all authors.
- `GET /authors/:authorId`: Returns details of a specific author.
- `GET /authors/search`: Searches authors based on query parameters.

### Books Endpoints

- `GET /books`: Returns all books.
- `GET /books/:bookId`: Returns details of a specific book.
- `GET /books/search`: Searches books based on query parameters.

### Query Parameters

#### Authors

- `GET /authors?page=1&limit=30&orderBy=id&orderDir=asc`
- `GET /authors/search?query=king`

#### Books

- `GET /books?page=1&limit=30&orderBy=id&orderDir=asc`
- `GET /books/search?query=shin`

## Performance Considerations

- This system is efficient for small-to-medium collections, ideally up to 500MB–1GB of SQLite database size. Beyond this, performance may degrade due to increased query times and memory usage.
- SQLite performs well for datasets with up to a few million records, but for larger collections, a more scalable database (e.g., PostgreSQL, MySQL) should be considered.
- Read performance is generally fast, but concurrent writes under heavy load may lead to contention since SQLite locks the entire database file for writes (better-sqlite-3 package)
- Since SQLite stores data in a single file, disk I/O speed impacts performance, and using an SSD is recommended for better response times when having bigger collections of data.
