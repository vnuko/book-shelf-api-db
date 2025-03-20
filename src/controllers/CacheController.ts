import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/response";
import { FileCrawler } from "../services/FileCrawler";

class CacheController {
  async doCache(req: Request, res: Response): Promise<void> {
    const startTime: DOMHighResTimeStamp = performance.now();

    try {
      const fileCrawler = new FileCrawler();
      await fileCrawler.crawl();

      res.status(200).json(successResponse([], "Cached successfully"));
    } catch (err: unknown) {
      res
        .status(500)
        .json(
          errorResponse(err instanceof Error ? err.message : (err as string))
        );
    }
  }
}

export default new CacheController();
