const express = require('express');
const router = express.Router();
const { createQuery, getMyQueries, getQueryById } = require('../controllers/queryController');
const { requireAuth } = require('../middleware/authMiddleware');

// All user query routes require authentication
router.use(requireAuth);

router.post('/', createQuery);
router.get('/my', getMyQueries);
router.get('/:id', getQueryById);

module.exports = router;
