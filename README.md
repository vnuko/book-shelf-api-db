# Book Shelf API

## Overview

Book Shelf API is a lightweight, file-based backend service written in TypeScript for managing collectios of audio or text books. The service provides an easy-to-use API that scans a dedicated folder (`data/`) and builds an json response based on the folder structure. This eliminates the need for a database, allowing users to add new authors or books simply by copying files to the server.

## How It Works

- The API crawls through the `data/` folder and builds it's own internal cache consisting of authors, books, and associated files.
- The caching mechanism is used to improve performance by storing the scanned data in `cache/index.json`.
- The API supports endpoints to fetch authors, books, and related details from generated cache.

## Folder Structure

The `data/` folder must follow an opinionated structure:

- **Authors**: Each author should have a folder named using a lowercase, dash-separated format (e.g., `stephen-king`).
- **Books**: Inside each author folder, books are stored in their own folders, following the same naming convention (e.g., `it`, `the-shining`).
- **Files**: Books can contain text files or supported audio formats: `.mp3`, `.wav`, `.ogg`, `.aac`.
- **Metadata**: Each author and book can have an `info.js` file containing structured JSON data.
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

- `GET /api/cache` → Scans the folder structure and builds `cache/index.json`.

### Author Endpoints

- `GET /authors` → Returns all authors.
- `GET /authors/:authorId` → Returns details of a specific author.
- `GET /authors/:authorId/books` → Returns books by a specific author.
- `GET /authors/:authorId/books/:bookId` → Returns details of a specific book.

## Performance Considerations

- This system is efficient for small-to-medium collections (e.g., up to ~50MB of chached JSON data). Don't use it for large datasets!
- For larger datasets, a database based solution should be implemented.
- The caching mechanism significantly reduces file system reads, improving response times, however there might me a memory impact for large datases, while they are being loded in memory.
