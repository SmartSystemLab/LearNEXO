import express, { Request, Response } from 'express';
import AuthController from './auth.controller';
import { createUserValidation, loginUserValidation, onboardingValidation, verifyValidation } from './types/validation.schema.type';
import { validateRequest } from '../middleware/validation';
import { LoginDto, OnboardingDto, SignUpDto, VerifyDto } from './types/dto.types';
import { AuthenticatedRequest, verifyJwt } from '../middleware/verifyJwt';
import multer from "multer";
import { parseFormData } from "../middleware/parseFormData"

const upload = multer({ dest: "uploads/" });
const authRoute = express.Router();


authRoute.post('/sign-up', validateRequest(createUserValidation),
 async (req: Request<{}, {}, SignUpDto>, res: Response<any>): Promise<any> => {
    const authService = new AuthController();
    const data = await authService.signUp(req.body)
    const { statusCode, ...responseData } = data;
    return res.status(statusCode).send({ ...responseData });
});

authRoute.post('/login', validateRequest(loginUserValidation),
 async (req: Request<{}, {}, LoginDto>, res: Response<any>): Promise<any> => {
    const authService = new AuthController();
    const data = await authService.login(req.body)
    const { statusCode, ...responseData } = data;
    return res.status(statusCode).send({ ...responseData });
});

authRoute.post('/verify-otp', validateRequest(verifyValidation),
 async (req: Request<{}, {}, VerifyDto>, res: Response<any>): Promise<any> => {
    const authService = new AuthController();
    const data = await authService.verifyOtp(req.body)
    const { statusCode, ...responseData } = data;
    return res.status(statusCode).send({ ...responseData });
    });

authRoute.post('/verify-forgot-password-otp', validateRequest(verifyValidation),
 async (req: Request<{}, {}, VerifyDto>, res: Response<any>): Promise<any> => {
    const authService = new AuthController();
    const data = await authService.verify(req.body)
    const { statusCode, ...responseData } = data;
    return res.status(statusCode).send({ ...responseData });
});

authRoute.post('/reset-password', validateRequest(loginUserValidation),
 async (req: Request<{}, {}, LoginDto>, res: Response<any>): Promise<any> => {
    const authService = new AuthController();
    const data = await authService.resetPassword(req.body)
    const { statusCode, ...responseData } = data;
    return res.status(statusCode).send({ ...responseData });
});

authRoute.get('/send-otp/:email',
 async (req: Request<{email: string}, {}>, res: Response<any>): Promise<any> => {
    const authService = new AuthController();
    const data = await authService.sendOtp(req.params.email)
    const { statusCode, ...responseData } = data;
    return res.status(statusCode).send({ ...responseData });
});

authRoute.post(
  '/onboarding',
  verifyJwt,
  upload.single("photo"),
  parseFormData,
  validateRequest(onboardingValidation),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({
        status: false,
        message: "Photo is required",
});
        return;
    }

    // const authService = new AuthController();

    // const data = await authService.onboarding(req.body, req.user.id, req.file);

    // const { statusCode, ...responseData } = data;
    // res.status(statusCode).send(responseData);
  },
);

export default authRoute;