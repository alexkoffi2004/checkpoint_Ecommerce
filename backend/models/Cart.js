const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'La quantité doit être au moins 1'],
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalItems: {
        type: Number,
        required: true,
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
cartSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Méthode pour calculer les totaux
cartSchema.methods.calculateTotals = function() {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    return this;
};

// Méthode pour ajouter un produit au panier
cartSchema.methods.addItem = async function(product, quantity = 1) {
    const Product = mongoose.model('Product');
    const productDoc = await Product.findById(product);

    if (!productDoc) {
        throw new Error('Produit non trouvé');
    }

    if (productDoc.stock < quantity) {
        throw new Error('Stock insuffisant');
    }

    const existingItem = this.items.find(item => item.product.toString() === product.toString());

    if (existingItem) {
        existingItem.quantity += quantity;
        if (existingItem.quantity > productDoc.stock) {
            throw new Error('Stock insuffisant');
        }
    } else {
        this.items.push({
            product: productDoc._id,
            quantity,
            price: productDoc.getDiscountedPrice(),
            name: productDoc.name,
            image: productDoc.images[0]
        });
    }

    this.calculateTotals();
    return this;
};

// Méthode pour mettre à jour la quantité d'un produit
cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
    const Product = mongoose.model('Product');
    const productDoc = await Product.findById(productId);

    if (!productDoc) {
        throw new Error('Produit non trouvé');
    }

    if (quantity > productDoc.stock) {
        throw new Error('Stock insuffisant');
    }

    const item = this.items.find(item => item.product.toString() === productId.toString());

    if (!item) {
        throw new Error('Produit non trouvé dans le panier');
    }

    if (quantity <= 0) {
        this.items = this.items.filter(item => item.product.toString() !== productId.toString());
    } else {
        item.quantity = quantity;
    }

    this.calculateTotals();
    return this;
};

// Méthode pour supprimer un produit du panier
cartSchema.methods.removeItem = function(productId) {
    this.items = this.items.filter(item => item.product.toString() !== productId.toString());
    this.calculateTotals();
    return this;
};

// Méthode pour vider le panier
cartSchema.methods.clearCart = function() {
    this.items = [];
    this.totalPrice = 0;
    this.totalItems = 0;
    return this;
};

module.exports = mongoose.model('Cart', cartSchema); 