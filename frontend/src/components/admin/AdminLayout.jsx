import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery,
    Avatar,
    Menu,
    MenuItem,
    ListItemButton,
    CircularProgress,
    Paper
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    ShoppingCart as OrdersIcon,
    People as CustomersIcon,
    Category as CategoryIcon,
    LocalShipping as ShippingIcon,
    Payment as PaymentIcon,
    RateReview as ReviewsIcon,
    Assessment as ReportsIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    AccountCircle as AccountIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const AdminLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading, logout } = useAuth();

    console.log('AdminLayout - User:', user);
    console.log('AdminLayout - Loading:', loading);
    console.log('AdminLayout - Current Path:', location.pathname);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            console.log('AdminLayout - Redirection: Utilisateur non admin');
            navigate('/');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            handleProfileMenuClose();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    const menuItems = [
        { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin' },
        { text: 'Produits', icon: <InventoryIcon />, path: '/admin/products' },
        { text: 'Commandes', icon: <OrdersIcon />, path: '/admin/orders' },
        { text: 'Clients', icon: <CustomersIcon />, path: '/admin/customers' },
        { text: 'Catégories', icon: <CategoryIcon />, path: '/admin/categories' },
        { text: 'Livraison', icon: <ShippingIcon />, path: '/admin/shipping' },
        { text: 'Paiements', icon: <PaymentIcon />, path: '/admin/payments' },
        { text: 'Avis', icon: <ReviewsIcon />, path: '/admin/reviews' },
        { text: 'Rapports', icon: <ReportsIcon />, path: '/admin/reports' },
        { text: 'Paramètres', icon: <SettingsIcon />, path: '/admin/settings' },
    ];

    const drawer = (
        <Box sx={{ overflow: 'auto' }}>
            <Toolbar sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                py: 2,
                backgroundColor: 'primary.main',
                color: 'white'
            }}>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                    Administration
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    {user?.email}
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) setMobileOpen(false);
                            }}
                            selected={location.pathname === item.path}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.light',
                                    '&:hover': {
                                        backgroundColor: 'primary.light',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ 
                                color: location.pathname === item.path ? 'primary.main' : 'inherit',
                                minWidth: 40
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Header */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    backgroundColor: 'white',
                    color: 'text.primary',
                    boxShadow: 1
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    
                    <Box sx={{ flexGrow: 1 }} />
                    
                    <IconButton
                        onClick={handleProfileMenuOpen}
                        sx={{ p: 0 }}
                    >
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {user?.email?.[0]?.toUpperCase() || <AccountIcon />}
                        </Avatar>
                    </IconButton>
                    
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                    >
                        <MenuItem onClick={() => {
                            navigate('/');
                            handleProfileMenuClose();
                        }}>
                            <ListItemIcon>
                                <AccountIcon fontSize="small" />
                            </ListItemIcon>
                            Retour au site
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            Déconnexion
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            backgroundColor: '#f8f9fa',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    backgroundColor: '#f8f9fa',
                    minHeight: '100vh'
                }}
            >
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" color="text.secondary">
                        Chemin actuel : {location.pathname}
                    </Typography>
                </Paper>
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout; 