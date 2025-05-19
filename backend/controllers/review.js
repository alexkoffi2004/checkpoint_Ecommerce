const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Get all reviews (admin)
// @route   GET /api/reviews
// @access  Private/Admin
exports.getReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const query = {};
        if (req.query.product) query.product = req.query.product;
        if (req.query.user) query.user = req.query.user;
        if (req.query.isVerified !== undefined) query.isVerified = req.query.isVerified === 'true';
        if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

        const reviews = await Review.find(query)
            .populate('user', 'name email')
            .populate('product', 'name images')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        const total = await Review.countDocuments(query);

        res.json({
            success: true,
            reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des avis'
        });
    }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Private
exports.getReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('user', 'name email')
            .populate('product', 'name images');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Avis non trouvé'
            });
        }

        // Vérifier si l'utilisateur est autorisé à voir l'avis
        if (req.user.role !== 'admin' && review.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé à accéder à cet avis'
            });
        }

        res.json({
            success: true,
            review
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'avis'
        });
    }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { product, rating, title, comment, images } = req.body;

        // Vérifier si le produit existe
        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: 'Produit non trouvé'
            });
        }

        // Vérifier si l'utilisateur a déjà posté un avis pour ce produit
        const existingReview = await Review.findOne({
            user: req.user._id,
            product
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Vous avez déjà posté un avis pour ce produit'
            });
        }

        const review = await Review.create({
            user: req.user._id,
            product,
            rating,
            title,
            comment,
            images
        });

        // Mettre à jour la note moyenne du produit
        const productReviews = await Review.find({ product });
        const averageRating = productReviews.reduce((acc, item) => acc + item.rating, 0) / productReviews.length;
        await Product.findByIdAndUpdate(product, { rating: averageRating });

        res.status(201).json({
            success: true,
            review
        });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Vous avez déjà posté un avis pour ce produit'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'avis'
        });
    }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
    try {
        const { rating, title, comment, images } = req.body;

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Avis non trouvé'
            });
        }

        // Vérifier si l'utilisateur est autorisé à modifier l'avis
        if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé à modifier cet avis'
            });
        }

        // Mettre à jour l'avis
        review.rating = rating || review.rating;
        review.title = title || review.title;
        review.comment = comment || review.comment;
        if (images) review.images = images;
        if (req.user.role === 'admin') {
            review.isVerified = req.body.isVerified ?? review.isVerified;
            review.isActive = req.body.isActive ?? review.isActive;
        }

        await review.save();

        // Mettre à jour la note moyenne du produit
        const productReviews = await Review.find({ product: review.product });
        const averageRating = productReviews.reduce((acc, item) => acc + item.rating, 0) / productReviews.length;
        await Product.findByIdAndUpdate(review.product, { rating: averageRating });

        res.json({
            success: true,
            review
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'avis'
        });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Avis non trouvé'
            });
        }

        // Vérifier si l'utilisateur est autorisé à supprimer l'avis
        if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé à supprimer cet avis'
            });
        }

        await review.remove();

        // Mettre à jour la note moyenne du produit
        const productReviews = await Review.find({ product: review.product });
        const averageRating = productReviews.length > 0
            ? productReviews.reduce((acc, item) => acc + item.rating, 0) / productReviews.length
            : 0;
        await Product.findByIdAndUpdate(review.product, { rating: averageRating });

        res.json({
            success: true,
            message: 'Avis supprimé avec succès'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'avis'
        });
    }
}; 