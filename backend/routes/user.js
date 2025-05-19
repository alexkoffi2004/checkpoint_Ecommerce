const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { getUsers, deleteUser } = require('../controllers/user');

// Routes protégées par l'authentification et le rôle admin
router.get('/admin', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router; 