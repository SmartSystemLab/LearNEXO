import { Request, Response, NextFunction, } from "express";
import jwt from "jsonwebtoken";


export interface AuthenticatedRequest<
  P = Record<string, any>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: any;
  file?: Express.Multer.File;
}

export const verifyJwt = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
     res.status(403).json({ message: "No token provided" });
  }

  try {
    const token = authHeader!.split(" ")[1];

    req.user = jwt.verify(token, process.env.TOKEN_SECRET!);

    next();
  } catch {
     res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
