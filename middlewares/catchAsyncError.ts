import { Request, Response, NextFunction } from "express";
export const catchAsyncErrors = (theFunction: any) => {
  return (req:Request, res:Response, next:NextFunction) => {
    Promise.resolve(theFunction(req, res, next)).catch(next);
  };
};
