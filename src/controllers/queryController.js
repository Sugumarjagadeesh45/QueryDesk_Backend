const Query = require('../models/Query');
const generateQueryId = require('../utils/generateQueryId');

/**
 * POST /api/queries
 * Create a new query for the authenticated user.
 * Backend generates queryId and sets status = PENDING.
 */
const createQuery = async (req, res, next) => {
  try {
    const { subject, description } = req.body;

    // Validate required fields
    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required.',
      });
    }

    // Length validation (also enforced by model but better UX with explicit message)
    if (subject.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Subject cannot exceed 100 characters.',
      });
    }

    if (description.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 1000 characters.',
      });
    }

    // Backend generates the readable query ID (never from frontend)
    const queryId = await generateQueryId();

    const query = await Query.create({
      queryId,
      user: req.user._id,
      subject: subject.trim(),
      description: description.trim(),
      status: 'PENDING',
      adminResponse: '',
    });

    await query.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Query submitted successfully.',
      query,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/queries/my
 * Get all queries belonging to the authenticated user only.
 * Sorted newest first.
 */
const getMyQueries = async (req, res, next) => {
  try {
    const queries = await Query.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: queries.length,
      queries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/queries/:id
 * Get a single query by MongoDB _id.
 * SECURITY: User can only access their OWN query.
 */
const getQueryById = async (req, res, next) => {
  try {
    const query = await Query.findById(req.params.id).populate('user', 'name email');

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found.',
      });
    }

    // Ownership check — user cannot view another user's query
    if (query.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own queries.',
      });
    }

    res.status(200).json({
      success: true,
      query,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createQuery, getMyQueries, getQueryById };
