const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom du produit est requis'],
        trim: true,
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description est requise'],
        maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
    },
    price: {
        type: Number,
        required: [true, 'Le prix est requis'],
        min: [0, 'Le prix ne peut pas être négatif']
    },
    category: {
        type: String,
        required: [true, 'La catégorie est requise'],
        enum: ['electronics', 'clothing', 'books', 'Électronique', 'Vêtements', 'Loisirs']
    },
    images: [{
        type: String,
        required: [true, 'Au moins une image est requise']
    }],
    stock: {
        type: Number,
        required: [true, 'Le stock est requis'],
        min: [0, 'Le stock ne peut pas être négatif'],
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        min: [0, 'La note ne peut pas être négative'],
        max: [5, 'La note ne peut pas dépasser 5'],
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    featured: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware pour mettre à jour updatedAt avant chaque save
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Méthode pour calculer le prix après réduction
productSchema.methods.getDiscountedPrice = function() {
    return this.price * (1 - this.discount / 100);
};

module.exports = mongoose.model('Product', productSchema); 