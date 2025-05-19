const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'La note est requise'],
        min: [1, 'La note minimale est 1'],
        max: [5, 'La note maximale est 5']
    },
    title: {
        type: String,
        required: [true, 'Le titre est requis'],
        trim: true,
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    comment: {
        type: String,
        required: [true, 'Le commentaire est requis'],
        trim: true,
        maxlength: [1000, 'Le commentaire ne peut pas dépasser 1000 caractères']
    },
    images: [{
        type: String
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Empêcher un utilisateur de poster plusieurs avis pour le même produit
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Virtual pour le nom de l'utilisateur
reviewSchema.virtual('userName', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true,
    select: 'name'
});

module.exports = mongoose.model('Review', reviewSchema); 