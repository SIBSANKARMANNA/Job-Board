const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const { protect } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const {
  registerSchema,
  loginSchema
} = require('../../validators/auth.validator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & user management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (applicant or employer)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "John Doe" }
 *               email: { type: string, example: "john@example.com" }
 *               password: { type: string, example: "Pass@1234" }
 *               role: { type: string, enum: [applicant, employer], default: applicant }
 *               companyName: { type: string, example: "TechCorp" }
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: Email already registered
 *       422:
 *         description: Validation error
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive JWT token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), authController.login);



/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *   patch:
 *     summary: Update current user profile
 *     tags: [Auth]
 */
router
  .route('/me')
  .get(protect, authController.getMe)
  .patch(protect, authController.updateMe);




module.exports = router;