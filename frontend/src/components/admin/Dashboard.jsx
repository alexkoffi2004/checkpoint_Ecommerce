import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    IconButton,
    useTheme,
    useMediaQuery,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    ShoppingCart as ShoppingCartIcon,
    People as PeopleIcon,
    Inventory as InventoryIcon,
    Category as CategoryIcon,
    Settings as SettingsIcon,
    Assessment as AssessmentIcon,
    LocalShipping as ShippingIcon,
    Payment as PaymentIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon,
    AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';

const Dashboard = () => {
    console.log('Dashboard - Component mounted');
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, loading: authLoading } = useAuth();
    const { products, loading: productsLoading } = useProducts();
    const [error, setError] = useState(null);

    console.log('Dashboard - User:', user);
    console.log('Dashboard - Auth Loading:', authLoading);
    console.log('Dashboard - Products:', products);
    console.log('Dashboard - Products Loading:', productsLoading);

    useEffect(() => {
        console.log('Dashboard - Effect running');
        if (!authLoading && (!user || user.role !== 'admin')) {
            console.log('Dashboard - Redirection: Utilisateur non admin');
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    if (authLoading || productsLoading) {
        console.log('Dashboard - Loading state');
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user || user.role !== 'admin') {
        console.log('Dashboard - Not admin');
        return null;
    }

    if (error) {
        console.log('Dashboard - Error state:', error);
        return (
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    console.log('Dashboard - Rendering content');

    // Statistiques fictives (à remplacer par des données réelles de l'API)
    const stats = {
        totalSales: 12500,
        totalOrders: 156,
        totalProducts: products?.length || 0,
        totalCustomers: 89,
        recentOrders: [
            { id: 1, customer: 'Jean Dupont', amount: 150, status: 'En attente' },
            { id: 2, customer: 'Marie Martin', amount: 89, status: 'Livré' },
            { id: 3, customer: 'Pierre Durand', amount: 200, status: 'En cours' }
        ]
    };

    const menuItems = [
        {
            title: 'Produits',
            icon: <InventoryIcon />,
            path: '/admin/products',
            description: 'Gérer le catalogue de produits'
        },
        {
            title: 'Commandes',
            icon: <ShoppingCartIcon />,
            path: '/admin/orders',
            description: 'Voir et gérer les commandes'
        },
        {
            title: 'Clients',
            icon: <PeopleIcon />,
            path: '/admin/customers',
            description: 'Gérer les comptes clients'
        },
        {
            title: 'Catégories',
            icon: <CategoryIcon />,
            path: '/admin/categories',
            description: 'Gérer les catégories de produits'
        },
        {
            title: 'Livraisons',
            icon: <ShippingIcon />,
            path: '/admin/shipping',
            description: 'Gérer les options de livraison'
        },
        {
            title: 'Paiements',
            icon: <PaymentIcon />,
            path: '/admin/payments',
            description: 'Gérer les méthodes de paiement'
        },
        {
            title: 'Avis',
            icon: <StarIcon />,
            path: '/admin/reviews',
            description: 'Modérer les avis clients'
        },
        {
            title: 'Rapports',
            icon: <AssessmentIcon />,
            path: '/admin/reports',
            description: 'Voir les statistiques et rapports'
        },
        {
            title: 'Paramètres',
            icon: <SettingsIcon />,
            path: '/admin/settings',
            description: 'Configurer le site'
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* En-tête du tableau de bord */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Tableau de bord administrateur
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Bienvenue, {user?.name || 'Administrateur'}
                </Typography>
            </Box>

            {/* Statistiques rapides */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 140,
                            bgcolor: 'primary.main',
                            color: 'white'
                        }}
                    >
                        <Typography component="h2" variant="h6" gutterBottom>
                            Chiffre d'affaires
                        </Typography>
                        <Typography component="p" variant="h4">
                            {stats.totalSales.toLocaleString()} FCFA
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            +12% ce mois-ci
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 140,
                            bgcolor: 'success.main',
                            color: 'white'
                        }}
                    >
                        <Typography component="h2" variant="h6" gutterBottom>
                            Commandes
                        </Typography>
                        <Typography component="p" variant="h4">
                            {stats.totalOrders}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            +8% ce mois-ci
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 140,
                            bgcolor: 'info.main',
                            color: 'white'
                        }}
                    >
                        <Typography component="h2" variant="h6" gutterBottom>
                            Produits
                        </Typography>
                        <Typography component="p" variant="h4">
                            {stats.totalProducts}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            En stock
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 140,
                            bgcolor: 'warning.main',
                            color: 'white'
                        }}
                    >
                        <Typography component="h2" variant="h6" gutterBottom>
                            Clients
                        </Typography>
                        <Typography component="p" variant="h4">
                            {stats.totalCustomers}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            +5% ce mois-ci
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Menu principal et commandes récentes */}
            <Grid container spacing={3}>
                {/* Menu principal */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Menu administrateur
                        </Typography>
                        <Grid container spacing={2}>
                            {menuItems.map((item) => (
                                <Grid item xs={12} sm={6} md={4} key={item.title}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 3
                                            }
                                        }}
                                    >
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Box sx={{ color: 'primary.main', mr: 1 }}>
                                                    {item.icon}
                                                </Box>
                                                <Typography variant="h6" component="h2">
                                                    {item.title}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {item.description}
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => navigate(item.path)}
                                                startIcon={<AddIcon />}
                                            >
                                                Accéder
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Commandes récentes */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Commandes récentes
                        </Typography>
                        <List>
                            {stats.recentOrders.map((order) => (
                                <React.Fragment key={order.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={order.customer}
                                            secondary={`${order.amount} € - ${order.status}`}
                                        />
                                        <Button
                                            size="small"
                                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                                        >
                                            Voir
                                        </Button>
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/admin/orders')}
                            >
                                Voir toutes les commandes
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard; 