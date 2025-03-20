import { Router } from "express";
import authorController from "./../controllers/AuthorController";

const router: Router = Router();

router.get("/", authorController.getAuthors);
router.get("/:authorId", authorController.getAuthor);
router.get("/search", authorController.searchAuthors);

export default router;
