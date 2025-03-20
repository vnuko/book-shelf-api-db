import { Router } from "express";
import bookController from "./../controllers/BookController";

const router: Router = Router();

router.get("/", bookController.getBooks);
router.get("/:bookId", bookController.getBook);
router.get("/search", bookController.searchBooks);

export default router;
