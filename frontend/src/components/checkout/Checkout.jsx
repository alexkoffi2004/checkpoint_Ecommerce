import React, { useState, useEffect } from 'react';
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
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Avatar,
    IconButton,
    InputAdornment
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axios';
import { 
    Payment as PaymentIcon, 
    LocalShipping as LocalShippingIcon,
    GpsFixed as GpsFixedIcon,
    LocationCity as LocationCityIcon,
    Map as MapIcon,
    CheckCircle as CheckCircleIcon,
    ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Le nom est requis'),
    phone: Yup.string()
        .required('Le numéro de téléphone est requis')
        .matches(/^[0-9]{10}$/, 'Le numéro de téléphone doit contenir 10 chiffres'),
    email: Yup.string()
        .email('Email invalide')
        .required('L\'email est requis'),
    locationMethod: Yup.string().required('Veuillez choisir une méthode de livraison'),
    locationLink: Yup.string().when('locationMethod', {
        is: 'gps',
        then: () => Yup.string().required('Veuillez vous localiser via le bouton GPS').url('Lien invalide'),
        otherwise: () => Yup.string().nullable()
    }),
    address: Yup.string().when('locationMethod', {
        is: 'manual',
        then: () => Yup.string().required('L\'adresse est requise'),
        otherwise: () => Yup.string().nullable()
    }),
    city: Yup.string().when('locationMethod', {
        is: 'manual',
        then: () => Yup.string().required('La ville est requise'),
        otherwise: () => Yup.string().nullable()
    }),
    deliveryInstructions: Yup.string().nullable(),
    paymentType: Yup.string().required('Veuillez choisir le moment de paiement'),
    paymentMethod: Yup.string().required('Le moyen de paiement est requis')
});

