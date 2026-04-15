import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    Alert,
    CircularProgress,
    Avatar,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import axiosInstance from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

const AdminPaymentMethods = () => {
    const { token } = useAuth();
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true,
        image: ''
    });
    
    // Upload state
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/payment-methods');
            setMethods(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des moyens de paiement');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (method = null) => {
        if (method) {
            setEditingId(method._id);
            setFormData({
                name: method.name,
                description: method.description || '',
                isActive: method.isActive,
                image: method.image || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                description: '',
                isActive: true,
                image: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingId(null);
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('images', file);

        try {
            setUploading(true);
            const res = await axiosInstance.post('/upload', formDataFile, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data.success && res.data.urls.length > 0) {
                setFormData(prev => ({ ...prev, image: res.data.urls[0] }));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du téléchargement de l\'image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            if (editingId) {
                await axiosInstance.put(`/payment-methods/${editingId}`, formData);
                setSuccess('Moyen de paiement mis à jour');
            } else {
                await axiosInstance.post('/payment-methods', formData);
                setSuccess('Moyen de paiement ajouté');
            }

            handleCloseDialog();
            fetchMethods();

            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce moyen de paiement ?')) {
            try {
                setLoading(true);
                await axiosInstance.delete(`/payment-methods/${id}`);
                setSuccess('Moyen de paiement supprimé');
                fetchMethods();
            } catch (err) {
                setError(err.response?.data?.message || 'Erreur lors de la suppression');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h2">
                    Moyens de paiement
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Ajouter un moyen
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {loading && !openDialog ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Image</TableCell>
                                <TableCell>Nom</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {methods.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Aucun moyen de paiement trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                methods.map((method) => (
                                    <TableRow key={method._id}>
                                        <TableCell>
                                            {method.image ? (
                                                <Avatar src={method.image} alt={method.name} variant="rounded" sx={{ width: 56, height: 56 }} />
                                            ) : (
                                                <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: 'grey.200' }} />
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{method.name}</TableCell>
                                        <TableCell>{method.description}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={method.isActive ? 'Actif' : 'Inactif'}
                                                color={method.isActive ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton color="primary" onClick={() => handleOpenDialog(method)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(method._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingId ? 'Modifier' : 'Ajouter'} un moyen de paiement
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        
                        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {formData.image ? (
                                <Box sx={{ position: 'relative', mb: 2 }}>
                                    <img src={formData.image} alt="Preview" style={{ width: 120, height: 120, objectFit: 'contain', border: '1px solid #ccc', borderRadius: 8 }} />
                                </Box>
                            ) : (
                                <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: 'grey.200' }}>
                                    <PhotoCameraIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                                </Avatar>
                            )}
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="raised-button-file"
                                type="file"
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="raised-button-file">
                                <Button component="span" variant="outlined" disabled={uploading} startIcon={uploading ? <CircularProgress size={20} /> : <PhotoCameraIcon />}>
                                    {uploading ? 'Upload...' : 'Changer la photo'}
                                </Button>
                            </label>
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                                Vous pouvez prendre une photo si vous êtes sur mobile.
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            label="Nom (ex: Espèce, Orange Money)"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Instructions (ex: numéro de compte, indications pour le livreur)"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography>Actif :</Typography>
                            <Switch
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                color="primary"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="inherit">
                            Annuler
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={loading || uploading}
                        >
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default AdminPaymentMethods;
