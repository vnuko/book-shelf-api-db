import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/response";
import AuthorService from "../services/AuthorService";

class AuthorController {
  private static readonly PAGE = 1;
  private static readonly LIMIT = 12;
  private static readonly MAX_LIMIT = 50;
  private static readonly ORDER_BY = "name";
  private static readonly ORDER_DIR = "asc";

  getAuthors(req: Request, res: Response): void {
    try {
      const page = parseInt(req.query.page as string) || AuthorController.PAGE;
      let limit = parseInt(req.query.limit as string) || AuthorController.LIMIT;
      limit = Math.min(limit, AuthorController.MAX_LIMIT);
      const orderBy =
        (req.query.orderBy as string) || AuthorController.ORDER_BY;
      const orderDir =
        (req.query.orderDir as string) || AuthorController.ORDER_DIR;

      const authors = AuthorService.getAuthors({
        page,
        limit,
        orderBy,
        orderDir,
      });

      res
        .status(200)
        .json(successResponse(authors.map((author) => author.toJSON())));
    } catch (error) {
      console.error("Error fetching authors:", error);
      res.status(500).json(errorResponse("Failed to fetch authors"));
    }
  }

  getAuthor(req: Request, res: Response): void {
    try {
      const authorId = parseInt(req.params.authorId);
      if (Number.isNaN(authorId)) {
        res.status(400).json(errorResponse("Invalid author ID"));
        return;
      }

      const author = AuthorService.getAuthor(authorId);
      if (!author) {
        res.status(404).json(errorResponse("Author not found"));
        return;
      }

      res.status(200).json(successResponse(author.toJSON()));
    } catch (error) {
      console.error("Error fetching author:", error);
      res.status(500).json(errorResponse("Failed to fetch author"));
    }
  }

  searchAuthors(req: Request, res: Response): void {
    try {
      const query = req.query.query as string;
      const nationality = req.query.nationality as string;

      const authors = AuthorService.searchAuthors({ query, nationality });
      res
        .status(200)
        .json(successResponse(authors.map((author) => author.toJSON())));
    } catch (error) {
      console.error("Error searching authors:", error);
      res.status(500).json(errorResponse("Failed to search authors"));
    }
  }
}

export default new AuthorController();
