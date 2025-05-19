require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import des routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/user');
const reviewRoutes = require('./routes/reviews');
const favoriteRoutes = require('./routes/favorites');

const app = express();

// Configuration CORS
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'https://checkpoint-ecommerce-frontend.vercel.app',
        'https://jazzy-frangipane-f8fbb9.netlify.app'
    ];
    const origin = req.headers.origin;
    
    console.log('CORS - Origin:', origin);
    console.log('CORS - Method:', req.method);
    console.log('CORS - Path:', req.path);
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
        res.header('Access-Control-Max-Age', '86400'); // 24 heures
    }
    
    if (req.method === 'OPTIONS') {
        console.log('CORS - Pré-vol OPTIONS autorisé');
        return res.status(200).end();
    }
    
    next();
});

// Middleware pour logger les requêtes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Configuration de la base de données
mongoose.connect('mongodb+srv://alex_koffi:9alex345@suiviedepenses.nerqyxm.mongodb.net/mern-ecommerce?retryWrites=true&w=majority&appName=SuivieDepenses', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => {
    console.error('❌ Erreur de connexion à MongoDB:', err);
    process.exit(1);
});

// Routes de base
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API MERN E-commerce' });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', require('./routes/upload'));
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);

// Gestion des erreurs 404
app.use((req, res, next) => {
    console.log('Route non trouvée:', req.originalUrl);
    res.status(404).json({
        success: false,
        message: `Route non trouvée - ${req.originalUrl}`
    });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Une erreur est survenue!';
    
    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
}); 