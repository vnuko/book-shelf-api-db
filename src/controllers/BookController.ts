import { Request, Response } from "express";
import bookService from "./../services/BookService";
import { successResponse, errorResponse } from "./../utils/response";

class BookController {
  private static readonly PAGE = 1;
  private static readonly LIMIT = 12;
  private static readonly MAX_LIMIT = 50;
  private static readonly ORDER_BY = "name";
  private static readonly ORDER_DIR = "asc";

  getBooks(req: Request, res: Response): void {
    try {
      const page = parseInt(req.query.page as string) || BookController.PAGE;
      let limit = parseInt(req.query.limit as string) || BookController.LIMIT;
      limit = Math.min(limit, BookController.MAX_LIMIT);
      const orderBy = (req.query.orderBy as string) || BookController.ORDER_BY;
      const orderDir =
        (req.query.orderDir as string) || BookController.ORDER_DIR;

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
