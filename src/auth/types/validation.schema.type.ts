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


export const onboardingValidation = Joi.object({
  dateOfBirth: Joi.date().required().messages({
    'date.base': 'Date of birth must be a valid date',
    'any.required': 'Date of birth is required',
  }),

  class: Joi.string().required().messages({
    'string.empty': 'Class is required',
    'any.required': 'Class is required',
  }),

  gender: Joi.string().valid('male', 'female', 'other').required().messages({
    'any.only': 'Gender must be one of: male, female, or other',
    'any.required': 'Gender is required',
  }),

  town: Joi.string().required().messages({
    'string.empty': 'Town is required',
    'any.required': 'Town is required',
  }),

  state: Joi.string().required().messages({
    'string.empty': 'State is required',
    'any.required': 'State is required',
  }),

  schoolName: Joi.string().required().messages({
    'string.empty': 'School name is required',
    'any.required': 'School name is required',
  }),

  stateOfOrigin: Joi.string().required().messages({
    'string.empty': 'state of origin is required',
    'any.required': 'state of origin is required',
  }),

  schoolAddress: Joi.string().required().messages({
    'string.empty': 'School address is required',
    'any.required': 'School address is required',
  }),

  residentialAddress: Joi.string().required().messages({
    'string.empty': 'residential address is required',
    'any.required': 'residential address is required',
  }),

  learningStyle: Joi.string().required().messages({
    'string.empty': 'Learning style is required',
    'any.required': 'Learning style is required',
  }),

  pastExam: Joi.object({
    firstTerm: Joi.string().required().messages({
      'string.empty': 'First term score is required',
      'any.required': 'First term score is required',
    }),
    secondTerm: Joi.string().required().messages({
      'string.empty': 'Second term score is required',
      'any.required': 'Second term score is required',
    }),
    thirdTerm: Joi.string().required().messages({
      'string.empty': 'Third term score is required',
      'any.required': 'Third term score is required',
    }),
  }).required().messages({
    'object.base': 'Past exam must be an object',
    'any.required': 'Past exam data is required',
  }),

  photo: Joi.string().uri().optional().messages({
    'string.uri': 'Photo must be a valid URL',
    'string.empty': 'Photo is required',
    'any.required': 'Photo is required',
  }),

  language: Joi.string().required().messages({
    'string.empty': 'Language is required',
    'any.required': 'Language is required',
  }),
});
