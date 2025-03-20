import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// DB path
const DB_FILE = path.join(__dirname, "database.sqlite");

// Connection
const db = new Database(DB_FILE);

// Enable foreign keys for integrity
db.pragma("foreign_keys = ON");

// Read and execute schema SQL file
const SCHEMA_PATH = path.join(__dirname, "init.sql");
if (fs.existsSync(SCHEMA_PATH)) {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  db.exec(schema);
}

console.log("Database initialized successfully.");

export default db;
