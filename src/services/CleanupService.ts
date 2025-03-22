import db from "./../db/db";

class CleanupService {
  clean(): void {
    try {
      const transaction = db.transaction(() => {
        db.prepare("DELETE FROM asset_files").run();
        db.prepare("DELETE FROM books").run();
        db.prepare("DELETE FROM authors").run();

        db.prepare("DELETE FROM sqlite_sequence WHERE name='authors'").run();
        db.prepare("DELETE FROM sqlite_sequence WHERE name='books'").run();
        db.prepare(
          "DELETE FROM sqlite_sequence WHERE name='asset_files'"
        ).run();
      });

      transaction();
    } catch (err) {
      throw new Error(
        `Database cleanup failed: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }
}

export default new CleanupService();
