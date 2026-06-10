const Joi = require('joi');

exports.createInternshipSchema = Joi.object({
  title: Joi.string().min(5).max(100).trim().required(),
  companyName: Joi.string().min(2).max(100).trim().required(),
  description: Joi.string().min(20).max(2000).trim().required(),
  location: Joi.string().min(2).max(100).trim().required(),
  type: Joi.string().valid('remote', 'onsite', 'hybrid').required(),
  stipend: Joi.number().min(0).default(0),
  duration: Joi.string().min(2).max(50).trim().required(),
  skills: Joi.array().items(Joi.string().trim().lowercase()).max(20).optional(),
  openings: Joi.number().integer().min(1).default(1),
  applicationDeadline: Joi.date().greater('now').optional().messages({
    'date.greater': 'Application deadline must be in the future',
  }),
});

exports.updateInternshipSchema = Joi.object({
  title: Joi.string().min(5).max(100).trim(),
  companyName: Joi.string().min(2).max(100).trim(),
  description: Joi.string().min(20).max(2000).trim(),
  location: Joi.string().min(2).max(100).trim(),
  type: Joi.string().valid('remote', 'onsite', 'hybrid'),
  stipend: Joi.number().min(0),
  duration: Joi.string().min(2).max(50).trim(),
  skills: Joi.array().items(Joi.string().trim().lowercase()).max(20),
  openings: Joi.number().integer().min(1),
  applicationDeadline: Joi.date().optional().allow(null),
  isActive: Joi.boolean(),
}).min(1); // At least one field required

exports.internshipQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  location: Joi.string().trim().optional(),
  type: Joi.string().valid('remote', 'onsite', 'hybrid').optional(),
  skills: Joi.string().trim().optional(), // comma-separated
  search: Joi.string().trim().max(100).optional(),
  minStipend: Joi.number().min(0).optional(),
  sort: Joi.string().valid('newest', 'oldest', 'stipend_high', 'stipend_low').default('newest'),
});