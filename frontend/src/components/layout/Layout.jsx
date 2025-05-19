import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useTheme,
    useMediaQuery,
    Container,
    Divider,
    Avatar,
    Menu,
    MenuItem,
    Badge
} from '@mui/material';
import {
    Menu as MenuIcon,
    Home as HomeIcon,
    ShoppingCart as ShoppingCartIcon,
    Store as StoreIcon,
    Person as PersonIcon,
    ExitToApp as LogoutIcon,
    AccountCircle as AccountIcon,
    Favorite as FavoriteIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Footer from './Footer';

const drawerWidth = 240;

const Layout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { cart } = useCart();

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
        await logout();
        navigate('/login');
        handleProfileMenuClose();
    };

    const menuItems = [
        { text: 'Accueil', icon: <HomeIcon />, path: '/' },
        { text: 'Produits', icon: <StoreIcon />, path: '/products' },
        { text: 'Favoris', icon: <FavoriteIcon />, path: '/favorites' },
        { text: 'Panier', icon: <ShoppingCartIcon />, path: '/cart' },
    ];

    const drawer = (
        <Box sx={{ overflow: 'auto' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                    AJK MARKET
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
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
                        <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            <CssBaseline />
            
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
                    
                    {/* Navigation Icons */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {user ? (
                            <>
                                <IconButton
                                    color="inherit"
                                    onClick={() => navigate('/cart')}
                                    sx={{ position: 'relative' }}
                                >
                                    <Badge badgeContent={cart?.totalItems || 0} color="primary">
                                        <ShoppingCartIcon />
                                    </Badge>
                                </IconButton>
                                
                                <IconButton
                                    onClick={handleProfileMenuOpen}
                                    sx={{ p: 0 }}
                                >
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        {user.email?.[0]?.toUpperCase() || <AccountIcon />}
                                    </Avatar>
                                </IconButton>
                                
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleProfileMenuClose}
                                >
                                    {user?.role === 'admin' && (
                                        <MenuItem onClick={() => {
                                            navigate('/admin');
                                            handleProfileMenuClose();
                                        }}>
                                            <ListItemIcon>
                                                <AssessmentIcon fontSize="small" />
                                            </ListItemIcon>
                                            Tableau de bord admin
                                        </MenuItem>
                                    )}
                                    <MenuItem onClick={() => {
                                        navigate('/profile');
                                        handleProfileMenuClose();
                                    }}>
                                        <ListItemIcon>
                                            <PersonIcon fontSize="small" />
                                        </ListItemIcon>
                                        Mon Profil
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon>
                                            <LogoutIcon fontSize="small" />
                                        </ListItemIcon>
                                        Déconnexion
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <IconButton
                                color="inherit"
                                onClick={() => navigate('/login')}
                            >
                                <AccountIcon />
                            </IconButton>
                        )}
                    </Box>
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
                    ml: { md: `${drawerWidth}px` },
                    mt: 8,
                    backgroundColor: '#f8f9fa',
                    minHeight: '100vh'
                }}
            >
                <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
                    <Outlet />
                </Container>
            </Box>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    backgroundColor: '#f8f9fa',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    mt: 'auto'
                }}
            >
                <Footer />
            </Box>
        </Box>
    );
};

export default Layout; 