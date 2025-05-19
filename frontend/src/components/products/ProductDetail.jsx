import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Box,
    Button,
    Rating,
    Divider,
    TextField,
    Paper,
    Alert,
    CircularProgress,
    ImageList,
    ImageListItem,
    Chip,
    Snackbar,
    Breadcrumbs,
    Link
} from '@mui/material';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import { IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const validationSchema = Yup.object({
    rating: Yup.number()
        .required('La note est requise')
        .min(1, 'La note doit être entre 1 et 5')
        .max(5, 'La note doit être entre 1 et 5'),
    comment: Yup.string()
        .required('Le commentaire est requis')
        .min(10, 'Le commentaire doit contenir au moins 10 caractères')
        .max(500, 'Le commentaire ne doit pas dépasser 500 caractères')
});

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { product, error, loadProduct, addReview } = useProducts();
    const { addToCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(0);
    const [reviewError, setReviewError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [imageError, setImageError] = useState(false);
    const [imageLoadAttempts, setImageLoadAttempts] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [reviewText, setReviewText] = useState('');
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const fetchProduct = async () => {
            if (!id) {
                console.error('ID du produit manquant');
                return;
            }

            try {
                setIsLoading(true);
                await loadProduct(id);
            } catch (err) {
                console.error('Erreur dans ProductDetail:', err);
                if (isMounted) {
                    setSnackbar({
                        open: true,
                        message: err.message || 'Erreur lors du chargement du produit. Veuillez réessayer.',
                        severity: 'error'
                    });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProduct();
        return () => {
            isMounted = false;
        };
    }, [id, loadProduct]);

    const handleImageError = (index) => {
        setImageError(true);
        setImageLoadAttempts(prev => ({
            ...prev,
            [index]: (prev[index] || 0) + 1
        }));
    };

    const getImageUrl = (url, index) => {
        if (url.startsWith('blob:') && imageLoadAttempts[index] > 0) {
            return '/images/placeholder.png';
        }
        return url;
    };

    const handleQuantityChange = (event) => {
        const value = parseInt(event.target.value);
        if (value > 0 && value <= (product?.stock || 0)) {
            setQuantity(value);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            await addToCart(product._id, quantity);
            setSnackbar({
                open: true,
                message: 'Produit ajouté au panier',
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message,
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const formik = useFormik({
        initialValues: {
            rating: 5,
            comment: ''
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                await addReview(id, values);
                resetForm();
                setReviewError(null);
            } catch (err) {
                setReviewError(err.message);
            }
        }
    });

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await addReview(id, { rating: formik.values.rating, comment: reviewText });
            setReviewText('');
            setReviewError(null);
        } catch (err) {
            setReviewError(err.message);
        }
    };

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert 
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => navigate('/products')}>
                            Retour aux produits
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!product && isLoading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!product) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert 
                    severity="info"
                    action={
                        <Button color="inherit" size="small" onClick={() => navigate('/products')}>
                            Retour aux produits
                        </Button>
                    }
                >
                    Produit non trouvé
                </Alert>
            </Container>
        );
    }

    const discountedPrice = product.getDiscountedPrice ? product.getDiscountedPrice() : product.price * (1 - product.discount / 100);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* En-tête avec navigation */}
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link color="inherit" href="/">
                        Accueil
                    </Link>
                    <Link color="inherit" href="/products">
                        Produits
                    </Link>
                    <Typography color="text.primary">{product.name}</Typography>
                </Breadcrumbs>
            </Box>

            {/* Section principale du produit */}
            <Grid container spacing={4}>
                {/* Galerie d'images */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ position: 'relative', height: '100%', minHeight: 400 }}>
                            <img
                                src={selectedImage || product.images[0]}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto', pb: 1 }}>
                            {product.images.map((image, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        flexShrink: 0,
                                        cursor: 'pointer',
                                        border: selectedImage === image ? '2px solid #1976d2' : '1px solid #ddd',
                                        borderRadius: 1,
                                        overflow: 'hidden'
                                    }}
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} - ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Informations du produit */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h4" gutterBottom>
                            {product.name}
                        </Typography>
                        <Typography variant="h5" color="primary" gutterBottom>
                            {product.price.toLocaleString()} FCFA
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {product.description}
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Catégorie: {product.category}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Stock disponible: {product.stock}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <TextField
                                type="number"
                                label="Quantité"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                inputProps={{ min: 1, max: product.stock }}
                                sx={{ width: 100 }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddToCart}
                                disabled={!product.stock}
                                fullWidth
                            >
                                Ajouter au panier
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Section des avis */}
            <Box sx={{ mt: 6 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Avis clients
                    </Typography>
                    
                    {/* Formulaire d'ajout d'avis */}
                    {user ? (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Donnez votre avis
                            </Typography>
                            <form onSubmit={handleReviewSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            label="Votre avis"
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={!reviewText.trim()}
                                        >
                                            Publier mon avis
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Box>
                    ) : (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Connectez-vous pour laisser un avis
                        </Alert>
                    )}

                    {/* Liste des avis */}
                    <Box sx={{ mt: 4 }}>
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <Paper key={review._id} sx={{ p: 2, mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle1">
                                            {review.user.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1">
                                        {review.text}
                                    </Typography>
                                </Paper>
                            ))
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                Aucun avis pour ce produit
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #eee' }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>
                            À propos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Votre boutique en ligne de confiance pour tous vos besoins.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>
                            Contact
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Email: contact@example.com
                            <br />
                            Téléphone: +123 456 789
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>
                            Suivez-nous
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <IconButton color="primary">
                                <FacebookIcon />
                            </IconButton>
                            <IconButton color="primary">
                                <TwitterIcon />
                            </IconButton>
                            <IconButton color="primary">
                                <InstagramIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ 
                        width: '100%',
                        '& .MuiAlert-icon': {
                            fontSize: '1.5rem'
                        }
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProductDetail; 