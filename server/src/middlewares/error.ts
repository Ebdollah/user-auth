import { Request, Response, NextFunction } from "express";

class ErrorHandler extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): Response => {
  let error = { ...err, message: err.message, statusCode: err.statusCode || 500 };

  if (!error.message) {
    error.message = "Internal server error.";
  }

  if (err.name === "CastError") {
    error = new ErrorHandler(`Invalid ${err.path}`, 400);
  }

  if (err.name === "JsonWebTokenError") {
    error = new ErrorHandler("Json Web Token is invalid, Try again.", 400);
  }

  if (err.name === "TokenExpiredError") {
    error = new ErrorHandler("Json Web Token is expired, Try again.", 400);
  }

  if (err.code === 11000) {
    error = new ErrorHandler(`Duplicate ${Object.keys(err.keyValue)} Entered`, 400);
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};

export default ErrorHandler;
