import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cacheRoutes from "./routes/cache.Routes";
import authorRoutes from "./routes/authorRoutes";
import booksRoutes from "./routes/bookRoutes";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

const DATA_FOLDER = process.env.DATA_FOLDER || "data";
app.use("/static", express.static(path.join(__dirname, "../" + DATA_FOLDER)));

app.use(cors());

app.use("/api/cache", cacheRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/books", booksRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
