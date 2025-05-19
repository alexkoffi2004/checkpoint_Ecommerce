const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .populate('parent', 'name')
            .populate('subcategories', 'name')
            .populate('productCount');

        res.json({
            success: true,
            categories
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des catégories'
        });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parent', 'name')
            .populate('subcategories', 'name')
            .populate('productCount');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Catégorie non trouvée'
            });
        }

        res.json({
            success: true,
            category
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la catégorie'
        });
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    try {
        const { name, description, image, parent } = req.body;

        // Vérifier si la catégorie parente existe
        if (parent) {
            const parentCategory = await Category.findById(parent);
            if (!parentCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Catégorie parente non trouvée'
                });
            }
        }

        const category = await Category.create({
            name,
            description,
            image,
            parent
        });

        res.status(201).json({
            success: true,
            category
        });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Une catégorie avec ce nom existe déjà'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la catégorie'
        });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, image, parent, isActive } = req.body;

        // Vérifier si la catégorie existe
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Catégorie non trouvée'
            });
        }

        // Vérifier si la catégorie parente existe
        if (parent) {
            const parentCategory = await Category.findById(parent);
            if (!parentCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Catégorie parente non trouvée'
                });
            }
            // Empêcher une catégorie d'être sa propre parente
            if (parent === req.params.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Une catégorie ne peut pas être sa propre parente'
                });
            }
        }

        // Mettre à jour la catégorie
        category.name = name || category.name;
        category.description = description || category.description;
        category.image = image || category.image;
        category.parent = parent || category.parent;
        if (typeof isActive === 'boolean') category.isActive = isActive;

        await category.save();

        res.json({
            success: true,
            category
        });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Une catégorie avec ce nom existe déjà'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la catégorie'
        });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Catégorie non trouvée'
            });
        }

        // Vérifier s'il y a des sous-catégories
        const hasSubcategories = await Category.exists({ parent: req.params.id });
        if (hasSubcategories) {
            return res.status(400).json({
                success: false,
                message: 'Impossible de supprimer une catégorie qui contient des sous-catégories'
            });
        }

        // Vérifier s'il y a des produits dans cette catégorie
        const hasProducts = await require('../models/Product').exists({ category: req.params.id });
        if (hasProducts) {
            return res.status(400).json({
                success: false,
                message: 'Impossible de supprimer une catégorie qui contient des produits'
            });
        }

        await category.remove();

        res.json({
            success: true,
            message: 'Catégorie supprimée avec succès'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la catégorie'
        });
    }
}; 