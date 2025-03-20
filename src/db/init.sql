PRAGMA foreign_keys = ON;

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dob TEXT,  -- ISO 8601 format (YYYY-MM-DD)
    bio TEXT,
    nationality TEXT
);

-- Books table (without the author_id column)
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,  -- Added author_id
    title TEXT NOT NULL,
    subtitle TEXT,
    series TEXT,
    year INTEGER,
    reader_age_group TEXT,
    language TEXT,
    description TEXT,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS asset_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL,
    entity_type TEXT CHECK (entity_type IN ('author', 'book')),
    file_url TEXT NOT NULL,
    file_type TEXT CHECK (file_type IN ('image', 'audio', 'text')),
    name TEXT
);

-- Index for authors table
CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);

-- Indexes for books table
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id);  -- Index for author_id

-- Indexes for files table
CREATE INDEX IF NOT EXISTS idx_files_book ON asset_files(entity_id, entity_type, file_type);