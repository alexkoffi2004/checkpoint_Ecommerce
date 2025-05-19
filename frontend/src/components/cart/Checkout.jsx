import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  Container, Paper, Typography, Box, Grid, TextField, Button, Divider, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Carte bancaire');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Votre panier est vide.</Alert>
      </Container>
    );
  }

  const handleAddressChange = (field) => (e) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const orderData = {
        user: user._id,
        items: cart.items.map(item => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        total: cart.totalPrice,
        shippingAddress,
        paymentMethod
      };
      await axios.post('/orders', orderData);
      setSuccess(true);
      clearCart();
      setConfirmOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la validation de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Passer la commande</Typography>
        <Divider sx={{ mb: 2 }} />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Commande validée ! Redirection vers votre profil...</Alert>}
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom>Adresse de livraison</Typography>
            <TextField
              label="Rue"
              fullWidth
              required
              value={shippingAddress.street}
              onChange={handleAddressChange('street')}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Ville"
              fullWidth
              required
              value={shippingAddress.city}
              onChange={handleAddressChange('city')}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Code postal"
              fullWidth
              required
              value={shippingAddress.postalCode}
              onChange={handleAddressChange('postalCode')}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Pays"
              fullWidth
              required
              value={shippingAddress.country}
              onChange={handleAddressChange('country')}
              sx={{ mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>Méthode de paiement</Typography>
            <TextField
              label="Méthode de paiement"
              fullWidth
              required
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleOrder}
              disabled={loading || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country}
              sx={{ mt: 2 }}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Valider la commande'}
            </Button>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="h6" gutterBottom>Résumé du panier</Typography>
            <Divider sx={{ mb: 2 }} />
            {cart.items.map(item => (
              <Box key={item.product} sx={{ mb: 2 }}>
                <Grid container alignItems="center">
                  <Grid item xs={7}>
                    <Typography>{item.name}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography>x{item.quantity}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography align="right">{(item.price * item.quantity).toFixed(0)} FCFA</Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" align="right">
              <b>Total : {cart.totalPrice.toFixed(0)} FCFA</b>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Dialog open={confirmOpen} onClose={() => { setConfirmOpen(false); navigate('/profile'); }}>
        <DialogTitle>Confirmation de commande</DialogTitle>
        <DialogContent>
          <Typography>Votre commande a été validée avec succès !</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setConfirmOpen(false); navigate('/profile'); }}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Checkout; 