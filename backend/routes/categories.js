const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/category');
const { protect, admin } = require('../middleware/auth');

// Routes publiques
router.get('/', getCategories);
router.get('/:id', getCategory);

// Routes protégées (admin uniquement)
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router; 