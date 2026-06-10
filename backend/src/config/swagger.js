const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini Job Board API',
      version: '1.0.0',
      description:
        'REST API for a Mini Internship Job Board with JWT auth, role-based access, and CRUD operations.',
      contact: { name: 'API Support', email: 'support@jobboard.com' },
    },
    servers: [
      { url: 'http://localhost:5000/api/v1', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['applicant', 'employer', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Internship: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            companyName: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            type: { type: 'string', enum: ['remote', 'onsite', 'hybrid'] },
            stipend: { type: 'number' },
            duration: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean' },
            postedBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Application: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            internship: { type: 'string' },
            applicant: { type: 'string' },
            coverLetter: { type: 'string' },
            resumeUrl: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'object' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/v1/*.js'],
};

module.exports = swaggerJsdoc(options);