const express = require('express');
const router = express.Router();
const PaymentMethod = require('../models/PaymentMethod');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/payment-methods/active
// @desc    Récupérer les moyens de paiement actifs (Public/Connecté)
// @access  Private
router.get('/active', protect, async (req, res) => {
    try {
        let methods = await PaymentMethod.find({ isActive: true }).sort('name');
        
        // Auto-seed if empty
        if (methods.length === 0 && (await PaymentMethod.countDocuments()) === 0) {
            const defaults = [
                { name: 'En espèce', description: 'Paiement en espèce à la livraison ou au guichet.', isActive: true },
                { name: 'Orange Money', description: 'Transférez via le #{numéro}', isActive: true },
                { name: 'MTN Mobile Money', description: 'Transférez via le #{numéro}', isActive: true },
                { name: 'Moov Money', description: 'Transférez via le #{numéro}', isActive: true },
                { name: 'Wave', description: 'Transférez via l\'appli', isActive: true },
            ];
            await PaymentMethod.insertMany(defaults);
            methods = await PaymentMethod.find({ isActive: true }).sort('name');
        }

        res.json({
            success: true,
            data: methods
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// @route   GET /api/payment-methods
// @desc    Récupérer tous les moyens de paiement
// @access  Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const methods = await PaymentMethod.find({}).sort('name');
        res.json({
            success: true,
            data: methods
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// @route   POST /api/payment-methods
// @desc    Créer un moyen de paiement
// @access  Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, description, image, isActive } = req.body;

        const newMethod = await PaymentMethod.create({
            name,
            description,
            image,
            isActive
        });

        res.status(201).json({
            success: true,
            data: newMethod
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erreur lors de la création du moyen de paiement' });
    }
});

// @route   PUT /api/payment-methods/:id
// @desc    Mettre à jour un moyen de paiement
// @access  Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        let method = await PaymentMethod.findById(req.params.id);

        if (!method) {
            return res.status(404).json({ success: false, message: 'Moyen de paiement non trouvé' });
        }

        method = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: method
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour' });
    }
});

// @route   DELETE /api/payment-methods/:id
// @desc    Supprimer un moyen de paiement
// @access  Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const method = await PaymentMethod.findById(req.params.id);

        if (!method) {
            return res.status(404).json({ success: false, message: 'Moyen de paiement non trouvé' });
        }

        await method.deleteOne();

        res.json({
            success: true,
            message: 'Moyen de paiement supprimé'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
    }
});

module.exports = router;
