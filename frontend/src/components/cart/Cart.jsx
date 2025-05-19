import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Button,
    IconButton,
    TextField,
    Divider,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, loading, error, updateQuantity, removeFromCart, clearCart } = useCart();
    const [quantityError, setQuantityError] = useState(null);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);

    const handleQuantityChange = async (productId, newQuantity) => {
        try {
            setQuantityError(null);
            if (newQuantity < 1) {
                setQuantityError('La quantité doit être au moins 1');
                return;
            }
            await updateQuantity(productId, newQuantity);
        } catch (err) {
            setQuantityError(err.message);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await removeFromCart(productId);
        } catch (err) {
            setQuantityError(err.message);
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCart();
            setClearDialogOpen(false);
        } catch (err) {
            setQuantityError(err.message);
        }
    };

    if (!user) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="info">
                    Veuillez vous connecter pour accéder à votre panier.
                    <Button
                        color="primary"
                        onClick={() => navigate('/login')}
                        sx={{ ml: 2 }}
                    >
                        Se connecter
                    </Button>
                </Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                        Votre panier est vide
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/products')}
                        sx={{ mt: 2 }}
                    >
                        Continuer vos achats
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {quantityError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {quantityError}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Liste des produits */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Votre panier ({cart.totalItems} articles)
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {cart.items.map((item) => (
                            <Box key={item.product} sx={{ mb: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={3} sm={2}>
                                        <Box
                                            component="img"
                                            src={item.image}
                                            alt={item.name}
                                            sx={{
                                                width: '100%',
                                                height: 'auto',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={9} sm={4}>
                                        <Typography variant="subtitle1" noWrap>
                                            {item.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.price.toFixed(0)} FCFA
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.product, parseInt(e.target.value))}
                                            inputProps={{ min: 1 }}
                                            sx={{ width: '80px' }}
                                        />
                                    </Grid>
                                    <Grid item xs={4} sm={2}>
                                        <Typography variant="subtitle1">
                                            {(item.price * item.quantity).toFixed(0)} FCFA
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} sm={1}>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleRemoveItem(item.product)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                                <Divider sx={{ mt: 2 }} />
                            </Box>
                        ))}

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                color="error"
                                onClick={() => setClearDialogOpen(true)}
                            >
                                Vider le panier
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Résumé de la commande */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Résumé de la commande
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ mb: 2 }}>
                            <Grid container justifyContent="space-between">
                                <Grid item>
                                    <Typography>Sous-total</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography>{cart.totalPrice.toFixed(0)} FCFA</Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            onClick={() => navigate('/checkout')}
                        >
                            Passer la commande
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* Dialog de confirmation pour vider le panier */}
            <Dialog
                open={clearDialogOpen}
                onClose={() => setClearDialogOpen(false)}
            >
                <DialogTitle>Vider le panier</DialogTitle>
                <DialogContent>
                    <Typography>
                        Êtes-vous sûr de vouloir vider votre panier ?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearDialogOpen(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleClearCart} color="error">
                        Vider le panier
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Cart; 