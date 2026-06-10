const Joi = require('joi');

exports.createApplicationSchema = Joi.object({
  coverLetter: Joi.string().min(50).max(1000).trim().required().messages({
    'string.min': 'Cover letter must be at least 50 characters',
    'any.required': 'Cover letter is required',
  }),
  resumeUrl: Joi.string().uri().trim().optional().messages({
    'string.uri': 'Resume URL must be a valid URL',
  }),
});

exports.updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')
    .required(),
  employerNote: Joi.string().max(500).trim().optional(),
});