import { Request, Response, NextFunction } from "express";

export const parseFormData = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.body.pastExam) {
      req.body.pastExam = JSON.parse(req.body.pastExam);
    }

    if (req.body.dateOfBirth) {
      req.body.dateOfBirth = new Date(req.body.dateOfBirth);
    }

    next();
  } catch (err: any) {
    res.status(400).json({
      status: false,
      message: "Invalid form data format",
    });
  }
};
