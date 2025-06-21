import Joi from "joi";
import { EUserRole } from "./enums.type";

export const createUserValidation = Joi.object({
    firstName: Joi.string().required().messages({
        'string.empty': 'First name is required',
        'any.required': 'First name is required',
    }),
    lastName: Joi.string().required().messages({
        'string.empty': 'Last name is required',
        'any.required': 'Last name is required',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be valid',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
    }),
    userImage: Joi.string().uri().required().messages({
        'string.uri': 'Image must be a valid URL',
        'string.empty': 'Image URL is required',
        'any.required': 'Image URL is required',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
    }),
    role: Joi.string().valid(...Object.values(EUserRole)).required().messages({
        'any.only': `Role must be one of the following: ${Object.values(EUserRole).join(', ')}`,
        'string.empty': 'Role is required',
        'any.required': 'Role is required',
    }),
});

export const loginUserValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be valid',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
    }),
});

export const verifyValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be valid',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
    }),
    otp: Joi.string().required().messages({
        'string.empty': 'otp is required',
        'any.required': 'otp is required',
    }),
});