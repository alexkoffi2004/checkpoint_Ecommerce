const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads');
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont autorisées'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB par fichier
    }
});

// Route pour le téléchargement d'images
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Aucune image n\'a été téléchargée'
            });
        }

        // Générer les URLs des images téléchargées
        const urls = req.files.map(file => `/uploads/${file.filename}`);

        res.json({
            success: true,
            urls: urls,
            message: 'Images téléchargées avec succès'
        });
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du téléchargement des images'
        });
    }
});

module.exports = router; 