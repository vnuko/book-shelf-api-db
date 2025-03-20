import { Request, Response } from "express";

const index = (req: Request, res: Response): void => {
  res.json({ message: "Welcome to Express + TypeScript API" });
};

export default { index };
