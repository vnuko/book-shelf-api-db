import fs from "fs/promises";
import mm from "music-metadata";
import path from "path";
import { readJson, logAndRethrow, logOnly } from "../utils/helpers";
import { Book, BookProps } from "../models/Book";
import { Author, AuthorProps } from "../models/Author";
import { DATA_DIR, INFO_FILE } from "../config/config";
import { AssetFile } from "../models/AssetFile";
import { AssetFileType } from "../enums/AssetFileType";
import { EntityType } from "../enums/EntityType";

class FileCrawlerService {
  public async crawl(): Promise<Author[]> {
    try {
      await fs.access(DATA_DIR);
    } catch (err: unknown) {
      logAndRethrow(
        "The 'data' folder cannot be accessed! Please ensure that the folder exists and/or you have the correct permissions.",
        err
      );
    }

    return await this.crawlAuthors(DATA_DIR);
  }

  private async crawlAuthors(dataPath: string): Promise<Author[]> {
    const authors: Author[] = [];
    const authorDirs: string[] = await this.listDirectories(dataPath);

    for (const authorDir of authorDirs) {
      const authorPath: string = path.join(dataPath, authorDir);

      const authorInfo: Partial<AuthorProps> = await this.getAuthorInfo(
        authorPath
      );
      const authorImages: AssetFile[] = await this.getImages(
        authorPath,
        EntityType.AUTHOR
      );
      const authorBooks: Book[] = await this.crawlBooks(authorPath);

      const author = new Author({
        ...authorInfo,
        books: authorBooks,
        images: authorImages,
      });

      author.save();
      authors.push(author);
    }

    return authors;
  }

  private async crawlBooks(authorPath: string): Promise<Book[]> {
    const books: Book[] = [];
    const bookDirs: string[] = await this.listDirectories(authorPath);

    for (const bookDir of bookDirs) {
      const bookPath: string = path.join(authorPath, bookDir);

      const bookInfo: Partial<BookProps> = await this.getBookInfo(bookPath);
      const bookImages: AssetFile[] = await this.getImages(
        bookPath,
        EntityType.BOOK
      );

      const bookAudio: AssetFile[] = await this.getAudio(
        bookPath,
        EntityType.BOOK
      );

      const bookDocuments: AssetFile[] = await this.getDocuments(
        bookPath,
        EntityType.BOOK
      );

      books.push(
        new Book({
          ...bookInfo,
          images: bookImages,
          audio: bookAudio,
          documents: bookDocuments,
        })
      );
    }

    return books;
  }

  private async listDirectories(basePath: string): Promise<string[]> {
    const items = await fs.readdir(basePath);
    const directories: string[] = [];

    for (const item of items) {
      const fullPath = path.join(basePath, item);
      try {
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
          directories.push(item);
        }
      } catch (error: unknown) {
        logOnly(`Failed to process directory: ${fullPath}`, error);
      }
    }

    return directories;
  }

  private async getAuthorInfo(
    authorPath: string
  ): Promise<Partial<AuthorProps>> {
    try {
      return await readJson(path.join(authorPath, INFO_FILE));
    } catch (err) {
      logAndRethrow(`Failed to read author info from: ${authorPath}`, err);
    }
  }

  private async getBookInfo(bookPath: string): Promise<Partial<BookProps>> {
    try {
      return await readJson(path.join(bookPath, INFO_FILE));
    } catch (err) {
      logOnly(`Failed to load book info from: ${bookPath}`, err);
      return {};
    }
  }

  private async getImages(
    directoryPath: string,
    type: EntityType
  ): Promise<AssetFile[]> {
    return this.getAssetsByType(
      directoryPath,
      type,
      [".jpg", ".jpeg", ".png", ".svg"],
      AssetFileType.IMAGE
    );
  }

  private async getAudio(
    directoryPath: string,
    type: EntityType
  ): Promise<AssetFile[]> {
    return this.getAssetsByType(
      directoryPath,
      type,
      [".mp3", ".wav", ".ogg", ".aac"],
      AssetFileType.AUDIO
    );
  }

  private async getDocuments(
    directoryPath: string,
    type: EntityType
  ): Promise<AssetFile[]> {
    return this.getAssetsByType(
      directoryPath,
      type,
      [
        ".epub",
        ".mobi",
        ".azw",
        ".azw3",
        ".pdf",
        ".txt",
        ".doc",
        ".docx",
        ".rtf",
        ".html",
        ".fb2",
        ".ibooks",
        ".djvu",
      ],
      AssetFileType.TEXT
    );
  }

  private async getAssetsByType(
    directoryPath: string,
    type: EntityType,
    allowedExtensions: string[],
    fileType: AssetFileType
  ): Promise<AssetFile[]> {
    try {
      let relativePath = path
        .relative(DATA_DIR, directoryPath)
        .split(path.sep)
        .join("/");

      const allFiles = await fs.readdir(directoryPath);

      const matchingFiles = allFiles.filter((file) =>
        allowedExtensions.some((ext) => file.toLowerCase().endsWith(ext))
      );

      const assetFiles: AssetFile[] = [];
      for (const file of matchingFiles) {
        const fullPath = path.join(directoryPath, file);
        const { fileSize, duration } = await this.getFileMetadata(
          fullPath,
          fileType
        );

        assetFiles.push(
          new AssetFile({
            entityType: type,
            fileUrl: `/static/${relativePath}/${file}`.replace("//", "/"),
            fileType: fileType,
            name: file,
            fileSize: fileSize,
            duration: duration,
          })
        );
      }

      return assetFiles;
    } catch (err) {
      logOnly(`Failed to read files from: ${directoryPath}`, err);
      return [];
    }
  }

  private async getFileMetadata(
    filePath: string,
    fileType: AssetFileType
  ): Promise<{ fileSize: number; duration: number | undefined }> {
    try {
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;

      let duration: number | undefined = undefined;
      if (fileType === AssetFileType.AUDIO) {
        try {
          const metadata = await mm.parseFile(filePath);
          duration = metadata.format.duration
            ? metadata.format.duration
            : undefined;
        } catch (err) {
          logOnly(`Error getting duration`, err);
        }
      }

      return { fileSize, duration };
    } catch (err) {
      logOnly(`Error getting file metadata`, err);
      return { fileSize: 0, duration: undefined };
    }
  }
}

export default new FileCrawlerService();
