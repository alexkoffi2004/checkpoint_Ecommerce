const express = require('express');
const router = express.Router();
const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/review');
const { protect, admin } = require('../middleware/auth');

// Routes protégées
router.get('/', protect, admin, getReviews);
router.get('/:id', protect, getReview);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router; 