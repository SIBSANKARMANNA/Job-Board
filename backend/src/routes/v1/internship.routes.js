const express = require('express');
const router = express.Router();
const internshipController = require('../../controllers/internship.controller');
const applicationController = require('../../controllers/application.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const {
  createInternshipSchema,
  updateInternshipSchema,
  internshipQuerySchema,
} = require('../../validators/internship.validator');
const {
  createApplicationSchema,
} = require('../../validators/application.validator');

/**
 * @swagger
 * tags:
 *   name: Internships
 *   description: Internship CRUD operations
 */

/**
 * @swagger
 * /internships:
 *   get:
 *     summary: Get all active internships (public, with filtering & pagination)
 *     tags: [Internships]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [remote, onsite, hybrid] }
 *       - in: query
 *         name: skills
 *         description: Comma-separated skills
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest, stipend_high, stipend_low] }
 *     responses:
 *       200:
 *         description: List of internships with pagination meta
 *   post:
 *     summary: Post a new internship (employer only)
 *     tags: [Internships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Internship'
 *     responses:
 *       201:
 *         description: Internship created
 *       403:
 *         description: Employer role required
 */
router
  .route('/')
  .get(validate(internshipQuerySchema, 'query'), internshipController.getAllInternships)
  .post(
    protect,
    restrictTo('employer', 'admin'),
    validate(createInternshipSchema),
    internshipController.createInternship
  );

/**
 * @swagger
 * /internships/employer/my-postings:
 *   get:
 *     summary: Get all postings by the authenticated employer
 *     tags: [Internships]
 */
router.get(
  '/employer/my-postings',
  protect,
  restrictTo('employer', 'admin'),
  internshipController.getMyPostings
);

/**
 * @swagger
 * /internships/{id}:
 *   get:
 *     summary: Get a single internship by ID
 *     tags: [Internships]
 *   patch:
 *     summary: Update an internship (owner or admin)
 *     tags: [Internships]
 *   delete:
 *     summary: Remove/deactivate an internship (owner or admin)
 *     tags: [Internships]
 */
router
  .route('/:id')
  .get(internshipController.getInternship)
  .patch(
    protect,
    restrictTo('employer', 'admin'),
    validate(updateInternshipSchema),
    internshipController.updateInternship
  )
  .delete(protect, restrictTo('employer', 'admin'), internshipController.deleteInternship);

/**
 * @swagger
 * /internships/{id}/apply:
 *   post:
 *     summary: Apply to an internship (applicant only)
 *     tags: [Internships]
 */
router.post(
  '/:id/apply',
  protect,
  restrictTo('applicant'),
  validate(createApplicationSchema),
  applicationController.applyToInternship
);

/**
 * @swagger
 * /internships/{id}/applications:
 *   get:
 *     summary: Get all applications for an internship (employer/admin only)
 *     tags: [Internships]
 */
router.get(
  '/:id/applications',
  protect,
  restrictTo('employer', 'admin'),
  applicationController.getInternshipApplications
);

module.exports = router;