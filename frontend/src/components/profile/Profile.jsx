import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Divider,
    Alert,
    Snackbar,
    CircularProgress,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    ShoppingBag as OrderIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../config/axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [errorOrders, setErrorOrders] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            postalCode: '',
            country: ''
        }
    });
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [confirmationNotes, setConfirmationNotes] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || {
                    street: '',
                    city: '',
                    postalCode: '',
                    country: ''
                }
            });
            loadOrders();
        }
    }, [user]);

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

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || {
                street: '',
                city: '',
                postalCode: '',
                country: ''
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            await updateUser(formData);
            setSuccess('Profil mis à jour avec succès');
            setEditMode(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getOrderStatusColor = (status) => {
        const colors = {
            'pending': 'warning',
            'processing': 'info',
            'shipped': 'primary',
            'delivered': 'success',
            'cancelled': 'error'
        };
        return colors[status] || 'default';
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            setUpdatingStatus(true);
            const res = await axiosInstance.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(orders.map(order => 
                order._id === orderId ? res.data.order : order
            ));
            setSuccess('Statut de la commande mis à jour avec succès');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour du statut');
        } finally {
            setUpdatingStatus(false);
        }
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
            setError(err.response?.data?.message || 'Erreur lors de la confirmation de réception');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const openConfirmDialog = (order) => {
        setSelectedOrder(order);
        setConfirmDialogOpen(true);
    };

    const renderOrders = () => {
        if (loadingOrders) {
            return (
                <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                </Box>
            );
        }

        if (errorOrders) {
            return (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorOrders}
                </Alert>
            );
        }

        if (!orders || orders.length === 0) {
            return (
                <Box p={3} textAlign="center">
                    <Typography variant="body1" color="textSecondary">
                        Vous n'avez pas encore de commandes
                    </Typography>
                </Box>
            );
        }

        return (
            <List>
                {orders.map((order) => (
                    <Paper key={order._id} sx={{ mb: 2, p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">
                                Commande #{order._id.slice(-6)}
                            </Typography>
                            <Chip
                                label={order.status}
                                color={getOrderStatusColor(order.status)}
                                size="small"
                            />
                        </Box>
                        <List>
                            {order.items.map((item, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={`Quantité: ${item.quantity}`}
                                    />
                                    <Typography>
                                        {(item.price * item.quantity).toLocaleString()} FCFA
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                        <Divider sx={{ my: 2 }} />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1">
                                Total: {order.totalAmount?.toLocaleString() || '0'} FCFA
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {formatDate(order.createdAt)}
                            </Typography>
                        </Box>
                        {order.status === 'shipped' && (
                            <Box mt={2} display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => openConfirmDialog(order)}
                                    disabled={updatingStatus}
                                >
                                    Confirmer la réception
                                </Button>
                            </Box>
                        )}
                    </Paper>
                ))}
            </List>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Bouton de retour */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ color: 'text.secondary' }}
                >
                    Retour
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Informations du profil */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" component="h1">
                                Mon Profil
                            </Typography>
                            {!editMode ? (
                                <Button
                                    startIcon={<EditIcon />}
                                    onClick={handleEditClick}
                                >
                                    Modifier
                                </Button>
                            ) : (
                                <Box>
                                    <Button
                                        startIcon={<CancelIcon />}
                                        onClick={handleCancelEdit}
                                        sx={{ mr: 1 }}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        Enregistrer
                                    </Button>
                                </Box>
                            )}
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                {success}
                            </Alert>
                        )}

                        {editMode ? (
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Nom"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Téléphone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Adresse
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Rue"
                                            name="address.street"
                                            value={formData.address.street}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Ville"
                                            name="address.city"
                                            value={formData.address.city}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Code postal"
                                            name="address.postalCode"
                                            value={formData.address.postalCode}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Pays"
                                            name="address.country"
                                            value={formData.address.country}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                </Grid>
                            </form>
                        ) : (
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <PersonIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Nom"
                                        secondary={user.name}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <EmailIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Email"
                                        secondary={user.email}
                                    />
                                </ListItem>
                                {user.phone && (
                                    <ListItem>
                                        <ListItemIcon>
                                            <PhoneIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Téléphone"
                                            secondary={user.phone}
                                        />
                                    </ListItem>
                                )}
                                {user.address && (
                                    <>
                                        <ListItem>
                                            <ListItemIcon>
                                                <LocationIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Adresse"
                                                secondary={
                                                    <>
                                                        {user.address.street && <>{user.address.street}<br /></>}
                                                        {user.address.city && <>{user.address.city}, </>}
                                                        {user.address.postalCode && <>{user.address.postalCode}<br /></>}
                                                        {user.address.country && user.address.country}
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    </>
                                )}
                            </List>
                        )}
                    </Paper>
                </Grid>

                {/* Commandes */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={{ mb: 3 }}
                        >
                            <Tab icon={<OrderIcon />} label="Mes Commandes" />
                        </Tabs>

                        {activeTab === 0 && (
                            <>
                                {renderOrders()}
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>Mes commandes récentes</Typography>
                {loadingOrders ? <CircularProgress /> : errorOrders ? <Alert severity="error">{errorOrders}</Alert> : (orders.length === 0 ? <Alert severity="info">Aucune commande récente.</Alert> : (orders.map((order) => (
                    <Paper key={order._id} sx={{ p: 2, mb: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1">Commande #{order._id.slice(-6)}</Typography>
                                <Typography variant="body2">Passée le {formatDate(order.createdAt)}</Typography>
                                <Typography variant="body2">Total : {order.totalAmount?.toLocaleString() || '0'} FCFA</Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={order.status}
                                        color={getOrderStatusColor(order.status)}
                                        size="small"
                                    />
                                    {order.adminUpdatedAt && (
                                        <Chip
                                            label={`Mise à jour le ${formatDate(order.adminUpdatedAt)}`}
                                            variant="outlined"
                                            size="small"
                                        />
                                    )}
                                    {order.deliveryConfirmation?.confirmed && (
                                        <Chip
                                            label={`Reçue le ${formatDate(order.deliveryConfirmation.confirmedAt)}`}
                                            color="success"
                                            variant="outlined"
                                            size="small"
                                        />
                                    )}
                                </Box>
                                {order.deliveryConfirmation?.notes && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Note: {order.deliveryConfirmation.notes}
                                    </Typography>
                                )}
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                {order.status === 'shipped' && !order.deliveryConfirmation?.confirmed && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => openConfirmDialog(order)}
                                        disabled={updatingStatus}
                                        sx={{ mr: 1 }}
                                    >
                                        Confirmer la réception
                                    </Button>
                                )}
                                <Button variant="outlined" onClick={() => navigate(`/profile/orders/${order._id}`)}>
                                    Voir le détail
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                ))))}
            </Box>

            {/* Dialog de confirmation de réception */}
            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Confirmer la réception</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Confirmez-vous avoir bien reçu votre commande #{selectedOrder?._id.slice(-6)} ?
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Notes (optionnel)"
                        value={confirmationNotes}
                        onChange={(e) => setConfirmationNotes(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>Annuler</Button>
                    <Button
                        onClick={handleConfirmDelivery}
                        variant="contained"
                        color="primary"
                        disabled={updatingStatus}
                    >
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess(null)}
            >
                <Alert severity="success" onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Profile; 