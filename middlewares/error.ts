import { Request, Response, NextFunction } from "express";

class ErrorHandler extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  if (err.name === "CastError") {
    err = new ErrorHandler(`Resource not found. Invalid ${err.path}`, 400);
  } else if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    err = new ErrorHandler(`Duplicate ${key} entered`, 400);
  } else if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler(`Json Web Token is invalid. Please try again!`, 401);
  } else if (err.name === "TokenExpiredError") {
    err = new ErrorHandler(`Json Web Token is expired. Please try again!`, 401);
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorHandler;
