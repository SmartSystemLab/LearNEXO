"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuestionValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createQuestionValidation = joi_1.default.array().items(joi_1.default.object({
    questionNumber: joi_1.default.string().required().messages({
        'string.empty': 'Question number is required',
        'any.required': 'Question number is required',
    }),
    question: joi_1.default.string().required().messages({
        'string.empty': 'Question text is required',
        'any.required': 'Question text is required',
    }),
    options: joi_1.default.object({
        a: joi_1.default.string().required().messages({
            'string.empty': 'Option A is required',
            'any.required': 'Option A is required',
        }),
        b: joi_1.default.string().required().messages({
            'string.empty': 'Option B is required',
            'any.required': 'Option B is required',
        }),
        c: joi_1.default.string().required().messages({
            'string.empty': 'Option C is required',
            'any.required': 'Option C is required',
        }),
        d: joi_1.default.string().required().messages({
            'string.empty': 'Option D is required',
            'any.required': 'Option D is required',
        }),
        e: joi_1.default.string().required().messages({
            'string.empty': 'Option E is required',
            'any.required': 'Option E is required',
        }),
    }).required().messages({
        'object.base': 'Options must be an object with choices a to e',
        'any.required': 'Options are required',
    }),
    answer: joi_1.default.string().valid('a', 'b', 'c', 'd', 'e').optional().messages({
        'any.only': 'Answer must be one of: a, b, c, d, or e',
        'string.empty': 'Answer is required',
        'any.required': 'Answer is required',
    }),
    category: joi_1.default.string().valid('Assessment', 'Questionnaire').optional().messages({
        'any.only': 'Category must be either Assessment or Questionnaire',
        'string.empty': 'Category is required',
        'any.required': 'Category is required',
    }),
}));
//# sourceMappingURL=validation.schema.js.map