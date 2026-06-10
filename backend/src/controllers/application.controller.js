const Application = require('../models/Application');
const Internship = require('../models/Internship');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const logger = require('../utils/Logger');

/**
 * @route   POST /api/v1/internships/:id/apply
 * @access  Private (applicant)
 */
exports.applyToInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship || !internship.isActive) {
      return sendError(res, 404, 'Internship not found or no longer active');
    }

    // Employer can't apply to their own posting
    if (internship.postedBy.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot apply to your own internship posting');
    }

    // Check if already applied
    const existing = await Application.findOne({
      internship: req.params.id,
      applicant: req.user._id,
    });
    if (existing) {
      return sendError(res, 409, 'You have already applied to this internship');
    }

    // Check deadline
    if (internship.applicationDeadline && new Date() > internship.applicationDeadline) {
      return sendError(res, 400, 'Application deadline has passed');
    }

    const application = await Application.create({
      internship: req.params.id,
      applicant: req.user._id,
      coverLetter: req.body.coverLetter,
      resumeUrl: req.body.resumeUrl,
    });

    // Increment applications count
    await Internship.findByIdAndUpdate(req.params.id, { $inc: { applicationsCount: 1 } });

    await application.populate([
      { path: 'internship', select: 'title companyName location' },
      { path: 'applicant', select: 'name email' },
    ]);

    logger.info(`New application: ${req.user.email} → "${internship.title}"`);
    sendSuccess(res, 201, 'Application submitted successfully', { application });
  } catch (err) {
    next(err);
  }
};



/**
 * @route   GET /api/v1/internships/:id/applications
 * @access  Private (employer who owns this internship OR admin)
 */
exports.getInternshipApplications = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return sendError(res, 404, 'Internship not found');

    const isOwner = internship.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'Access denied. You can only view applications for your own postings.');
    }

    const { page = 1, limit = 10, status } = req.query;
    const filter = { internship: req.params.id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('applicant', 'name email skills bio')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Application.countDocuments(filter),
    ]);

    sendPaginated(res, applications, page, limit, total);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/v1/applications/:id/status
 * @access  Private (employer OR admin)
 */
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('internship');
    if (!application) return sendError(res, 404, 'Application not found');

    const internship = application.internship;
    const isOwner = internship.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'You can only update applications for your own internship postings');
    }

    application.status = req.body.status;
    if (req.body.employerNote) application.employerNote = req.body.employerNote;

    await application.save();

    logger.info(`Application ${application._id} status updated to "${req.body.status}" by ${req.user.email}`);
    sendSuccess(res, 200, 'Application status updated', { application });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/v1/applications/my-applications
 * @access  PUBLIC (applicant)
 */

exports.getMyApplications = async (req, res, next) => {
  try {
    const applicantId = req.user._id;

    // // Cache key
    // const cacheKey = `applications:${applicantId}`;

    // // Check cache first
    // const cachedApplications = await cacheGet(cacheKey);

    // if (cachedApplications) {
    //   return sendSuccess(
    //     res,
    //     200,
    //     'Applications fetched successfully (cached)',
    //     cachedApplications
    //   );
    // }

    const applications = await Application.find({
      applicant: applicantId,
    })
      .populate({
        path: 'internship',
        select: 'title companyName location type stipend duration',
      })
      .sort({ createdAt: -1 });

    // // Store in cache for 5 minutes
    // await cacheSet(cacheKey, applications, 300);

    return sendSuccess(
      res,
      200,
      'Applications fetched successfully',
      applications
    );
  } catch (error) {
    next(error);
  }
};