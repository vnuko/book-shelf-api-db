import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/response";
import cleanupService from "./../services/CleanupService";
import fileCrawlerService from "../services/FileCrawlerService";
import { Author } from "../models/Author";

class CacheController {
  async doCache(req: Request, res: Response): Promise<void> {
    const startTime: DOMHighResTimeStamp = performance.now();

    try {
      cleanupService.clean();
      const authors: Author[] = await fileCrawlerService.crawl();

      const endTime: DOMHighResTimeStamp = performance.now();
      const durationMs = endTime - startTime;
      const durationSeconds = durationMs / 1000;

      res.status(200).json(
        successResponse(
          {
            authorsProcessed: authors.length,
            processingTimeMs: durationMs.toFixed(2),
            processingTimeSec: durationSeconds.toFixed(2),
          },
          "Data folder processed successfully"
        )
      );
    } catch (err) {
      res
        .status(500)
        .json(
          errorResponse(err instanceof Error ? err.message : (err as string))
        );
    }
  }
}

export default new CacheController();
