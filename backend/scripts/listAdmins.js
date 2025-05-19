require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const listAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://alex_koffi:9alex345@suiviedepenses.nerqyxm.mongodb.net/mern-ecommerce?retryWrites=true&w=majority&appName=SuivieDepenses', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const admins = await User.find({ role: 'admin' });
        if (admins.length === 0) {
            console.log('Aucun administrateur trouvé.');
        } else {
            console.log('Liste des administrateurs :');
            admins.forEach(admin => {
                console.log(`- Nom : ${admin.name}, Email : ${admin.email}, Rôle : ${admin.role}`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de la récupération des administrateurs :', err);
        process.exit(1);
    }
};

listAdmins(); 