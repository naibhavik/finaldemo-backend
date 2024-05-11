import  User  from "../models/userSchema";
import { catchAsyncErrors } from "./catchAsyncError";
import ErrorHandler from "./error";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from "express";
dotenv.config();
interface CustomRequest extends Request {
  user?: any;
  files?: any;
  id?:any;
}
export const isAuthenticated = catchAsyncErrors(
  async (req:CustomRequest, res: Response, next: NextFunction) => {
    const { token } = req.cookies;
    if (!token) {
      return next(new ErrorHandler("User Not Authorized", 401));
    }

    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("jwt_secretkey is not defined in environment variables.");
    }

    const decoded:any = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = await User.findById(decoded.id);

    next();
  }
);
