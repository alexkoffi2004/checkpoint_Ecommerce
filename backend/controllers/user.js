const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Review = require('../models/Review');

// @desc    Get all users (admin only)
// @route   GET /api/users/admin
// @access  Private/Admin
exports.getUsers = async (req, res) => {
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
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé à supprimer cet utilisateur'
            });
        }

        // Supprimer toutes les données associées à l'utilisateur
        await Promise.all([
            Order.deleteMany({ user: req.params.id }),
            Cart.deleteMany({ user: req.params.id }),
            Review.deleteMany({ user: req.params.id })
        ]);

        // Supprimer l'utilisateur
        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Utilisateur et toutes ses données associées supprimés avec succès'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'utilisateur'
        });
    }
}; 