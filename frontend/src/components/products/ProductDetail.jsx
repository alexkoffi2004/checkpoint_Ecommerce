import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Box,
    Button,
    TextField,
    Paper,
    Alert,
    CircularProgress,
    Snackbar,
    Breadcrumbs,
    Link,
    Divider,
    Rating,
    Chip,
    Avatar,
    Fade,
    useTheme,
    alpha,
    IconButton
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    LocalShipping as ShippingIcon,
    Security as SecurityIcon,
    ArrowBack as ArrowBackIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCart } from '../../context/CartContext';

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
    const theme = useTheme();
    const { user } = useAuth();
    const { product, error, loadProduct, addReview } = useProducts();
    const { addToCart } = useCart();
    
    const [selectedImage, setSelectedImage] = useState(0);
    const [reviewError, setReviewError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [, setImageError] = useState(false);
    const [imageLoadAttempts, setImageLoadAttempts] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Using reviews directly from product
    const reviews = product?.reviews || [];

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

    // eslint-disable-next-line no-unused-vars
    const getImageUrl = (url, index) => {
        if (url && url.startsWith('blob:') && imageLoadAttempts[index] > 0) {
            return '/images/placeholder.png';
        }
        return url;
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
                setSnackbar({
                    open: true,
                    message: 'Avis ajouté avec succès',
                    severity: 'success'
                });
            } catch (err) {
                setReviewError(err.message || "Erreur lors de l'ajout de l'avis");
            }
        }
    });

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
                <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
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

    // Calcul du prix final
    const productPrice = typeof product.price === 'number' ? product.price : 0;
    const finalPrice = product.getDiscountedPrice 
        ? product.getDiscountedPrice() 
        : productPrice * (1 - (product.discount || 0) / 100);
    const hasDiscount = product.discount > 0;
    
    // Calcul de la moyenne des avis
    const averageRating = reviews.length > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length : 0;

    return (
        <>
            <Fade in={true} timeout={800}>
                <Box sx={{ pb: 8, bgcolor: '#f8fafc', minHeight: '100vh', pt: 4 }}>
                <Container maxWidth="lg">
                    {/* Navigation */}
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton 
                            onClick={() => navigate('/products')}
                            sx={{ 
                                bgcolor: 'white', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                '&:hover': { bgcolor: 'white', transform: 'translateX(-4px)' },
                                transition: 'all 0.3s'
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Breadcrumbs aria-label="breadcrumb">
                            <Link 
                                color="inherit" 
                                href="/" 
                                sx={{ textDecoration: 'none', '&:hover': { color: theme.palette.primary.main }, cursor: 'pointer' }}
                                onClick={(e) => { e.preventDefault(); navigate('/'); }}
                            >
                                Accueil
                            </Link>
                            <Link 
                                color="inherit" 
                                href="/products"
                                sx={{ textDecoration: 'none', '&:hover': { color: theme.palette.primary.main }, cursor: 'pointer' }}
                                onClick={(e) => { e.preventDefault(); navigate('/products'); }}
                            >
                                Produits
                            </Link>
                            <Typography color="text.primary" fontWeight="600">{product.name}</Typography>
                        </Breadcrumbs>
                    </Box>

                    {/* Main Content */}
                    <Grid container spacing={6}>
                        {/* Left: Image Gallery */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ position: 'sticky', top: 24 }}>
                                <Paper 
                                    elevation={0}
                                    sx={{ 
                                        p: 2, 
                                        borderRadius: 4, 
                                        bgcolor: 'white',
                                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
                                        mb: 3,
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}
                                >
                                    {hasDiscount && (
                                        <Chip 
                                            label={`-${product.discount}%`} 
                                            color="error" 
                                            sx={{ 
                                                position: 'absolute', 
                                                top: 24, 
                                                right: 24, 
                                                fontWeight: 800,
                                                fontSize: '1rem',
                                                zIndex: 10,
                                                px: 1,
                                                py: 2.5,
                                                borderRadius: '12px'
                                            }} 
                                        />
                                    )}
                                    <Box 
                                        sx={{ 
                                            position: 'relative', 
                                            height: { xs: 300, sm: 400, md: 480 }, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            bgcolor: '#f8fafc',
                                            borderRadius: 3,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <img
                                            src={selectedImage || (product.images && product.images[0]) || '/placeholder.png'}
                                            alt={product.name}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain',
                                                transition: 'transform 0.4s ease-in-out',
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </Box>
                                </Paper>

                                {/* Thumbnails */}
                                {product.images && product.images.length > 1 && (
                                    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, px: 1 }}>
                                        {product.images.map((image, index) => (
                                            <Box
                                                key={index}
                                                onClick={() => setSelectedImage(image)}
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    flexShrink: 0,
                                                    cursor: 'pointer',
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    border: selectedImage === image ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                                                    boxShadow: selectedImage === image ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}` : '0 2px 8px rgba(0,0,0,0.05)',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                    }
                                                }}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${product.name} - ${index + 1}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                {selectedImage !== image && (
                                                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.4)', transition: 'all 0.3s' }} />
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Grid>

                        {/* Right: Product Info */}
                        <Grid item xs={12} md={6}>
                            <Fade in={true} timeout={1200}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Box>
                                        <Chip 
                                            label={product.category || 'Général'} 
                                            sx={{ 
                                                mb: 2, 
                                                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                                color: theme.palette.primary.main,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: 1
                                            }} 
                                        />
                                        <Typography variant="h3" component="h1" fontWeight="800" color="text.primary" sx={{ mb: 1, fontSize: { xs: '2rem', md: '2.5rem' }, lineHeight: 1.2 }}>
                                            {product.name}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                            <Rating value={averageRating} precision={0.5} readOnly size="large" />
                                            <Typography variant="body2" color="text.secondary" fontWeight="500">
                                                ({reviews.length} avis clients)
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                                            <Typography variant="h3" color="primary.main" fontWeight="800" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                                                {finalPrice.toLocaleString()} FCFA
                                            </Typography>
                                            {hasDiscount && (
                                                <Typography variant="h5" color="text.disabled" sx={{ textDecoration: 'line-through', mb: 0.5, fontWeight: 500 }}>
                                                    {productPrice.toLocaleString()} FCFA
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    <Divider sx={{ borderStyle: 'dashed' }} />

                                    <Box>
                                        <Typography variant="h6" fontWeight="700" mb={1}>Description du produit</Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                            {product.description}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 4, my: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                                                <ShippingIcon />
                                            </Box>
                                            <Typography variant="body2" fontWeight="600">Livraison Rapide et Sécurisée</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                                                <SecurityIcon />
                                            </Box>
                                            <Typography variant="body2" fontWeight="600">Garantie 1 An Incluse</Typography>
                                        </Box>
                                    </Box>

                                    <Paper 
                                        elevation={0}
                                        sx={{ 
                                            p: 4, 
                                            borderRadius: 4, 
                                            bgcolor: 'white',
                                            border: '1px solid',
                                            borderColor: 'grey.200',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                                        }}
                                    >
                                        <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={1} mb={2}>
                                            Options d'achat
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                                            <Typography variant="body1" fontWeight="600">Quantité :</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', border: '2px solid', borderColor: 'grey.200', borderRadius: 3, overflow: 'hidden' }}>
                                                <IconButton 
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                                                    size="small" 
                                                    sx={{ borderRadius: 0, px: 2, py: 1, '&:hover': { bgcolor: 'grey.50' } }}
                                                >
                                                    -
                                                </IconButton>
                                                <Typography sx={{ px: 3, fontWeight: 700, fontSize: '1.1rem' }}>{quantity}</Typography>
                                                <IconButton 
                                                    onClick={() => setQuantity(Math.min(product.stock || 0, quantity + 1))} 
                                                    size="small" 
                                                    sx={{ borderRadius: 0, px: 2, py: 1, '&:hover': { bgcolor: 'grey.50' } }}
                                                >
                                                    +
                                                </IconButton>
                                            </Box>
                                            <Typography variant="body2" color={(product.stock || 0) > 0 ? "success.main" : "error.main"} fontWeight="700" sx={{ bgcolor: (product.stock || 0) > 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1), px: 1.5, py: 1, borderRadius: 2 }}>
                                                {(product.stock || 0) > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
                                            </Typography>
                                        </Box>

                                        <Button
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            startIcon={<ShoppingCartIcon />}
                                            onClick={handleAddToCart}
                                            disabled={!product.stock || product.stock === 0}
                                            sx={{
                                                py: 2,
                                                fontSize: '1.2rem',
                                                fontWeight: 800,
                                                borderRadius: 3,
                                                textTransform: 'none',
                                                background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                                                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    transform: 'translateY(-3px)',
                                                    boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                                                }
                                            }}
                                        >
                                            Ajouter au panier
                                        </Button>
                                    </Paper>
                                </Box>
                            </Fade>
                        </Grid>
                    </Grid>

                    {/* Section Avis */}
                    <Box sx={{ mt: 10 }}>
                        <Typography variant="h4" fontWeight="800" mb={4} display="flex" alignItems="center" gap={2}>
                            Avis Clients
                            <Chip label={reviews.length} color="primary" sx={{ fontWeight: 800, fontSize: '1.1rem' }} />
                        </Typography>
                        <Grid container spacing={4}>
                            {/* Liste des avis */}
                            <Grid item xs={12} md={7}>
                                {reviews.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        {reviews.map((review, idx) => (
                                            <Paper key={review._id || idx} elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.100', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 800, width: 48, height: 48 }}>
                                                            {review.user?.name ? review.user.name.charAt(0).toUpperCase() : (review.name ? review.name.charAt(0).toUpperCase() : 'U')}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight="700">
                                                                {review.user?.name || review.name || 'Utilisateur'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                                {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Rating value={review.rating} readOnly size="small" />
                                                </Box>
                                                <Typography variant="body1" color="text.secondary" sx={{ pl: 8, lineHeight: 1.7 }}>
                                                    {review.comment}
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </Box>
                                ) : (
                                    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'white', border: '1px dashed', borderColor: 'grey.300' }}>
                                        <Typography variant="h6" color="text.secondary" gutterBottom fontWeight="600">Aucun avis pour le moment</Typography>
                                        <Typography variant="body2" color="text.secondary">Soyez le premier à partager votre expérience avec ce produit !</Typography>
                                    </Paper>
                                )}
                            </Grid>

                            {/* Formulaire d'avis */}
                            <Grid item xs={12} md={5}>
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', position: 'sticky', top: 24, border: '1px solid', borderColor: 'primary.100' }}>
                                    <Typography variant="h5" fontWeight="800" mb={3}>Rédiger un avis</Typography>
                                    {user ? (
                                        <form onSubmit={formik.handleSubmit}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle2" fontWeight="600" gutterBottom>Votre note</Typography>
                                                <Rating 
                                                    name="rating" 
                                                    value={formik.values.rating} 
                                                    onChange={(event, newValue) => {
                                                        formik.setFieldValue('rating', newValue);
                                                    }}
                                                    size="large"
                                                />
                                                {formik.touched.rating && formik.errors.rating && (
                                                    <Typography color="error" variant="caption" display="block">{formik.errors.rating}</Typography>
                                                )}
                                            </Box>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                id="comment"
                                                name="comment"
                                                label="Votre commentaire"
                                                placeholder="Partagez votre expérience..."
                                                variant="outlined"
                                                value={formik.values.comment}
                                                onChange={formik.handleChange}
                                                error={formik.touched.comment && Boolean(formik.errors.comment)}
                                                helperText={formik.touched.comment && formik.errors.comment}
                                                sx={{ 
                                                    mb: 3, 
                                                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                                }}
                                            />
                                            {reviewError && (
                                                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{reviewError}</Alert>
                                            )}
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                fullWidth
                                                size="large"
                                                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, py: 1.5, boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}` }}
                                            >
                                                Publier mon avis
                                            </Button>
                                        </form>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 4 }}>
                                            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                                <PersonIcon />
                                            </Avatar>
                                            <Typography variant="body1" color="text.secondary" mb={3} fontWeight="500">
                                                Vous devez être connecté pour laisser un avis.
                                            </Typography>
                                            <Button variant="outlined" onClick={() => navigate('/login')} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>
                                                Se connecter
                                            </Button>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Footer Local */}
                    <Box sx={{ mt: 10, pt: 6, borderTop: '1px solid', borderColor: 'grey.200', pb: 4 }}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" fontWeight="800" gutterBottom>
                                    À propos
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                    Votre boutique en ligne de confiance pour tous vos besoins. Nous vous offrons les meilleurs produits avec une qualité exceptionnelle.
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" fontWeight="800" gutterBottom>
                                    Contact
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                    Email: contact@example.com<br/>
                                    Téléphone: +123 456 789
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" fontWeight="800" gutterBottom>
                                    Suivez-nous
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <IconButton sx={{ bgcolor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', '&:hover': { color: '#1877F2', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
                                        <FacebookIcon />
                                    </IconButton>
                                    <IconButton sx={{ bgcolor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', '&:hover': { color: '#1DA1F2', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
                                        <TwitterIcon />
                                    </IconButton>
                                    <IconButton sx={{ bgcolor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', '&:hover': { color: '#E4405F', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
                                        <InstagramIcon />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                </Container>
            </Box>
            </Fade>
            
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 3, boxShadow: '0 12px 24px rgba(0,0,0,0.1)', fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ProductDetail;