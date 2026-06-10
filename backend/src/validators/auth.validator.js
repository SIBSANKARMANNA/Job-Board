const Joi = require('joi');

const passwordRules = Joi.string()
  .min(8)
  .max(64)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .messages({
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'string.min': 'Password must be at least 8 characters',
  });

exports.registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: passwordRules.required(),
  role: Joi.string().valid('applicant', 'employer').default('applicant'),
  companyName: Joi.when('role', {
    is: 'employer',
    then: Joi.string().min(2).max(100).trim().required().messages({
      'any.required': 'Company name is required for employers',
    }),
    otherwise: Joi.string().max(100).trim().optional(),
  }),
  bio: Joi.string().max(500).trim().optional(),
  skills: Joi.array().items(Joi.string().trim()).max(20).optional(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

exports.changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordRules.required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});