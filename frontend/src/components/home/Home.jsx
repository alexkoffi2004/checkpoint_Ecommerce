import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Paper,
    useTheme,
    Stack,
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    LocalShipping as LocalShippingIcon,
    Security as SecurityIcon,
    Support as SupportIcon,
    TrendingUp as TrendingUpIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { useProducts } from '../../context/ProductContext';

const Home = () => {
    const navigate = useNavigate();
    // const theme = useTheme();
    // const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { products } = useProducts();

    // Récupérer les produits les plus populaires
    const featuredProducts = products?.slice(0, 3) || [];

    const features = [
        {
            icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
            title: 'Livraison Rapide',
            description: 'Livraison gratuite pour toute commande supérieure à 15000 FCFA'
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 40 }} />,
            title: 'Paiement Sécurisé',
            description: 'Transactions 100% sécurisées'
        },
        {
            icon: <SupportIcon sx={{ fontSize: 40 }} />,
            title: 'Support 24/7',
            description: 'Notre équipe est disponible pour vous aider'
        }
    ];

    return (
        <Box>
            {/* Hero Section */}
            <Paper
                sx={{
                    position: 'relative',
                    backgroundColor: 'grey.800',
                    color: '#fff',
                    mb: 4,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundImage: 'url(https://source.unsplash.com/random?shopping)',
                    height: { xs: '60vh', md: '70vh' },
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        right: 0,
                        left: 0,
                        backgroundColor: 'rgba(0,0,0,.5)',
                    }}
                />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography
                                component="h1"
                                variant="h2"
                                color="inherit"
                                gutterBottom
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                                }}
                            >
                                Découvrez Notre Collection
                            </Typography>
                            <Typography variant="h5" color="inherit" paragraph sx={{ mb: 4 }}>
                                Des produits de qualité à des prix compétitifs
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/products')}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    backgroundColor: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    }
                                }}
                            >
                                Voir les produits
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            </Paper>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ mb: 8 }}>
                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    backgroundColor: 'background.default',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: 3
                                    }
                                }}
                            >
                                <Box sx={{ color: 'primary.main', mb: 2 }}>
                                    {feature.icon}
                                </Box>
                                <Typography variant="h6" gutterBottom>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {feature.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Featured Products Section */}
            <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h4"
                        component="h2"
                        gutterBottom
                        sx={{
                            textAlign: 'center',
                            mb: 6,
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}
                    >
                        <TrendingUpIcon color="primary" />
                        Produits Populaires
                    </Typography>
                    <Grid container spacing={4}>
                        {featuredProducts.map((product) => (
                            <Grid item xs={12} sm={6} md={4} key={product._id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: 3
                                        }
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={product.image}
                                        alt={product.name}
                                        sx={{ objectFit: 'contain', p: 2 }}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h6" component="h3">
                                            {product.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {product.description?.substring(0, 100)}...
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6" color="primary">
                                                {product.price.toFixed(2)} €
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => navigate(`/products/${product._id}`)}
                                            >
                                                Voir le produit
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/products')}
                            sx={{ px: 4 }}
                        >
                            Voir tous les produits
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Why Choose Us Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    sx={{
                        textAlign: 'center',
                        mb: 6,
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                    }}
                >
                    <StarIcon color="primary" />
                    Pourquoi Nous Choisir ?
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 4, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Qualité Garantie
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Nous sélectionnons rigoureusement nos produits pour vous garantir la meilleure qualité.
                                Chaque article est vérifié avant d'être mis en vente.
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                Service Client Exceptionnel
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Notre équipe est disponible 24/7 pour répondre à vos questions et vous accompagner
                                dans vos achats.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 4, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Livraison Rapide
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Nous nous engageons à livrer vos commandes dans les plus brefs délais.
                                La livraison est gratuite pour toute commande supérieure à 50€.
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                Satisfaction Client
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Votre satisfaction est notre priorité. Nous offrons une garantie de remboursement
                                de 30 jours sur tous nos produits.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Newsletter Section */}
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
                <Container maxWidth="md">
                    <Stack spacing={3} alignItems="center" textAlign="center">
                        <Typography variant="h4" component="h2" gutterBottom>
                            Restez Informé
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Inscrivez-vous à notre newsletter pour recevoir nos dernières offres et nouveautés
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                bgcolor: 'white',
                                color: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'grey.100',
                                }
                            }}
                        >
                            S'inscrire à la newsletter
                        </Button>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
};

export default Home; 