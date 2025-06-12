import express, { Request, Response } from 'express';
import AuthController from './auth.controller';
import { createUserValidation, loginUserValidation } from './types/validation.schema.type';
import { validateRequest } from '../middleware/validation';
import { LoginDto, SignUpDto } from './types/dto.types';

const authRoute = express.Router();

authRoute.post('/sign-in', validateRequest(createUserValidation),
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

export default authRoute;
