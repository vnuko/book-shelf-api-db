import { Router } from "express";
import authorController from "./../controllers/AuthorController";

const router: Router = Router();

router.get("/", authorController.getAuthors);
router.get("/search", authorController.searchAuthors);
router.get("/:authorId", authorController.getAuthor);

export default router;
