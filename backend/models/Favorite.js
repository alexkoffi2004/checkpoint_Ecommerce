const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, {
    timestamps: true
});

// Index pour optimiser les recherches
favoriteSchema.index({ user: 1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite; 