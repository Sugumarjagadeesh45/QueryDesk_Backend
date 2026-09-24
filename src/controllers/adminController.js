const Query = require('../models/Query');
const User = require('../models/User');

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

/**
 * GET /api/admin/queries
 * Get all queries with optional ?search= and ?status= filters.
 * Also returns aggregate stats for the admin dashboard.
 */
const getAllQueries = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    // Validate status filter if provided
    if (status && status !== 'ALL' && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status value. Must be one of: ALL, ${VALID_STATUSES.join(', ')}`,
      });
    }

    // Build base filter
    let filter = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    let queries;

    if (search && search.trim()) {
      // Search users by name or email first
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
        ],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      // Then search queries by queryId, subject, or matching user
      queries = await Query.find({
        ...filter,
        $or: [
          { queryId: { $regex: search.trim(), $options: 'i' } },
          { subject: { $regex: search.trim(), $options: 'i' } },
          { user: { $in: userIds } },
        ],
      })
        .sort({ createdAt: -1 })
        .populate('user', 'name email');
    } else {
      queries = await Query.find(filter)
        .sort({ createdAt: -1 })
        .populate('user', 'name email');
    }

    // Aggregate stats (always shows overall totals, not filtered)
    const [totalQueries, pending, inProgress, resolved, closed] = await Promise.all([
      Query.countDocuments(),
      Query.countDocuments({ status: 'PENDING' }),
      Query.countDocuments({ status: 'IN_PROGRESS' }),
      Query.countDocuments({ status: 'RESOLVED' }),
      Query.countDocuments({ status: 'CLOSED' }),
    ]);

    res.status(200).json({
      success: true,
      count: queries.length,
      queries,
      stats: { totalQueries, pending, inProgress, resolved, closed },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/queries/:id
 * Get full query details for admin view.
 * Admin can view ANY user's query.
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

    res.status(200).json({
      success: true,
      query,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/queries/:id
 * Admin updates status and/or adminResponse.
 * Admin cannot change query owner (user field is protected).
 */
const updateQuery = async (req, res, next) => {
  try {
    const { status, adminResponse } = req.body;

    // At least one field must be provided
    if (status === undefined && adminResponse === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one field to update: status or adminResponse.',
      });
    }

    // Validate status if provided
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found.',
      });
    }

    // Update only allowed fields — user (owner) field is never changed
    if (status !== undefined) query.status = status;
    if (adminResponse !== undefined) query.adminResponse = adminResponse;

    await query.save(); // updatedAt auto-updated by Mongoose timestamps
    await query.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Query updated successfully.',
      query,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllQueries, getQueryById, updateQuery };
