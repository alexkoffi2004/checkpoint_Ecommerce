import React, { useState } from 'react';
import { Container, Paper, Box, Typography, Grid, Button, FormControl, InputLabel, Select, MenuItem, TableContainer, Table, TableHead, TableBody, TableFooter, TableRow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../../actions/orderActions';
import { useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';

const AdminOrderDetail = ({ order }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [orderState, setOrder] = useState(order);

    const handleUpdateStatus = async () => {
        setLoading(true);
        await dispatch(updateOrderStatus(orderState._id, orderState.status));
        setLoading(false);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4">
                        Détails de la commande #{order._id}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/admin/orders')}
                        >
                            Retour à la liste
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdateStatus}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Mettre à jour le statut'}
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {/* Informations client */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Informations client
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">
                                    Nom: {order.shippingAddress.name}
                                </Typography>
                                <Typography variant="subtitle1">
                                    Téléphone: {order.shippingAddress.phone}
                                </Typography>
                                <Typography variant="subtitle1">
                                    Ville: {order.shippingAddress.city}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Moyen de paiement
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                                <img 
                                    src={`/images/${order.paymentMethod}-money.png`} 
                                    alt={order.paymentMethod} 
                                    style={{ height: 40 }} 
                                />
                                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                                    {order.paymentMethod === 'orange' ? 'Orange Money' :
                                     order.paymentMethod === 'moov' ? 'Moov Money' :
                                     order.paymentMethod === 'mtn' ? 'MTN Mobile Money' :
                                     'Wave'}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Statut de la commande */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Statut de la commande
                            </Typography>
                            <Box sx={{ mb: 3 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Statut</InputLabel>
                                    <Select
                                        value={order.status}
                                        onChange={(e) => setOrder({ ...order, status: e.target.value })}
                                        label="Statut"
                                    >
                                        <MenuItem value="pending">En attente</MenuItem>
                                        <MenuItem value="processing">En cours de traitement</MenuItem>
                                        <MenuItem value="shipped">Expédiée</MenuItem>
                                        <MenuItem value="delivered">Livrée</MenuItem>
                                        <MenuItem value="cancelled">Annulée</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">
                                    Date de commande: {new Date(order.createdAt).toLocaleDateString()}
                                </Typography>
                                <Typography variant="subtitle1">
                                    Dernière mise à jour: {new Date(order.updatedAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Détails des produits */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Produits commandés
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Produit</TableCell>
                                            <TableCell align="right">Prix unitaire</TableCell>
                                            <TableCell align="right">Quantité</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.items.map((item) => (
                                            <TableRow key={item._id}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                                                        />
                                                        <Typography>{item.name}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {item.price.toLocaleString()} FCFA
                                                </TableCell>
                                                <TableCell align="right">{item.quantity}</TableCell>
                                                <TableCell align="right">
                                                    {(item.price * item.quantity).toLocaleString()} FCFA
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={3} align="right">
                                                <Typography variant="subtitle1">Sous-total</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="subtitle1">
                                                    {order.totalAmount.toLocaleString()} FCFA
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={3} align="right">
                                                <Typography variant="subtitle1">Frais de livraison</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="subtitle1">Gratuit</Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={3} align="right">
                                                <Typography variant="h6">Total</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="h6" color="primary">
                                                    {order.totalAmount.toLocaleString()} FCFA
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default AdminOrderDetail; 