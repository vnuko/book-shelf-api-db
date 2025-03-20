import { Request, Response } from "express";
import bookService from "./../services/BookService";
import { successResponse, errorResponse } from "./../utils/response";

class BookController {
  getBooks(req: Request, res: Response): void {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const orderBy = (req.query.orderBy as string) || "title";
      const orderDir = (req.query.orderDir as string) || "ASC";

      const books = bookService.getBooks({
        page,
        limit,
        orderBy,
        orderDir,
      });

      res.status(200).json(successResponse(books.map((book) => book.toJSON())));
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json(errorResponse("Failed to fetch books"));
    }
  }

  getBook(req: Request, res: Response): void {
    try {
      const bookId = parseInt(req.params.bookId);
      if (Number.isNaN(bookId)) {
        res.status(400).json(errorResponse("Invalid book ID"));
        return;
      }

      const book = bookService.getBook(bookId);
      if (!book) {
        res.status(404).json(errorResponse("Book not found"));
        return;
      }

      res.status(200).json(successResponse(book.toJSON()));
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json(errorResponse("Failed to fetch book"));
    }
  }

  searchBooks(req: Request, res: Response): void {
    try {
      const query = req.query.query as string;

      const books = bookService.searchBooks({
        query,
      });
      res.status(200).json(successResponse(books.map((book) => book.toJSON())));
    } catch (error) {
      console.error("Error searching books:", error);
      res.status(500).json(errorResponse("Failed to search books"));
    }
  }
}

export default new BookController();
