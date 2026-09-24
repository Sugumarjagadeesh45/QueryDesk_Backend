const express = require('express');
const router = express.Router();
const { getAllQueries, getQueryById, updateQuery } = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// All admin routes require authentication AND admin role
router.use(requireAuth, requireAdmin);

router.get('/queries', getAllQueries);
router.get('/queries/:id', getQueryById);
router.patch('/queries/:id', updateQuery);

module.exports = router;
