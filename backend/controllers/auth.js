const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email existe déjà'
            });
        }

        // Create user
        user = await User.create({
            name,
            email,
            password
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    console.log('Tentative de connexion avec:', { email: req.body.email });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Erreurs de validation:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check for user
        console.log('Recherche de l\'utilisateur dans la base de données...');
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('Utilisateur non trouvé');
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe invalide'
            });
        }

        // Check if password matches
        console.log('Vérification du mot de passe...');
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log('Mot de passe incorrect');
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe invalide'
            });
        }

        console.log('Connexion réussie pour:', user.email);
        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Erreur lors de la connexion:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: err.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
    });
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
}; 