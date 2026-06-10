const express = require('express');
const router = express.Router();
const applicationController = require('../../controllers/application.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { updateApplicationStatusSchema } = require('../../validators/application.validator');

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Application management
 */





/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     summary: Update application status (employer/admin)
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [reviewed, shortlisted, rejected, accepted]
 *               employerNote:
 *                 type: string
 */
router.patch(
  '/:id/status',
  protect,
  restrictTo('employer', 'admin'),
  validate(updateApplicationStatusSchema),
  applicationController.updateApplicationStatus
);

/**
 * @swagger
 * /applications/my-applications:
 *   get:
 *     summary: Get all applications submitted by the logged-in applicant
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


router.get(
  '/my-applications',
  protect,
  restrictTo('applicant'),
  applicationController.getMyApplications
);






module.exports = router;