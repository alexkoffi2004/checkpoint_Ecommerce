require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        // Connexion à la base de données
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://alex_koffi:9alex345@suiviedepenses.nerqyxm.mongodb.net/mern-ecommerce?retryWrites=true&w=majority&appName=SuivieDepenses', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Vérifier si un admin existe déjà
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Un administrateur existe déjà dans la base de données.');
            process.exit(0);
        }

        // Créer l'administrateur
        const admin = await User.create({
            name: 'Administrateur',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        });

        console.log('Administrateur créé avec succès !');
        console.log('Email:', admin.email);
        console.log('Mot de passe: admin123');
        console.log('\nVeuillez changer ce mot de passe après la première connexion.');

        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de la création de l\'administrateur:', err);
        process.exit(1);
    }
};

createAdmin(); 