import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/response";
import cleanupService from "./../services/CleanupService";
import fileCrawlerService from "../services/FileCrawlerService";

class CacheController {
  async doCache(req: Request, res: Response): Promise<void> {
    const startTime: DOMHighResTimeStamp = performance.now();

    try {
      cleanupService.clean();
      await fileCrawlerService.crawl();

      res.status(200).json(successResponse([], "Cached successfully"));
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
