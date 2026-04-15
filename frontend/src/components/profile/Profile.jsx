import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Divider,
    Alert,
    Snackbar,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            postalCode: '',
            country: ''
        }
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || {
                    street: '',
                    city: '',
                    postalCode: '',
                    country: ''
                }
            });
        }
    }, [user]);

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || {
                street: '',
                city: '',
                postalCode: '',
                country: ''
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            await updateUser(formData);
            setSuccess('Profil mis à jour avec succès');
            setEditMode(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ color: 'text.secondary' }}
                >
                    Retour
                </Button>
            </Box>

            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" component="h1" fontWeight="bold">
                                Mon Profil
                            </Typography>
                            {!editMode ? (
                                <Button
                                    startIcon={<EditIcon />}
                                    onClick={handleEditClick}
                                    variant="outlined"
                                    sx={{ borderRadius: 2 }}
                                >
                                    Modifier
                                </Button>
                            ) : (
                                <Box>
                                    <Button
                                        startIcon={<CancelIcon />}
                                        onClick={handleCancelEdit}
                                        sx={{ mr: 1, borderRadius: 2 }}
                                        color="inherit"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Enregistrer
                                    </Button>
                                </Box>
                            )}
                        </Box>
                        <Divider sx={{ mb: 4 }} />

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                                {success}
                            </Alert>
                        )}

                        {editMode ? (
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Nom complet"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Téléphone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                                            Adresse de livraison
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Rue"
                                            name="address.street"
                                            value={formData.address.street}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Ville"
                                            name="address.city"
                                            value={formData.address.city}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Code postal"
                                            name="address.postalCode"
                                            value={formData.address.postalCode}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Pays"
                                            name="address.country"
                                            value={formData.address.country}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                        />
                                    </Grid>
                                </Grid>
                            </form>
                        ) : (
                            <List sx={{ pt: 0 }}>
                                <ListItem sx={{ px: 0, py: 1.5 }}>
                                    <ListItemIcon>
                                        <PersonIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<Typography variant="caption" color="text.secondary">Nom complet</Typography>}
                                        secondary={<Typography variant="body1" fontWeight="medium" color="text.primary">{user.name}</Typography>}
                                    />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem sx={{ px: 0, py: 1.5 }}>
                                    <ListItemIcon>
                                        <EmailIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<Typography variant="caption" color="text.secondary">Adresse email</Typography>}
                                        secondary={<Typography variant="body1" fontWeight="medium" color="text.primary">{user.email}</Typography>}
                                    />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem sx={{ px: 0, py: 1.5 }}>
                                    <ListItemIcon>
                                        <PhoneIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<Typography variant="caption" color="text.secondary">Téléphone</Typography>}
                                        secondary={<Typography variant="body1" fontWeight="medium" color="text.primary">{user.phone || 'Non renseigné'}</Typography>}
                                    />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem sx={{ px: 0, py: 1.5 }}>
                                    <ListItemIcon>
                                        <LocationIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<Typography variant="caption" color="text.secondary">Adresse postale</Typography>}
                                        secondary={
                                            <Typography variant="body1" fontWeight="medium" color="text.primary">
                                                {user.address && (user.address.street || user.address.city || user.address.postalCode || user.address.country) ? (
                                                    <>
                                                        {user.address.street && <>{user.address.street}<br /></>}
                                                        {user.address.city && <>{user.address.city}, </>}
                                                        {user.address.postalCode && <>{user.address.postalCode}<br /></>}
                                                        {user.address.country && user.address.country}
                                                    </>
                                                ) : 'Non renseignée'}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {loading && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <CircularProgress />
                </Box>
            )}

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess(null)}
            >
                <Alert severity="success" onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Profile;