import { NextFunction, Request, Response } from "express";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.log(err);

  res.status(500).json({ success: false, message: `Internal server error` });
}
