import path from "path";
import dotenv from "dotenv";

dotenv.config();

const ROOT_DIR = process.cwd();

export const INFO_FILE = "info.json";

const DATA_FOLDER = process.env.DATA_FOLDER || "data";

export const DATA_DIR = path.join(ROOT_DIR, DATA_FOLDER);
