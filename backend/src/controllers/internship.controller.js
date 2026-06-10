const Internship = require('../models/Internship');
const Application = require('../models/Application');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { cacheGet, cacheSet} = require('../utils/cache');
const logger = require('../utils/Logger');

const CACHE_TTL = 300; // 5 minutes

// ─── Build filter object from query params ────────────────────────────────────

const buildFilter = (query) => {
  const filter = { isActive: true };

  if (query.location) {
    filter.location = { $regex: query.location, $options: 'i' };
  }
  if (query.type) filter.type = query.type;
  if (query.skills) {
    const skillsArr = query.skills.split(',').map((s) => s.trim().toLowerCase());
    filter.skills = { $in: skillsArr };
  }
  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.minStipend) {
    filter.stipend = { $gte: Number(query.minStipend) };
  }

  return filter;
};

const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  stipend_high: { stipend: -1 },
  stipend_low: { stipend: 1 },
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/internships
 * @access  Public
 */
exports.getAllInternships = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'newest', ...filterQuery } = req.query;
    const cacheKey = `internships:list:${JSON.stringify(req.query)}`;

    // Try cache first
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.debug(`Cache HIT: ${cacheKey}`);
      return res.status(200).json({ ...cached, _cached: true });
    }

    const filter = buildFilter(filterQuery);
    const sortObj = SORT_MAP[sort] || SORT_MAP.newest;
    const skip = (page - 1) * limit;

    const [internships, total] = await Promise.all([
      Internship.find(filter)
        .populate('postedBy', 'name companyName email')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Internship.countDocuments(filter),
    ]);

    const responseData = {
      success: true,
      data: internships,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };

    await cacheSet(cacheKey, responseData, CACHE_TTL);
    return res.status(200).json(responseData);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/v1/internships/:id
 * @access  Public
 */
exports.getInternship = async (req, res, next) => {
  try {
    const cacheKey = `internships:detail:${req.params.id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json({ ...cached, _cached: true });

    const internship = await Internship.findById(req.params.id)
      .populate('postedBy', 'name companyName email');

    if (!internship) return sendError(res, 404, 'Internship not found');

    const responseData = { success: true, data: internship };
    await cacheSet(cacheKey, responseData, CACHE_TTL);

    return res.status(200).json(responseData);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/internships
 * @access  Private (employer)
 */
exports.createInternship = async (req, res, next) => {
  try {
    const internship = await Internship.create({
      ...req.body,
      postedBy: req.user._id,
      companyName: req.body.companyName || req.user.companyName,
    });

    
    logger.info(`New internship posted: "${internship.title}" by ${req.user.email}`);

    sendSuccess(res, 201, 'Internship posted successfully', { internship });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/v1/internships/:id
 * @access  Private (employer who owns it OR admin)
 */
exports.updateInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return sendError(res, 404, 'Internship not found');

    const isOwner = internship.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'You can only update your own internship postings');
    }

    const updated = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('postedBy', 'name companyName email');

    
    sendSuccess(res, 200, 'Internship updated successfully', { internship: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/v1/internships/:id
 * @access  Private (employer who owns it OR admin)
 */
exports.deleteInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return sendError(res, 404, 'Internship not found');

    const isOwner = internship.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'You can only delete your own internship postings');
    }

    // Soft delete: set isActive = false (preserves application history)
    await Internship.findByIdAndUpdate(req.params.id, { isActive: false });
    await Application.updateMany({ internship: req.params.id, status: 'pending' }, { status: 'rejected' });

    
    logger.info(`Internship "${internship.title}" deactivated by ${req.user.email}`);

    sendSuccess(res, 200, 'Internship removed successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/v1/internships/employer/my-postings
 * @access  Private (employer)
 */
// exports.getMyPostings = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * limit;

//     const [internships, total] = await Promise.all([
//       Internship.find({ postedBy: req.user._id })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(Number(limit))
//         .lean(),
//       Internship.countDocuments({ postedBy: req.user._id }),
//     ]);

//     sendPaginated(res, internships, page, limit, total);
//   } catch (err) {
//     next(err);
//   }
// };


exports.getMyPostings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [internships, total] = await Promise.all([
      Internship.find({ postedBy: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Internship.countDocuments({ postedBy: req.user._id }),
    ]);

    const internshipsWithCounts = await Promise.all(
      internships.map(async (internship) => {
        const applicationsCount = await Application.countDocuments({
          internship: internship._id,
        });

        return {
          ...internship,
          applicationsCount,
        };
      })
    );

    sendPaginated(
      res,
      internshipsWithCounts,
      page,
      limit,
      total
    );
  } catch (err) {
    next(err);
  }
};