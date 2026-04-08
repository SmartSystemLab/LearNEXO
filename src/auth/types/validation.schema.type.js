"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingValidation = exports.verifyValidation = exports.loginUserValidation = exports.createUserValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const enums_type_1 = require("./enums.type");
exports.createUserValidation = joi_1.default.object({
    firstName: joi_1.default.string().required().messages({
        'string.empty': 'First name is required',
        'any.required': 'First name is required',
    }),
    lastName: joi_1.default.string().required().messages({
        'string.empty': 'Last name is required',
        'any.required': 'Last name is required',
    }),
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Email must be valid',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
    }),
    userImage: joi_1.default.string().uri().required().messages({
        'string.uri': 'Image must be a valid URL',
        'string.empty': 'Image URL is required',
        'any.required': 'Image URL is required',
    }),
    password: joi_1.default.string().required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
    }),
    role: joi_1.default.string().valid(...Object.values(enums_type_1.EUserRole)).required().messages({
        'any.only': `Role must be one of the following: ${Object.values(enums_type_1.EUserRole).join(', ')}`,
        'string.empty': 'Role is required',
        'any.required': 'Role is required',
    }),
});
exports.loginUserValidation = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Email must be valid',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string().required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
    }),
});
exports.verifyValidation = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Email must be valid',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
    }),
    otp: joi_1.default.string().required().messages({
        'string.empty': 'otp is required',
        'any.required': 'otp is required',
    }),
});
exports.onboardingValidation = joi_1.default.object({
    dateOfBirth: joi_1.default.date().required().messages({
        'date.base': 'Date of birth must be a valid date',
        'any.required': 'Date of birth is required',
    }),
    class: joi_1.default.string().required().messages({
        'string.empty': 'Class is required',
        'any.required': 'Class is required',
    }),
    gender: joi_1.default.string().valid('male', 'female', 'other').required().messages({
        'any.only': 'Gender must be one of: male, female, or other',
        'any.required': 'Gender is required',
    }),
    town: joi_1.default.string().required().messages({
        'string.empty': 'Town is required',
        'any.required': 'Town is required',
    }),
    state: joi_1.default.string().required().messages({
        'string.empty': 'State is required',
        'any.required': 'State is required',
    }),
    schoolName: joi_1.default.string().required().messages({
        'string.empty': 'School name is required',
        'any.required': 'School name is required',
    }),
    stateOfOrigin: joi_1.default.string().required().messages({
        'string.empty': 'state of origin is required',
        'any.required': 'state of origin is required',
    }),
    schoolAddress: joi_1.default.string().required().messages({
        'string.empty': 'School address is required',
        'any.required': 'School address is required',
    }),
    residentialAddress: joi_1.default.string().required().messages({
        'string.empty': 'residential address is required',
        'any.required': 'residential address is required',
    }),
    learningStyle: joi_1.default.string().required().messages({
        'string.empty': 'Learning style is required',
        'any.required': 'Learning style is required',
    }),
    pastExam: joi_1.default.object({
        firstTerm: joi_1.default.string().required().messages({
            'string.empty': 'First term score is required',
            'any.required': 'First term score is required',
        }),
        secondTerm: joi_1.default.string().required().messages({
            'string.empty': 'Second term score is required',
            'any.required': 'Second term score is required',
        }),
        thirdTerm: joi_1.default.string().required().messages({
            'string.empty': 'Third term score is required',
            'any.required': 'Third term score is required',
        }),
    }).required().messages({
        'object.base': 'Past exam must be an object',
        'any.required': 'Past exam data is required',
    }),
    photo: joi_1.default.string().uri().optional().messages({
        'string.uri': 'Photo must be a valid URL',
        'string.empty': 'Photo is required',
        'any.required': 'Photo is required',
    }),
    language: joi_1.default.string().required().messages({
        'string.empty': 'Language is required',
        'any.required': 'Language is required',
    }),
});
//# sourceMappingURL=validation.schema.type.js.map