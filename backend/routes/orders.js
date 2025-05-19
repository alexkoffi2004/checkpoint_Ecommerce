const express = require('express');
const { protect, admin } = require('../middleware/auth');
const {
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    createOrder,
    getUserOrders
} = require('../controllers/order');

const router = express.Router();

// @desc    Get all orders (admin only)
// @route   GET /api/orders/admin
// @access  Private/Admin
router.get('/admin', protect, admin, getOrders);

// @desc    Update order as admin
// @route   PUT /api/orders/admin/:id
// @access  Private/Admin
router.put('/admin/:id', protect, admin, updateOrderStatus);

// @desc    Get user orders
// @route   GET /api/orders/user/me
// @access  Private
router.get('/user/me', protect, getUserOrders);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, getOrderById);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin pour tous les statuts, utilisateur pour confirmer la réception)
router.put('/:id/status', protect, updateOrderStatus);

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteOrder);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, createOrder);

module.exports = router; 