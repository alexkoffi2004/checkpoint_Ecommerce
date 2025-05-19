const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Vérifier si le token est présent dans les headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            console.log('Auth - Pas de token fourni');
            return res.status(401).json({
                success: false,
                message: 'Non autorisé, token manquant'
            });
        }

        try {
            // Vérifier le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Auth - Token décodé:', decoded);

            // Récupérer l'utilisateur
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                console.log('Auth - Utilisateur non trouvé');
                return res.status(401).json({
                    success: false,
                    message: 'Non autorisé, utilisateur non trouvé'
                });
            }

            // Ajouter l'utilisateur à la requête
            req.user = user;
            console.log('Auth - Utilisateur authentifié:', user._id);
            next();
        } catch (err) {
            console.error('Auth - Erreur de vérification du token:', err);
            return res.status(401).json({
                success: false,
                message: 'Non autorisé, token invalide'
            });
        }
    } catch (err) {
        console.error('Auth - Erreur générale:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// Middleware pour autoriser certains rôles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                console.log('Auth - Pas d\'utilisateur dans la requête');
                return res.status(401).json({
                    success: false,
                    message: 'Non autorisé, utilisateur non authentifié'
                });
            }

            console.log('Auth - Vérification du rôle:', {
                userRole: req.user.role,
                requiredRoles: roles
            });

            if (!roles.includes(req.user.role)) {
                console.log('Auth - Rôle non autorisé');
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé, rôle insuffisant'
                });
            }

            console.log('Auth - Rôle autorisé');
            next();
        } catch (err) {
            console.error('Auth - Erreur lors de la vérification du rôle:', err);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    };
};

exports.admin = (req, res, next) => {
    try {
        if (!req.user) {
            console.log('Admin Middleware - Pas d\'utilisateur dans la requête');
            return res.status(401).json({
                success: false,
                message: 'Non autorisé - Utilisateur non authentifié'
            });
        }

        if (req.user.role !== 'admin') {
            console.log('Admin Middleware - Utilisateur non admin:', {
                id: req.user._id,
                role: req.user.role
            });
            return res.status(403).json({
                success: false,
                message: 'Non autorisé - Droits administrateur requis'
            });
        }

        console.log('Admin Middleware - Accès admin autorisé:', {
            id: req.user._id,
            email: req.user.email
        });
        next();
    } catch (err) {
        console.error('Admin Middleware - Erreur:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification des droits administrateur'
        });
    }
};