const Checkout = () => {
    const cart = useCart();
    const auth = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [fetchingMethods, setFetchingMethods] = useState(true);
    
    // GPS State
    const [gettingLocation, setGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState(null);

    useEffect(() => {
        const fetchMethods = async () => {
            try {
                const res = await axiosInstance.get('/payment-methods/active');
                setPaymentMethods(res.data.data || []);
            } catch (err) {
                console.error('Erreur lors du chargement des moyens de paiement', err);
            } finally {
                setFetchingMethods(false);
            }
        };
        fetchMethods();
    }, []);

    const formik = useFormik({
        initialValues: {
            name: '',
            phone: '',
            email: auth.user?.email || '',
            locationMethod: 'gps', // 'gps' or 'manual'
            locationLink: '',
            address: '',
            city: '',
            deliveryInstructions: '',
            paymentType: 'delivery',
            paymentMethod: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                setError(null);

                const orderData = {
                    shippingAddress: {
                        name: values.name,
                        phone: values.phone,
                        email: values.email,
                        locationMethod: values.locationMethod,
                        locationLink: values.locationLink,
                        address: values.address,
                        city: values.city,
                        deliveryInstructions: values.deliveryInstructions
                    },
                    paymentType: values.paymentType,
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

                const response = await axiosInstance.post('/orders', orderData);

                if (response.data.success) {
                    await cart.clearCart();
                    navigate('/orders', { 
                        state: { 
                            showSuccess: true,
                            orderId: response.data.data._id
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

    const handleGetLocation = () => {
        setGettingLocation(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
            setGettingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const link = `https://maps.google.com/?q=${latitude},${longitude}`;
                formik.setFieldValue('locationLink', link);
                setGettingLocation(false);
            },
            (error) => {
                console.error(error);
                setLocationError("Impossible d'obtenir votre position. Veuillez autoriser l'accès ou utiliser la saisie manuelle.");
                setGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    if (cart.loading || fetchingMethods) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (!auth.user) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="warning">Vous devez être connecté pour passer une commande.</Alert>
            </Container>
        );
    }

    const { values, touched, errors, handleChange, setFieldValue } = formik;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Typography variant="h4" fontWeight="800" mb={4} textAlign="center">
                Finaliser ma commande
            </Typography>
            <Grid container spacing={4}>
                {/* Formulaire de commande */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}
                        <form onSubmit={formik.handleSubmit}>
                            <Typography variant="h6" fontWeight="700" gutterBottom>
                                1. Vos coordonnées
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="name"
                                        name="name"
                                        label="Nom complet"
                                        value={values.name}
                                        onChange={handleChange}
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="phone"
                                        name="phone"
                                        label="Numéro de téléphone (WhatsApp si possible)"
                                        value={values.phone}
                                        onChange={handleChange}
                                        error={touched.phone && Boolean(errors.phone)}
                                        helperText={touched.phone && errors.phone}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="email"
                                        name="email"
                                        label="Email"
                                        type="email"
                                        value={values.email}
                                        onChange={handleChange}
                                        error={touched.email && Boolean(errors.email)}
                                        helperText={touched.email && errors.email}
                                    />
                                </Grid>
                            </Grid>

                            <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mt: 4 }}>
                                2. Lieu de livraison
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                                <RadioGroup
                                    row
                                    name="locationMethod"
                                    value={values.locationMethod}
                                    onChange={(e) => {
                                        handleChange(e);
                                    }}
                                >
                                    <Paper elevation={0} sx={{ border: values.locationMethod === 'gps' ? '2px solid #1976d2' : '1px solid #e0e0e0', p: 1, mr: 2, mb: { xs: 2, sm: 0 }, borderRadius: 2, flex: 1, display: 'flex', alignItems: 'center' }}>
                                        <FormControlLabel 
                                            value="gps" 
                                            control={<Radio />} 
                                            label={<Box display="flex" alignItems="center" gap={1}><GpsFixedIcon color={values.locationMethod === 'gps' ? 'primary' : 'action'} /><Typography fontWeight="600">Utiliser ma position actuelle</Typography></Box>} 
                                            sx={{ m: 0, width: '100%' }}
                                        />
                                    </Paper>
                                    <Paper elevation={0} sx={{ border: values.locationMethod === 'manual' ? '2px solid #1976d2' : '1px solid #e0e0e0', p: 1, borderRadius: 2, flex: 1, display: 'flex', alignItems: 'center' }}>
                                        <FormControlLabel 
                                            value="manual" 
                                            control={<Radio />} 
                                            label={<Box display="flex" alignItems="center" gap={1}><LocationCityIcon color={values.locationMethod === 'manual' ? 'primary' : 'action'} /><Typography fontWeight="600">Saisir manuellement</Typography></Box>} 
                                            sx={{ m: 0, width: '100%' }}
                                        />
                                    </Paper>
                                </RadioGroup>
                            </FormControl>

                            {/* Section GPS */}
                            {values.locationMethod === 'gps' && (
                                <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1', mb: 3, textAlign: 'center' }}>
                                    {!values.locationLink ? (
                                        <>
                                            <Typography variant="body1" mb={2} color="text.secondary">
                                                Partagez votre position GPS exacte pour guider le livreur jusqu'à vous sans effort.
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                onClick={handleGetLocation}
                                                disabled={gettingLocation}
                                                startIcon={gettingLocation ? <CircularProgress size={20} color="inherit" /> : <GpsFixedIcon />}
                                                sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 700 }}
                                            >
                                                {gettingLocation ? 'Recherche en cours...' : 'Me localiser maintenant'}
                                            </Button>
                                            {locationError && (
                                                <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
                                                    {locationError}
                                                </Alert>
                                            )}
                                        </>
                                    ) : (
                                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                            <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />
                                            <Typography variant="h6" color="success.main" fontWeight="700">
                                                Position enregistrée !
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Le livreur recevra vos coordonnées exactes.
                                            </Typography>
                                            <Button size="small" onClick={() => setFieldValue('locationLink', '')} sx={{ mt: 1 }}>
                                                Re-localiser
                                            </Button>
                                        </Box>
                                    )}
                                    {touched.locationLink && errors.locationLink && !values.locationLink && (
                                        <Typography color="error" variant="caption" sx={{ mt: 2, display: 'block' }}>
                                            {errors.locationLink}
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {/* Section Manuelle */}
                            {values.locationMethod === 'manual' && (
                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                    <Grid item xs={12}>
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            Vous commandez pour un proche ou avez déjà un lien Maps ? Collez le lien direct ci-dessous.
                                        </Alert>
                                        <TextField
                                            fullWidth
                                            id="locationLink"
                                            name="locationLink"
                                            label="Lien Google Maps (Optionnel)"
                                            placeholder="https://maps.app.goo.gl/..."
                                            value={values.locationLink || ''}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <MapIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            id="address"
                                            name="address"
                                            label="Adresse et Quartier"
                                            value={values.address}
                                            onChange={handleChange}
                                            error={touched.address && Boolean(errors.address)}
                                            helperText={touched.address && errors.address}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            id="city"
                                            name="city"
                                            label="Ville"
                                            value={values.city}
                                            onChange={handleChange}
                                            error={touched.city && Boolean(errors.city)}
                                            helperText={touched.city && errors.city}
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="deliveryInstructions"
                                    name="deliveryInstructions"
                                    label="Complément d'adresse ou instructions (optionnel)"
                                    placeholder="Ex: Derrière la pharmacie, portail noir..."
                                    multiline
                                    rows={2}
                                    value={values.deliveryInstructions || ''}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mt: 4 }}>
                                3. Mode de paiement
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            
                            <FormControl component="fieldset" margin="normal" fullWidth>
                                <FormLabel component="legend" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                                    Quand souhaitez-vous payer ?
                                </FormLabel>
                                <RadioGroup
                                    row
                                    name="paymentType"
                                    value={values.paymentType}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setFieldValue('paymentMethod', '');
                                    }}
                                    sx={{ mb: 3 }}
                                >
                                    <Paper elevation={0} sx={{ border: values.paymentType === 'delivery' ? '2px solid #1976d2' : '1px solid #e0e0e0', p: 1, mr: 2, mb: {xs: 2, sm: 0 }, borderRadius: 2, flex: 1, display: 'flex', alignItems: 'center' }}>
                                        <FormControlLabel 
                                            value="delivery" 
                                            control={<Radio />} 
                                            label={<Box><Typography fontWeight="600">Payer à la livraison</Typography></Box>} 
                                            sx={{ m: 0, width: '100%' }}
                                        />
                                    </Paper>
                                    <Paper elevation={0} sx={{ border: values.paymentType === 'advance' ? '2px solid #1976d2' : '1px solid #e0e0e0', p: 1, borderRadius: 2, flex: 1, display: 'flex', alignItems: 'center' }}>
                                        <FormControlLabel 
                                            value="advance" 
                                            control={<Radio />} 
                                            label={<Box><Typography fontWeight="600">Payer en avance</Typography></Box>} 
                                            sx={{ m: 0, width: '100%' }}
                                        />
                                    </Paper>
                                </RadioGroup>
                            </FormControl>

                            <Typography variant="subtitle1" fontWeight="600" mb={2}>
                                Choisissez votre moyen de paiement :
                            </Typography>
                            
                            <Grid container spacing={2}>
                                {paymentMethods.map(method => (
                                    <Grid item xs={12} sm={6} key={method._id}>
                                        <Paper
                                            elevation={values.paymentMethod === method.name ? 3 : 1}
                                            sx={{
                                                p: 2,
                                                cursor: 'pointer',
                                                border: values.paymentMethod === method.name ? '2px solid #1976d2' : '1px solid #ddd',
                                                transition: 'all 0.2s',
                                                '&:hover': { borderColor: 'primary.main', bgcolor: '#f8fafc' },
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                            onClick={() => setFieldValue('paymentMethod', method.name)}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                {method.image ? (
                                                    <Avatar src={method.image} alt={method.name} variant="rounded" sx={{ width: 40, height: 40 }} />
                                                ) : (
                                                    <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'grey.200' }}>
                                                        <PaymentIcon color="action" />
                                                    </Avatar>
                                                )}
                                                <Typography fontWeight="700">{method.name}</Typography>
                                            </Box>
                                            {method.description && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {method.description}
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                            {touched.paymentMethod && errors.paymentMethod && (
                                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                    {errors.paymentMethod}
                                </Typography>
                            )}

                            <Grid item xs={12} sx={{ mt: 4 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    disabled={loading}
                                    sx={{ py: 2, borderRadius: 2, fontSize: '1.1rem', fontWeight: 700 }}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Confirmer ma commande'
                                    )}
                                </Button>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                {/* Résumé de la commande */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'sticky', top: 24 }}>
                        <Typography variant="h6" fontWeight="700" gutterBottom>
                            Résumé de la commande
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <List disablePadding>
                            {cart.cart.items.map((item) => (
                                <ListItem key={item._id} disableGutters sx={{ py: 1.5 }}>
                                    <ListItemText
                                        primary={<Typography fontWeight="600">{item.name}</Typography>}
                                        secondary={`Qté: ${item.quantity}`}
                                    />
                                    <Typography fontWeight="bold">
                                        {(item.price * item.quantity).toLocaleString()} FCFA
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="text.secondary">Sous-total</Typography>
                            <Typography fontWeight="500">{cart.cart.totalPrice.toLocaleString()} FCFA</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography color="text.secondary">Frais de livraison</Typography>
                            <Typography color="success.main" fontWeight="600">Gratuit</Typography>
                        </Box>
                        <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                            <Typography variant="h6" fontWeight="700">Total</Typography>
                            <Typography variant="h5" color="primary.main" fontWeight="800">
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