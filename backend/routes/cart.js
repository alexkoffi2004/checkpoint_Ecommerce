const express = require('express');
const { check } = require('express-validator');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cart');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const cartItemValidation = [
    check('productId', 'L\'ID du produit est requis').not().isEmpty(),
    check('quantity', 'La quantité doit être un nombre positif')
        .isInt({ min: 1 })
        .toInt()
];

// Toutes les routes du panier nécessitent une authentification
router.use(protect);

// Routes du panier
router.get('/', getCart);
router.post('/items', cartItemValidation, addToCart);
router.put('/items/:productId', cartItemValidation, updateCartItem);
router.delete('/items/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router; 