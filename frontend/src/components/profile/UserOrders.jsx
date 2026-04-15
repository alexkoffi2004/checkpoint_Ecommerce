import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Button,
    Divider,
    Alert,
    Snackbar,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    useTheme,
    alpha,
    Avatar
} from '@mui/material';
import { 
    LocalShipping as ShippingIcon,
    DateRange as DateRangeIcon,
    CheckCircleOutline as CheckCircleIcon,
    Receipt as ReceiptIcon,
    ArrowBack as ArrowBackIcon,
    ShoppingBag as ShoppingBagIcon
} from '@mui/icons-material';
import axiosInstance from '../../config/axios';
import { useNavigate, useLocation } from 'react-router-dom';

const UserOrders = () => {
    const theme = useTheme();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [errorOrders, setErrorOrders] = useState(null);
    const [success, setSuccess] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [confirmationNotes, setConfirmationNotes] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [justOrderedId, setJustOrderedId] = useState(null);

    useEffect(() => {
        loadOrders();
        
        // Handle checkout success
        if (location.state?.showSuccess && location.state?.orderId) {
            setJustOrderedId(location.state.orderId);
            setSuccessDialogOpen(true);
            
            // Clear the state so it doesn't pop up again on refresh
            window.history.replaceState({}, document.title)
        }
    }, [location.state]);

    const loadOrders = async () => {
        try {
            setLoadingOrders(true);
            setErrorOrders(null);
            const response = await axiosInstance.get('/orders/user/me');
            setOrders(response.data.orders || []);
        } catch (err) {
            console.error('Erreur lors du chargement des commandes:', err);
            setErrorOrders(err.response?.data?.message || 'Erreur lors du chargement des commandes');
        } finally {
            setLoadingOrders(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getOrderStatusColor = (status) => {
        const statusMap = {
            'pending': { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1), label: 'En attente' },
            'processing': { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1), label: 'En cours de traitement' },
            'shipped': { color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1), label: 'Expédiée' },
            'delivered': { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1), label: 'Livrée' },
            'cancelled': { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1), label: 'Annulée' }
        };
        return statusMap[status] || { color: theme.palette.grey[500], bg: alpha(theme.palette.grey[500], 0.1), label: status };
    };

    const handleConfirmDelivery = async () => {
        try {
            setUpdatingStatus(true);
            const res = await axiosInstance.put(`/orders/${selectedOrder._id}/status`, {
                status: 'delivered',
                deliveryConfirmation: {
                    notes: confirmationNotes
                }
            });
            setOrders(orders.map(order => 
                order._id === selectedOrder._id ? res.data.order : order
            ));
            setSuccess('Confirmation de réception enregistrée avec succès');
            setConfirmDialogOpen(false);
            setSelectedOrder(null);
            setConfirmationNotes('');
        } catch (err) {
            setErrorOrders(err.response?.data?.message || 'Erreur lors de la confirmation de réception');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const openConfirmDialog = (order) => {
        setSelectedOrder(order);
        setConfirmDialogOpen(true);
    };

    const renderOrderDetails = (order) => {
        const statusDetails = getOrderStatusColor(order.status);
        
        return (
            <Paper 
                key={order._id} 
                elevation={0}
                sx={{ 
                    p: { xs: 2, sm: 4 }, 
                    mb: 4, 
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s',
                    '&:hover': {
                        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                {/* Header de la commande */}
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={3} gap={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 48, height: 48 }}>
                            <ReceiptIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="800">
                                Commande #{order._id.slice(-6).toUpperCase()}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} color="text.secondary" mt={0.5}>
                                <DateRangeIcon fontSize="small" />
                                <Typography variant="body2" fontWeight="500">
                                    {formatDate(order.createdAt)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    
                    <Box display="flex" flexDirection="column" alignItems={{ xs: 'flex-start', md: 'flex-end' }} gap={1}>
                        <Box display="flex" gap={1} flexWrap="wrap">
                            <Chip
                                label={statusDetails.label}
                                sx={{ 
                                    color: statusDetails.color, 
                                    bgcolor: statusDetails.bg,
                                    fontWeight: 700,
                                    px: 1
                                }}
                            />
                            {order.deliveryConfirmation?.confirmed && (
                                <Chip
                                    icon={<CheckCircleIcon />}
                                    label={`Reçue le ${formatDate(order.deliveryConfirmation.confirmedAt)}`}
                                    color="success"
                                    variant="outlined"
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            )}
                        </Box>
                        {order.status === 'shipped' && !order.deliveryConfirmation?.confirmed && (
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => openConfirmDialog(order)}
                                disabled={updatingStatus}
                                startIcon={<CheckCircleIcon />}
                                sx={{ borderRadius: 2, fontWeight: 700, mt: 1, textTransform: 'none' }}
                            >
                                J'ai reçu ma commande
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => navigate(`/orders/${order._id}`)}
                            sx={{ borderRadius: 2, fontWeight: 700, mt: 1, textTransform: 'none' }}
                        >
                            Détails de la commande
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

                {/* Détails des articles */}
                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={1} mb={2}>
                    Articles commandés
                </Typography>
                
                <List sx={{ p: 0 }}>
                    {order.items.map((item, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography variant="body1" fontWeight="600" color="text.primary">
                                    {item.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Quantité: {item.quantity} × {(item.price || 0).toLocaleString()} FCFA
                                </Typography>
                            </Box>
                            <Typography variant="subtitle1" fontWeight="700" color="primary.main">
                                {((item.price || 0) * item.quantity).toLocaleString()} FCFA
                            </Typography>
                        </ListItem>
                    ))}
                </List>

                <Box sx={{ bgcolor: alpha(theme.palette.grey[100], 0.5), p: 2, borderRadius: 2, mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="600" color="text.secondary">
                            Total Réglé
                        </Typography>
                        <Typography variant="h5" fontWeight="800" color="primary.main">
                            {(order.totalAmount || 0).toLocaleString()} FCFA
                        </Typography>
                    </Box>
                </Box>

                {order.deliveryConfirmation?.notes && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2, borderLeft: '4px solid', borderColor: 'info.main' }}>
                        <Typography variant="subtitle2" fontWeight="700" color="text.primary" gutterBottom>
                            Note de réception :
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {order.deliveryConfirmation.notes}
                        </Typography>
                    </Box>
                )}
            </Paper>
        );
    };

    return (
        <Container maxWidth="md" sx={{ mt: 2, mb: 8 }}>
            {/* Header */}
            <Box sx={{ mb: 5, textAlign: 'center' }}>
                <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                    <ShoppingBagIcon fontSize="large" />
                </Avatar>
                <Typography variant="h3" fontWeight="800" color="text.primary" gutterBottom>
                    Mes Commandes
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Retrouvez ici l'historique complet de vos achats et suivez vos livraisons.
                </Typography>
            </Box>

            {loadingOrders ? (
                <Box display="flex" justifyContent="center" alignItems="center" p={8} flexDirection="column" gap={2}>
                    <CircularProgress size={48} thickness={4} />
                    <Typography color="text.secondary" fontWeight="500">Chargement de vos commandes...</Typography>
                </Box>
            ) : errorOrders ? (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                    {errorOrders}
                </Alert>
            ) : !orders || orders.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px dashed', borderColor: 'grey.300', bgcolor: 'transparent' }}>
                    <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: alpha(theme.palette.grey[400], 0.1), color: 'grey.400' }}>
                        <ShippingIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" color="text.primary" gutterBottom fontWeight="700">Aucune commande pour le moment</Typography>
                    <Typography variant="body1" color="text.secondary" mb={4}>
                        Commencez votre shopping dès maintenant et remplissez votre panier avec nos meilleurs produits !
                    </Typography>
                    <Button 
                        variant="contained" 
                        size="large" 
                        onClick={() => navigate('/products')}
                        sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700, textTransform: 'none' }}
                    >
                        Découvrir nos produits
                    </Button>
                </Paper>
            ) : (
                <Box>
                    {orders.map((order) => renderOrderDetails(order))}
                </Box>
            )}

            {/* Modal de Succès (Post-Checkout WhatsApp) */}
            <Dialog 
                open={successDialogOpen} 
                onClose={() => setSuccessDialogOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 4, p: 2, maxWidth: 450 }
                }}
            >
                <DialogContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: '#25D366', color: '#fff', boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)' }}>
                        <CheckCircleIcon sx={{ fontSize: 48 }} />
                    </Avatar>
                    <Typography variant="h4" fontWeight="900" gutterBottom color="text.primary">
                        Félicitations !
                    </Typography>
                    <Typography variant="h6" color="text.secondary" fontWeight="400" mb={3}>
                        Votre commande <Typography component="span" fontWeight="700" color="primary">#{justOrderedId?.slice(-6).toUpperCase()}</Typography> a bien été enregistrée.
                    </Typography>
                    <Paper elevation={0} sx={{ bgcolor: alpha('#25D366', 0.1), p: 2, borderRadius: 3, border: '1px solid', borderColor: alpha('#25D366', 0.2) }}>
                        <Typography variant="body1" fontWeight="600" color="#128C7E">
                            Un membre de l'équipe vous contactera d'ici peu sur WhatsApp pour confirmer la livraison.
                        </Typography>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button 
                        variant="contained" 
                        size="large"
                        onClick={() => setSuccessDialogOpen(false)} 
                        sx={{ borderRadius: 3, px: 5, py: 1.5, fontWeight: 700 }}
                    >
                        C'est compris
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de confirmation de réception */}
            <Dialog 
                open={confirmDialogOpen} 
                onClose={() => !updatingStatus && setConfirmDialogOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 3, p: 1, maxWidth: 400 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pb: 1 }}>
                    Confirmer la réception
                </DialogTitle>
                <DialogContent>
                    <Box textAlign="center" mb={3}>
                        <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 2, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                            <CheckCircleIcon />
                        </Avatar>
                        <Typography variant="body1" color="text.secondary">
                            Avez-vous bien reçu votre commande <strong>#{selectedOrder?._id.slice(-6).toUpperCase()}</strong> en bon état ?
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Laisser un commentaire (optionnel)"
                        value={confirmationNotes}
                        onChange={(e) => setConfirmationNotes(e.target.value)}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
                    <Button 
                        onClick={() => setConfirmDialogOpen(false)} 
                        disabled={updatingStatus}
                        sx={{ borderRadius: 2, fontWeight: 600, color: 'text.secondary', px: 3 }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirmDelivery}
                        variant="contained"
                        color="success"
                        disabled={updatingStatus}
                        sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                        startIcon={updatingStatus ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                    >
                        Je confirme
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width: '100%', borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                    {success}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default UserOrders;
