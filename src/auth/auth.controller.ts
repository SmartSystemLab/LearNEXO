import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest } from "../middleware/verifyJwt";

const authService = new AuthService();

export const signUp = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.signUp(req.body);

  res.status(result.statusCode).json(result);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body);

  res.status(result.statusCode).json(result);
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.params as { email: string };

  const result = await authService.sendOtp(email);

  res.status(result.statusCode).json(result);
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.verifyOtp(req.body);

  res.status(result.statusCode).json(result);
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.resetPassword(req.body);

  res.status(result.statusCode).json(result);
};

export const onboarding = async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthenticatedRequest;
  const result = await authService.onboarding(req.body, req.file, user);

  res.status(result.statusCode).json(result);
};
