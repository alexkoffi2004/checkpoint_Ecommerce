const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc    Get all orders (admin only)
// @route   GET /api/orders/admin
// @access  Private/Admin
exports.getOrders = async (req, res) => {
    try {
        console.log('Order Controller - getOrders - User:', {
            id: req.user._id,
            role: req.user.role
        });

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log('Order Controller - getOrders - Query params:', {
            page,
            limit,
            skip
        });

        const orders = await Order.find()
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments();

        console.log('Order Controller - getOrders - Results:', {
            ordersCount: orders.length,
            total,
            page,
            pages: Math.ceil(total / limit)
        });

        res.json({
            success: true,
            orders,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        console.error('Order Controller - getOrders - Error:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des commandes',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }

        // Vérifier si l'utilisateur est admin ou le propriétaire de la commande
        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé à accéder à cette commande'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la commande'
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, trackingNumber, notes, deliveryConfirmation } = req.body;

        // Vérifier si le statut est valide
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const order = await Order.findById(req.params.id).populate('user', '_id');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }

        // Si l'utilisateur est admin
        if (req.user.role === 'admin') {
            const updateData = {
                status,
                adminUpdatedAt: new Date()
            };
            
            if (trackingNumber) updateData.trackingNumber = trackingNumber;
            if (notes) updateData.notes = notes;

            const updatedOrder = await Order.findByIdAndUpdate(
                req.params.id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).populate('user', 'name email phone');

            return res.json({
                success: true,
                order: updatedOrder
            });
        }
        // Si c'est un utilisateur normal
        else {
            // Vérifier si l'utilisateur est le propriétaire de la commande
            if (order.user._id.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé à modifier cette commande'
                });
            }

            // L'utilisateur ne peut que confirmer la réception
            if (status === 'delivered' && order.status === 'shipped') {
                const updateData = {
                    status: 'delivered',
                    deliveryConfirmation: {
                        confirmed: true,
                        confirmedAt: new Date(),
                        confirmedBy: req.user.id,
                        notes: deliveryConfirmation?.notes || ''
                    }
                };

                const updatedOrder = await Order.findByIdAndUpdate(
                    req.params.id,
                    { $set: updateData },
                    { new: true, runValidators: true }
                ).populate('user', 'name email phone');

                return res.json({
                    success: true,
                    order: updatedOrder
                });
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez que confirmer la réception d\'une commande expédiée'
                });
            }
        }
    } catch (err) {
        console.error('Order Controller - updateOrderStatus - Error:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du statut de la commande',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }

        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé à supprimer cette commande'
            });
        }

        await Order.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Commande supprimée avec succès'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la commande'
        });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, items, totalAmount } = req.body;
        console.log('Données reçues:', { shippingAddress, paymentMethod, items, totalAmount });

        // Vérifier si les données requises sont présentes
        if (!shippingAddress || !paymentMethod || !items || !totalAmount) {
            console.log('Données manquantes:', { shippingAddress, paymentMethod, items, totalAmount });
            return res.status(400).json({
                success: false,
                message: 'Toutes les informations requises doivent être fournies'
            });
        }

        // Vérifier si le panier n'est pas vide
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Le panier est vide'
            });
        }

        // Préparer les données de la commande
        const orderData = {
            user: req.user.id,
            items: items.map(item => ({
                product: item.product,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            })),
            totalAmount,
            shippingAddress,
            paymentMethod,
            status: 'pending'
        };

        console.log('Données de la commande:', orderData);

        // Créer la commande
        const order = await Order.create(orderData);
        console.log('Commande créée:', order);

        // Vider le panier de l'utilisateur
        await Cart.findOneAndUpdate(
            { user: req.user.id },
            { $set: { items: [], totalPrice: 0 } }
        );

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (err) {
        console.error('Erreur détaillée lors de la création de la commande:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la commande',
            error: err.message
        });
    }
};

// @desc    Get user orders
// @route   GET /api/orders/user/me
// @access  Private
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des commandes'
        });
    }
}; 