import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    Rating,
    Chip,
    Snackbar,
    Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: theme.shadows[4]
    }
}));

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const discountedPrice = product.price * (1 - product.discount / 100);

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            await addToCart(product._id, 1);
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

    return (
        <>
            <StyledCard>
                <CardMedia
                    component="img"
                    height="200"
                    image={product.images[0]}
                    alt={product.name}
                    sx={{ objectFit: 'contain', p: 2 }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography gutterBottom variant="h6" component="h2" noWrap>
                        {product.name}
                    </Typography>

                    <Box sx={{ mb: 1 }}>
                        <Rating
                            value={product.rating}
                            precision={0.5}
                            readOnly
                            size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                            ({product.numReviews} avis)
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                        {product.description.length > 100
                            ? `${product.description.substring(0, 100)}...`
                            : product.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {product.discount > 0 && (
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ textDecoration: 'line-through', mr: 1 }}
                            >
                                {product.price.toFixed(0)} FCFA
                            </Typography>
                        )}
                        <Typography variant="h6" color="primary">
                            {discountedPrice.toFixed(0)} FCFA
                        </Typography>
                        {product.discount > 0 && (
                            <Chip
                                label={`-${product.discount}%`}
                                color="error"
                                size="small"
                                sx={{ ml: 1 }}
                            />
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate(`/products/${product._id}`)}
                        >
                            Détails
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={product.stock === 0}
                            onClick={handleAddToCart}
                        >
                            {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                        </Button>
                    </Box>
                </CardContent>
            </StyledCard>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ProductCard; 