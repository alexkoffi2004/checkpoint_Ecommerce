const express = require('express');
const { check } = require('express-validator');
const {
    register,
    login,
    getMe,
    logout
} = require('../controllers/auth');
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Validation middleware
const registerValidation = [
    check('name', 'Le nom est requis').not().isEmpty(),
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Veuillez entrer un mot de passe avec 6 caractères ou plus').isLength({ min: 6 })
];

const loginValidation = [
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Le mot de passe est requis').exists()
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (email !== req.user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Cet email est déjà utilisé'
                });
            }
        }

        // Mettre à jour l'utilisateur
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name,
                email,
                phone,
                address
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du profil'
        });
    }
});

// @desc    Get all users (admin only)
// @route   GET /api/users/admin
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.json({
            success: true,
            users,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs'
        });
    }
});

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, email, phone, role, isActive } = req.body;

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        if (email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Cet email est déjà utilisé'
                });
            }
        }

        // Mettre à jour l'utilisateur
        user.name = name;
        user.email = email;
        if (phone) user.phone = phone;
        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;

        await user.save();

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'utilisateur'
        });
    }
});

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Empêcher la suppression du dernier administrateur
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Impossible de supprimer le dernier administrateur'
                });
            }
        }

        await user.remove();

        res.json({
            success: true,
            message: 'Utilisateur supprimé avec succès'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'utilisateur'
        });
    }
});

module.exports = router; 