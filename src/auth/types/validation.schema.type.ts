import Joi from "joi";
import { EUserRole } from "./enums.type";

export const createUserValidation = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().allow('', null),
    password: Joi.string().required(),
    role: Joi.string().valid(...Object.values(EUserRole)).required()
})