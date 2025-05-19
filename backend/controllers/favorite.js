const Favorite = require('../models/Favorite');
const Product = require('../models/Product');

// @desc    Récupérer les favoris d'un utilisateur
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res) => {
    try {
        let favorite = await Favorite.findOne({ user: req.user._id })
            .populate({
                path: 'products',
                select: 'name price images description stock discount rating numReviews'
            });

        if (!favorite) {
            favorite = await Favorite.create({ user: req.user._id, products: [] });
        }

        res.json({
            success: true,
            favorites: favorite.products
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des favoris'
        });
    }
};

// @desc    Ajouter un produit aux favoris
// @route   POST /api/favorites/:productId
// @access  Private
const addToFavorites = async (req, res) => {
    try {
        const { productId } = req.params;

        // Vérifier si le produit existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produit non trouvé'
            });
        }

        let favorite = await Favorite.findOne({ user: req.user._id });

        if (!favorite) {
            // Créer une nouvelle liste de favoris si elle n'existe pas
            favorite = await Favorite.create({
                user: req.user._id,
                products: [productId]
            });
        } else {
            // Vérifier si le produit est déjà dans les favoris
            if (favorite.products.includes(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Le produit est déjà dans vos favoris'
                });
            }

            // Ajouter le produit aux favoris
            favorite.products.push(productId);
            await favorite.save();
        }

        // Récupérer la liste mise à jour avec les détails des produits
        favorite = await Favorite.findById(favorite._id)
            .populate({
                path: 'products',
                select: 'name price images description stock discount rating numReviews'
            });

        res.json({
            success: true,
            message: 'Produit ajouté aux favoris',
            favorites: favorite.products
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout aux favoris:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout aux favoris'
        });
    }
};

// @desc    Supprimer un produit des favoris
// @route   DELETE /api/favorites/:productId
// @access  Private
const removeFromFavorites = async (req, res) => {
    try {
        const { productId } = req.params;

        const favorite = await Favorite.findOne({ user: req.user._id });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Liste de favoris non trouvée'
            });
        }

        // Vérifier si le produit est dans les favoris
        if (!favorite.products.includes(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Le produit n\'est pas dans vos favoris'
            });
        }

        // Supprimer le produit des favoris
        favorite.products = favorite.products.filter(
            id => id.toString() !== productId
        );
        await favorite.save();

        // Récupérer la liste mise à jour avec les détails des produits
        const updatedFavorite = await Favorite.findById(favorite._id)
            .populate({
                path: 'products',
                select: 'name price images description stock discount rating numReviews'
            });

        res.json({
            success: true,
            message: 'Produit supprimé des favoris',
            favorites: updatedFavorite.products
        });
    } catch (error) {
        console.error('Erreur lors de la suppression des favoris:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression des favoris'
        });
    }
};

module.exports = {
    getFavorites,
    addToFavorites,
    removeFromFavorites
}; 