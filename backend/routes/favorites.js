const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getFavorites,
    addToFavorites,
    removeFromFavorites
} = require('../controllers/favorite');

// @route   GET /api/favorites
// @desc    Récupérer les favoris d'un utilisateur
// @access  Private
router.get('/', protect, getFavorites);

// @route   POST /api/favorites/:productId
// @desc    Ajouter un produit aux favoris
// @access  Private
router.post('/:productId', protect, addToFavorites);

// @route   DELETE /api/favorites/:productId
// @desc    Supprimer un produit des favoris
// @access  Private
router.delete('/:productId', protect, removeFromFavorites);

module.exports = router; 