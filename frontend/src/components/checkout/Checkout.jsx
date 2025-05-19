import React, { useState } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
    Box,
    Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axios';

const validationSchema = Yup.object({
    name: Yup.string().required('Le nom est requis'),
    phone: Yup.string()
        .required('Le numéro de téléphone est requis')
        .matches(/^[0-9]{10}$/, 'Le numéro de téléphone doit contenir 10 chiffres'),
    email: Yup.string()
        .email('Email invalide')
        .required('L\'email est requis'),
    address: Yup.string().required('L\'adresse est requise'),
    city: Yup.string().required('La ville est requise'),
    deliveryInstructions: Yup.string(),
    paymentMethod: Yup.string().required('Le moyen de paiement est requis')
});

const Checkout = () => {
    const cart = useCart();
    const auth = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formik = useFormik({
        initialValues: {
            name: '',
            phone: '',
            email: auth.user?.email || '',
            address: '',
            city: '',
            deliveryInstructions: '',
            paymentMethod: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                setError(null);

                // Préparation des données de la commande
                const orderData = {
                    shippingAddress: {
                        name: values.name,
                        phone: values.phone,
                        email: values.email,
                        address: values.address,
                        city: values.city,
                        deliveryInstructions: values.deliveryInstructions
                    },
                    paymentMethod: values.paymentMethod,
                    items: cart.cart.items.map(item => ({
                        product: item.product._id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        image: item.image || item.product?.images?.[0] || '/images/default-product.png'
                    })),
                    totalAmount: cart.cart.totalPrice
                };

                console.log('Données de la commande à envoyer:', orderData);

                // Appel API pour créer la commande
                const response = await axiosInstance.post('/orders', orderData);

                console.log('Réponse du serveur:', response.data);

                if (response.data.success) {
                    // Vider le panier après la commande réussie
                    await cart.clearCart();
                    // Redirection vers la page d'accueil
                    navigate('/profile', { 
                        state: { 
                            orderId: response.data.data._id,
                            orderDetails: response.data.data,
                            showSuccess: true
                        }
                    });
                } else {
                    setError(response.data.message || 'Une erreur est survenue lors de la création de la commande');
                }
            } catch (err) {
                console.error('Erreur lors de la création de la commande:', err);
                setError(err.response?.data?.message || 'Une erreur est survenue lors de la création de la commande');
            } finally {
                setLoading(false);
            }
        }
    });

    // Vérifier si le panier est en cours de chargement
    if (cart.loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    // Vérifier s'il y a une erreur de chargement du panier
    if (cart.error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {cart.error}
                </Alert>
            </Container>
        );
    }

    // Vérifier si l'utilisateur est connecté
    if (!auth.user) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="warning">
                    Vous devez être connecté pour passer une commande.
                </Alert>
            </Container>
        );
    }

    // Vérifier si le panier existe et contient des articles
    if (!cart.cart || !cart.cart.items || cart.cart.items.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="info">
                    Votre panier est vide. Continuez vos achats pour passer une commande.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={4}>
                {/* Formulaire de commande */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Informations de livraison
                        </Typography>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="name"
                                        name="name"
                                        label="Nom complet"
                                        value={formik.values.name}
                                        onChange={formik.handleChange}
                                        error={formik.touched.name && Boolean(formik.errors.name)}
                                        helperText={formik.touched.name && formik.errors.name}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="phone"
                                        name="phone"
                                        label="Numéro de téléphone"
                                        value={formik.values.phone}
                                        onChange={formik.handleChange}
                                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                                        helperText={formik.touched.phone && formik.errors.phone}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="email"
                                        name="email"
                                        label="Email"
                                        type="email"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        error={formik.touched.email && Boolean(formik.errors.email)}
                                        helperText={formik.touched.email && formik.errors.email}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="address"
                                        name="address"
                                        label="Adresse"
                                        value={formik.values.address}
                                        onChange={formik.handleChange}
                                        error={formik.touched.address && Boolean(formik.errors.address)}
                                        helperText={formik.touched.address && formik.errors.address}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="city"
                                        name="city"
                                        label="Ville"
                                        value={formik.values.city}
                                        onChange={formik.handleChange}
                                        error={formik.touched.city && Boolean(formik.errors.city)}
                                        helperText={formik.touched.city && formik.errors.city}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="deliveryInstructions"
                                        name="deliveryInstructions"
                                        label="Instructions de livraison (optionnel)"
                                        multiline
                                        rows={3}
                                        value={formik.values.deliveryInstructions}
                                        onChange={formik.handleChange}
                                        error={formik.touched.deliveryInstructions && Boolean(formik.errors.deliveryInstructions)}
                                        helperText={formik.touched.deliveryInstructions && formik.errors.deliveryInstructions}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                        Moyen de paiement
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Paper
                                                elevation={formik.values.paymentMethod === 'orange' ? 3 : 1}
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    border: formik.values.paymentMethod === 'orange' ? '2px solid #1976d2' : '1px solid #ddd',
                                                    '&:hover': { borderColor: 'primary.main' }
                                                }}
                                                onClick={() => formik.setFieldValue('paymentMethod', 'orange')}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <img src="/images/orange-money.png" alt="Orange Money" style={{ height: 40 }} />
                                                    <Typography>Orange Money</Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper
                                                elevation={formik.values.paymentMethod === 'moov' ? 3 : 1}
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    border: formik.values.paymentMethod === 'moov' ? '2px solid #1976d2' : '1px solid #ddd',
                                                    '&:hover': { borderColor: 'primary.main' }
                                                }}
                                                onClick={() => formik.setFieldValue('paymentMethod', 'moov')}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <img src="/images/moov-money.png" alt="Moov Money" style={{ height: 40 }} />
                                                    <Typography>Moov Money</Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper
                                                elevation={formik.values.paymentMethod === 'mtn' ? 3 : 1}
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    border: formik.values.paymentMethod === 'mtn' ? '2px solid #1976d2' : '1px solid #ddd',
                                                    '&:hover': { borderColor: 'primary.main' }
                                                }}
                                                onClick={() => formik.setFieldValue('paymentMethod', 'mtn')}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <img src="/images/mtn-money.png" alt="MTN Mobile Money" style={{ height: 40 }} />
                                                    <Typography>MTN Mobile Money</Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper
                                                elevation={formik.values.paymentMethod === 'wave' ? 3 : 1}
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    border: formik.values.paymentMethod === 'wave' ? '2px solid #1976d2' : '1px solid #ddd',
                                                    '&:hover': { borderColor: 'primary.main' }
                                                }}
                                                onClick={() => formik.setFieldValue('paymentMethod', 'wave')}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <img src="/images/wave.png" alt="Wave" style={{ height: 40 }} />
                                                    <Typography>Wave</Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        size="large"
                                        disabled={loading || !formik.isValid}
                                    >
                                        {loading ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            'Passer la commande'
                                        )}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                {/* Résumé de la commande */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Résumé de la commande
                        </Typography>
                        <List>
                            {cart.cart.items.map((item) => (
                                <ListItem key={item._id} divider>
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Sous-total</Typography>
                            <Typography>{cart.cart.totalPrice.toLocaleString()} FCFA</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Frais de livraison</Typography>
                            <Typography>Gratuit</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Total</Typography>
                            <Typography variant="h6" color="primary">
                                {cart.cart.totalPrice.toLocaleString()} FCFA
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Checkout; 