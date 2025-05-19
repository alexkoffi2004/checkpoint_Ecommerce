import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Alert,
    Snackbar,
    Pagination,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axiosInstance from '../../config/axios';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [formData, setFormData] = useState({
        status: '',
        trackingNumber: '',
        notes: ''
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        paymentStatus: ''
    });

    useEffect(() => {
        loadOrders();
    }, [page, filters]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            console.log('AdminOrders - Chargement des commandes...');
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                ...filters,
                _t: new Date().getTime()
            }).toString();
            const response = await axiosInstance.get(`/orders/admin?${queryParams}`);
            console.log('AdminOrders - Réponse complète:', response.data);
            console.log('AdminOrders - Structure d\'une commande:', response.data.orders?.[0]);
            if (response.data.success) {
                setOrders(response.data.orders || []);
                const total = parseInt(response.data.total) || 0;
                const limit = parseInt(response.data.limit) || 10;
                const totalPages = Math.max(1, Math.ceil(total / limit));
                setTotalPages(totalPages);
                setError('');
            } else {
                throw new Error(response.data.message || 'Erreur lors du chargement des commandes');
            }
        } catch (err) {
            console.error('AdminOrders - Erreur lors du chargement des commandes:', err);
            setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des commandes');
            setTotalPages(1);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (order = null) => {
        if (order) {
            setSelectedOrder(order);
            setFormData({
                status: order.status,
                trackingNumber: order.trackingNumber || '',
                notes: order.notes || ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOrder(null);
        setFormData({
            status: '',
            trackingNumber: '',
            notes: ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axiosInstance.put(`/orders/${selectedOrder._id}/status`, formData);
            if (response.data.success) {
                setSuccess('Commande mise à jour avec succès');
                handleCloseDialog();
                loadOrders();
            } else {
                throw new Error(response.data.message || 'Erreur lors de la mise à jour de la commande');
            }
        } catch (err) {
            console.error('AdminOrders - Erreur lors de la mise à jour de la commande:', err);
            setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de la commande');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/orders/admin/${id}`);
                if (response.data.success) {
                    setSuccess('Commande supprimée avec succès');
                    loadOrders();
                } else {
                    throw new Error(response.data.message || 'Erreur lors de la suppression de la commande');
                }
            } catch (err) {
                console.error('AdminOrders - Erreur lors de la suppression de la commande:', err);
                setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression de la commande');
            } finally {
                setLoading(false);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'info';
            case 'shipped':
                return 'primary';
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'En attente';
            case 'processing':
                return 'En traitement';
            case 'shipped':
                return 'Expédiée';
            case 'delivered':
                return 'Livrée';
            case 'cancelled':
                return 'Annulée';
            default:
                return status;
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'paid':
                return 'success';
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    const getPaymentStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'En attente';
            case 'paid':
                return 'Payée';
            case 'failed':
                return 'Échouée';
            default:
                return status;
        }
    };

    if (loading) return <Typography>Chargement...</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Gestion des Commandes</Typography>
                <Grid container spacing={2} sx={{ maxWidth: 400 }}>
                    <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Statut</InputLabel>
                            <Select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                label="Statut"
                            >
                                <MenuItem value="">Tous</MenuItem>
                                <MenuItem value="pending">En attente</MenuItem>
                                <MenuItem value="processing">En traitement</MenuItem>
                                <MenuItem value="shipped">Expédiée</MenuItem>
                                <MenuItem value="delivered">Livrée</MenuItem>
                                <MenuItem value="cancelled">Annulée</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Paiement</InputLabel>
                            <Select
                                name="paymentStatus"
                                value={filters.paymentStatus}
                                onChange={handleFilterChange}
                                label="Paiement"
                            >
                                <MenuItem value="">Tous</MenuItem>
                                <MenuItem value="pending">En attente</MenuItem>
                                <MenuItem value="paid">Payée</MenuItem>
                                <MenuItem value="failed">Échouée</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Référence</TableCell>
                            <TableCell>Client</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Paiement</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order._id}>
                                <TableCell>
                                    {order.orderNumber || order._id || 'N/A'}
                                </TableCell>
                                <TableCell>{order.user?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    {order.totalAmount ? `${order.totalAmount.toFixed(0)} FCFA` : 
                                     order.total ? `${order.total.toFixed(0)} FCFA` : 
                                     order.amount ? `${order.amount.toFixed(0)} FCFA` : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={getStatusLabel(order.status)}
                                        color={getStatusColor(order.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={getPaymentStatusLabel(order.paymentStatus)}
                                        color={getPaymentStatusColor(order.paymentStatus)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleOpenDialog(order)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDelete(order._id)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                />
            </Box>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedOrder ? 'Modifier la commande' : 'Nouvelle commande'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Statut</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        label="Statut"
                                    >
                                        <MenuItem value="pending">En attente</MenuItem>
                                        <MenuItem value="processing">En traitement</MenuItem>
                                        <MenuItem value="shipped">Expédiée</MenuItem>
                                        <MenuItem value="delivered">Livrée</MenuItem>
                                        <MenuItem value="cancelled">Annulée</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Numéro de suivi"
                                    name="trackingNumber"
                                    value={formData.trackingNumber}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess('')}
            >
                <Alert severity="success" onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminOrders; 