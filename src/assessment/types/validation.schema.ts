import Joi from "joi";

export const createQuestionValidation = Joi.array().items(
  Joi.object({
    questionNumber: Joi.string().required().messages({
      'string.empty': 'Question number is required',
      'any.required': 'Question number is required',
    }),

    question: Joi.string().required().messages({
      'string.empty': 'Question text is required',
      'any.required': 'Question text is required',
    }),

    options: Joi.object({
      a: Joi.string().required().messages({
        'string.empty': 'Option A is required',
        'any.required': 'Option A is required',
      }),
      b: Joi.string().required().messages({
        'string.empty': 'Option B is required',
        'any.required': 'Option B is required',
      }),
      c: Joi.string().required().messages({
        'string.empty': 'Option C is required',
        'any.required': 'Option C is required',
      }),
      d: Joi.string().required().messages({
        'string.empty': 'Option D is required',
        'any.required': 'Option D is required',
      }),
      e: Joi.string().required().messages({
        'string.empty': 'Option E is required',
        'any.required': 'Option E is required',
      }),
    }).required().messages({
      'object.base': 'Options must be an object with choices a to e',
      'any.required': 'Options are required',
    }),

    answer: Joi.string().valid('a', 'b', 'c', 'd', 'e').optional().messages({
      'any.only': 'Answer must be one of: a, b, c, d, or e',
      'string.empty': 'Answer is required',
      'any.required': 'Answer is required',
    }),

    category: Joi.string().valid('Assessment', 'Questionnaire').optional().messages({
      'any.only': 'Category must be either Assessment or Questionnaire',
      'string.empty': 'Category is required',
      'any.required': 'Category is required',
    }),
  })
);
