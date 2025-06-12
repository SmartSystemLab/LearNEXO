import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.Schema): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.validate(req.body);
        if (result.error) {
            res.status(400).json({
                status: false,
                error: result.error.details[0].message,
                message: result.error.details[0].message,
                data: null
            });
            return;
        }
        next();
    };
};