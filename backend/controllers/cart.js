const Cart = require('../models/Cart');
const { validationResult } = require('express-validator');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

        if (!cart) {
            cart = await Cart.create({ user: req.user.id });
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addToCart = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { productId, quantity } = req.body;

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = await Cart.create({ user: req.user.id });
        }

        await cart.addItem(productId, quantity);
        await cart.save();

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (err) {
        console.error(err);
        if (err.message === 'Produit non trouvé') {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }
        if (err.message === 'Stock insuffisant') {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Panier non trouvé'
            });
        }

        await cart.updateItemQuantity(req.params.productId, quantity);
        await cart.save();

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (err) {
        console.error(err);
        if (err.message === 'Produit non trouvé' || err.message === 'Produit non trouvé dans le panier') {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }
        if (err.message === 'Stock insuffisant') {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Panier non trouvé'
            });
        }

        cart.removeItem(req.params.productId);
        await cart.save();

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Panier non trouvé'
            });
        }

        cart.clearCart();
        await cart.save();

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
}; 