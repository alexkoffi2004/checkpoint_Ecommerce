import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Divider,
    Alert,
    CircularProgress,
    Grid,
    List,
    ListItem,
    ListItemText,
    Chip,
    Avatar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axios';
import {
    ArrowBack as ArrowBackIcon,
    Receipt as ReceiptIcon,
    LocalShipping as ShippingIcon,
    Payment as PaymentIcon,
    CheckCircleOutline as CheckCircleIcon,
    Person as PersonIcon,
    Map as MapIcon,
    OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

const UserOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                // Since this user route might not exist perfectly as /orders/user/:id 
                // We'll fetch all user orders and find by ID, or we fetch the specific order.
                // Assuming /orders/user/me returns all our orders:
                const res = await axiosInstance.get('/orders/user/me');
                if (res.data.orders) {
                    const foundOrder = res.data.orders.find(o => o._id === id);
                    if (foundOrder) {
                        setOrder(foundOrder);
                    } else {
                        setError('Commande introuvable');
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Erreur lors du chargement de la commande');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOrderStatusColor = (status) => {
        const statusMap = {
            'pending': { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1), label: 'En attente' },
            'processing': { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1), label: 'En cours' },
            'shipped': { color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1), label: 'Expédiée' },
            'delivered': { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1), label: 'Livrée' },
            'cancelled': { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1), label: 'Annulée' }
        };
        return statusMap[status] || { color: theme.palette.grey[500], bg: alpha(theme.palette.grey[500], 0.1), label: status };
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', p: 8 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !order) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')} sx={{ mb: 2 }}>
                    Retour aux commandes
                </Button>
                <Alert severity="error">{error || 'Commande introuvable'}</Alert>
            </Container>
        );
    }

    const currentStatus = getOrderStatusColor(order.status);

    return (
        <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 4, sm: 8 }, px: { xs: 1, sm: 2 } }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')} sx={{ mb: { xs: 2, sm: 3 } }}>
                Retour aux commandes
            </Button>
            
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 5 }, borderRadius: { xs: 3, md: 4 }, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                {/* Header Facture */}
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={4} gap={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: { xs: 48, sm: 64 }, height: { xs: 48, sm: 64 }, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                            <ReceiptIcon sx={{ fontSize: { xs: 24, sm: 35 } }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} fontWeight="800" gutterBottom>
                                Commande #{order._id.slice(-8).toUpperCase()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Passée le {formatDate(order.createdAt)}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip 
                        label={currentStatus.label} 
                        sx={{ 
                            color: currentStatus.color, 
                            bgcolor: currentStatus.bg, 
                            fontWeight: 700, 
                            px: 1, 
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }} 
                    />
                </Box>
                
                <Divider sx={{ mb: 4 }} />
                
                {/* Sections Infos */}
                <Grid container spacing={4} mb={4}>
                    {/* Livraison */}
                    <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <PersonIcon color="primary" />
                            <Typography variant="h6" fontWeight="700">Adresse de livraison</Typography>
                        </Box>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                            <Typography fontWeight="600">{order.shippingAddress.name}</Typography>
                            <Typography color="text.secondary">{order.shippingAddress.phone}</Typography>
                            <Typography color="text.secondary">{order.shippingAddress.email}</Typography>
                            {order.shippingAddress.address && <Typography mt={1}>{order.shippingAddress.address}</Typography>}
                            {order.shippingAddress.city && <Typography>{order.shippingAddress.city}</Typography>}
                            {order.shippingAddress.locationLink && (
                                <Button 
                                    variant="outlined" 
                                    color="info" 
                                    size="small" 
                                    startIcon={<MapIcon />} 
                                    endIcon={<OpenInNewIcon sx={{ fontSize: 14 }}/>}
                                    href={order.shippingAddress.locationLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600, display: 'inline-flex' }}
                                >
                                    Ouvrir dans Google Maps
                                </Button>
                            )}
                            {order.shippingAddress.deliveryInstructions && (
                                <Box mt={2} p={1.5} bgcolor="rgba(0,0,0,0.03)" borderRadius={2} borderLeft="3px solid" borderColor="grey.400">
                                    <Typography variant="caption" color="text.secondary" fontWeight="700" display="block" gutterBottom>INSTRUCTIONS :</Typography>
                                    <Typography variant="body2">{order.shippingAddress.deliveryInstructions}</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Paiement */}
                    <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <PaymentIcon color="primary" />
                            <Typography variant="h6" fontWeight="700">Information de paiement</Typography>
                        </Box>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, height: '100%' }}>
                            <Typography color="text.secondary" mb={1}>Méthode choisie :</Typography>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <Chip label={order.paymentMethod} color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                            </Box>
                            <Typography color="text.secondary" mb={1}>Type de paiement :</Typography>
                            <Typography fontWeight="600">
                                {order.paymentType === 'advance' ? 'Payé en avance' : 'Paiement à la livraison'}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Tracking Status */}
                {order.trackingNumber && (
                    <Box mb={4} p={3} bgcolor={alpha(theme.palette.info.main, 0.05)} borderRadius={2} border={`1px solid ${alpha(theme.palette.info.main, 0.2)}`}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <ShippingIcon color="info" />
                            <Typography fontWeight="700" color="info.main">Numéro de suivi colis :</Typography>
                            <Typography fontWeight="bold">{order.trackingNumber}</Typography>
                        </Box>
                    </Box>
                )}

                {/* Articles */}
                <Typography variant="h6" fontWeight="700" mb={2}>Articles de la commande</Typography>
                <Box component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, mb: 4 }}>
                    <List disablePadding>
                        {order.items.map((item, idx) => (
                            <React.Fragment key={item._id || idx}>
                                <ListItem sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                                    <Box display="flex" width={{ xs: '100%', sm: 'auto' }} alignItems="center" gap={2} flexGrow={1}>
                                        <Avatar src={item.image} variant="rounded" sx={{ width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 } }} />
                                        <Typography fontWeight="600" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                            {item.name}
                                        </Typography>
                                    </Box>
                                    <Box 
                                        display="flex" 
                                        justifyContent="space-between" 
                                        alignItems="center"
                                        width={{ xs: '100%', sm: 'auto' }}
                                        pl={{ xs: 8.5, sm: 0 }}
                                        mt={{ xs: 0.5, sm: 0 }}
                                    >
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: { sm: 3 } }}>
                                            Qté: {item.quantity}
                                        </Typography>
                                        <Typography fontWeight="700" color="primary.main" textAlign="right">
                                            {(item.price * item.quantity).toLocaleString()} FCFA
                                        </Typography>
                                    </Box>
                                </ListItem>
                                {idx < order.items.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Box>

                <Box display="flex" justifyContent={{ xs: 'center', sm: 'flex-end' }}>
                    <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: '#f8fafc', borderRadius: 2, width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 300 }, border: '1px solid #e2e8f0' }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography color="text.secondary">Sous-total</Typography>
                            <Typography fontWeight="500">{order.totalAmount.toLocaleString()} FCFA</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography color="text.secondary">Livraison</Typography>
                            <Typography color="success.main" fontWeight="600">Gratuit</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight="700" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Total Net</Typography>
                            <Typography variant="h5" color="primary.main" fontWeight="900" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                                {order.totalAmount.toLocaleString()} FCFA
                            </Typography>
                        </Box>
                    </Paper>
                </Box>

                {/* Confirmation de réception */}
                {order.deliveryConfirmation?.confirmed && (
                    <Box mt={4} p={3} bgcolor={alpha(theme.palette.success.main, 0.05)} borderRadius={2} borderLeft={`4px solid ${theme.palette.success.main}`}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <CheckCircleIcon color="success" />
                            <Typography fontWeight="700" color="success.main">Bon de réception signé</Typography>
                        </Box>
                        <Typography variant="body2">
                            Réception confirmée le {formatDate(order.deliveryConfirmation.confirmedAt)}
                        </Typography>
                        {order.deliveryConfirmation.notes && (
                            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                                Note: "{order.deliveryConfirmation.notes}"
                            </Typography>
                        )}
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default UserOrderDetail;
