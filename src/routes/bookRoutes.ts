import { Router } from "express";
import bookController from "./../controllers/BookController";

const router: Router = Router();

router.get("/", bookController.getBooks);
router.get("/search", bookController.searchBooks);
router.get("/:bookId", bookController.getBook);

export default router;
