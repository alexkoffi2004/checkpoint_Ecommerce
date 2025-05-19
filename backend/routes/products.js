const express = require('express');
const { check } = require('express-validator');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getAdminProducts
} = require('../controllers/product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const productValidation = [
    check('name', 'Le nom du produit est requis').not().isEmpty(),
    check('description', 'La description est requise').not().isEmpty(),
    check('price', 'Le prix est requis et doit être un nombre positif').isFloat({ min: 0 }),
    check('category', 'La catégorie est requise').not().isEmpty(),
    check('stock', 'Le stock est requis et doit être un nombre positif').isInt({ min: 0 })
];

const reviewValidation = [
    check('rating', 'La note est requise et doit être entre 1 et 5').isInt({ min: 1, max: 5 }),
    check('comment', 'Le commentaire est requis').not().isEmpty()
];

// Routes admin (doivent être avant les routes avec paramètres)
router.get('/admin', protect, authorize('admin'), getAdminProducts);
router.post('/', protect, authorize('admin'), productValidation, createProduct);
router.put('/:id', protect, authorize('admin'), productValidation, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

// Routes publiques
router.get('/', getProducts);
router.get('/:id', getProduct);

// Routes protégées
router.post('/:id/reviews', protect, reviewValidation, createProductReview);

module.exports = router; 