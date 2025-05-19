const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        console.log('getProducts - Début de la requête');
        console.log('getProducts - Paramètres de requête:', req.query);
        console.log('getProducts - Utilisateur:', req.user);

        const pageSize = 10;
        const page = Number(req.query.page) || 1;
        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i'
                }
            }
            : {};
        const category = req.query.category ? { category: req.query.category } : {};
        const isActive = req.query.isActive !== undefined ? { isActive: req.query.isActive === 'true' } : {};
        const sort = req.query.sort || '-createdAt';

        console.log('getProducts - Filtres:', {
            keyword,
            category,
            isActive,
            sort
        });

        const count = await Product.countDocuments({ ...keyword, ...category, ...isActive });
        console.log('getProducts - Nombre total de produits:', count);

        const products = await Product.find({ ...keyword, ...category, ...isActive })
            .sort(sort)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        console.log('getProducts - Produits trouvés:', products.length);

        res.status(200).json({
            success: true,
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
            limit: pageSize
        });
    } catch (err) {
        console.error('getProducts - Erreur:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des produits',
            error: err.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produit non trouvé'
            });
        }
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    console.log('Création produit - Données reçues:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Création produit - Erreurs de validation:', errors.array());
        return res.status(400).json({ 
            success: false,
            errors: errors.array() 
        });
    }

    try {
        // Vérification des champs requis
        const { name, description, price, category, images, stock, isActive } = req.body;

        if (!name || !description || !price || !category) {
            console.error('Création produit - Champs manquants:', { name, description, price, category });
            return res.status(400).json({
                success: false,
                message: 'Tous les champs requis doivent être remplis'
            });
        }

        if (!images || images.length === 0) {
            console.error('Création produit - Images manquantes');
            return res.status(400).json({
                success: false,
                message: 'Au moins une image est requise'
            });
        }

        // Vérification de la catégorie
        const validCategories = ['Électronique', 'Vêtements', 'Maison', 'Sport', 'Loisirs', 'Autres'];
        if (!validCategories.includes(category)) {
            console.error('Création produit - Catégorie invalide:', category);
            return res.status(400).json({
                success: false,
                message: 'Catégorie invalide'
            });
        }

        // Création du produit avec les données validées
        const productData = {
            name: String(name).trim(),
            description: String(description).trim(),
            price: Number(price),
            category,
            images: Array.isArray(images) ? images : [images],
            stock: Number(stock) || 0,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
            featured: Boolean(req.body.featured) || false,
            discount: Number(req.body.discount) || 0
        };

        console.log('Création produit - Données validées:', JSON.stringify(productData, null, 2));

        const product = await Product.create(productData);
        
        if (!product || !product._id) {
            console.error('Création produit - Échec de la création:', product);
            throw new Error('Erreur lors de la création du produit');
        }

        console.log('Création produit - Succès:', product._id);
        
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (err) {
        console.error('Création produit - Erreur:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Erreur lors de la création du produit'
        });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    console.log('Mise à jour produit - ID:', req.params.id);
    console.log('Mise à jour produit - Données reçues:', JSON.stringify(req.body, null, 2));

    try {
        if (!req.params.id) {
            console.error('Mise à jour produit - ID manquant');
            return res.status(400).json({
                success: false,
                message: 'ID du produit requis'
            });
        }

        let product = await Product.findById(req.params.id);
        if (!product) {
            console.error('Mise à jour produit - Produit non trouvé:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Produit non trouvé'
            });
        }

        // Préparation des données de mise à jour avec conversion des types
        const updateData = {
            ...req.body,
            name: req.body.name ? String(req.body.name).trim() : product.name,
            description: req.body.description ? String(req.body.description).trim() : product.description,
            price: req.body.price ? Number(req.body.price) : product.price,
            stock: req.body.stock ? Number(req.body.stock) : product.stock,
            discount: req.body.discount ? Number(req.body.discount) : product.discount,
            isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : product.isActive,
            featured: req.body.featured !== undefined ? Boolean(req.body.featured) : product.featured,
            images: req.body.images ? (Array.isArray(req.body.images) ? req.body.images : [req.body.images]) : product.images
        };

        console.log('Mise à jour produit - Données validées:', JSON.stringify(updateData, null, 2));

        product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product || !product._id) {
            console.error('Mise à jour produit - Échec de la mise à jour:', product);
            throw new Error('Erreur lors de la mise à jour du produit');
        }

        console.log('Mise à jour produit - Succès:', product._id);

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (err) {
        console.error('Mise à jour produit - Erreur:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Erreur serveur'
        });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produit non trouvé'
            });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Produit supprimé'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produit non trouvé'
            });
        }

        const alreadyReviewed = product.reviews.find(
            r => r.user.toString() === req.user.id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: 'Produit déjà commenté'
            });
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user.id
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({
            success: true,
            message: 'Commentaire ajouté'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @desc    Get all products for admin
// @route   GET /api/products/admin
// @access  Private/Admin
exports.getAdminProducts = async (req, res) => {
    try {
        console.log('getAdminProducts - Début de la requête');
        console.log('getAdminProducts - Headers:', req.headers);
        console.log('getAdminProducts - User:', req.user);
        console.log('getAdminProducts - Query:', req.query);

        if (!req.user || req.user.role !== 'admin') {
            console.error('getAdminProducts - Accès non autorisé');
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        const pageSize = 10;
        const page = Number(req.query.page) || 1;
        
        // Gestion des catégories
        let categoryFilter = {};
        if (req.query.category) {
            categoryFilter = { category: req.query.category };
        }

        const isActive = req.query.isActive !== undefined 
            ? { isActive: req.query.isActive === 'true' } 
            : {};

        console.log('getAdminProducts - Filtres:', {
            category: categoryFilter,
            isActive
        });

        try {
            const count = await Product.countDocuments({ ...categoryFilter, ...isActive });
            console.log('getAdminProducts - Nombre total de produits:', count);

            const products = await Product.find({ ...categoryFilter, ...isActive })
                .sort('-createdAt')
                .limit(pageSize)
                .skip(pageSize * (page - 1));

            console.log('getAdminProducts - Produits trouvés:', products.length);

            return res.status(200).json({
                success: true,
                products,
                page,
                pages: Math.ceil(count / pageSize),
                total: count,
                limit: pageSize
            });
        } catch (dbError) {
            console.error('getAdminProducts - Erreur base de données:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des produits',
                error: dbError.message
            });
        }
    } catch (err) {
        console.error('getAdminProducts - Erreur générale:', {
            message: err.message,
            stack: err.stack,
            query: req.query,
            user: req.user
        });
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}; 