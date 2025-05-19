import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Rating,
    FormControlLabel,
    Switch,
    Alert,
    Snackbar,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axiosInstance from '../../config/axios';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [formData, setFormData] = useState({
        rating: 0,
        title: '',
        comment: '',
        isVerified: false,
        isActive: true
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        isVerified: '',
        isActive: ''
    });

    useEffect(() => {
        loadReviews();
    }, [page, filters]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            console.log('AdminReviews - Chargement des avis...');
            const queryParams = new URLSearchParams({
                page,
                ...filters,
                _t: new Date().getTime()
            }).toString();
            const response = await axiosInstance.get(`/reviews?${queryParams}`);
            console.log('AdminReviews - Réponse:', response.data);
            if (response.data.success) {
                setReviews(response.data.reviews);
                setTotalPages(response.data.pagination.pages);
                setError('');
            } else {
                throw new Error(response.data.message || 'Erreur lors du chargement des avis');
            }
        } catch (err) {
            console.error('AdminReviews - Erreur lors du chargement des avis:', err);
            setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des avis');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (review = null) => {
        if (review) {
            setSelectedReview(review);
            setFormData({
                rating: review.rating,
                title: review.title,
                comment: review.comment,
                isVerified: review.isVerified,
                isActive: review.isActive
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedReview(null);
        setFormData({
            rating: 0,
            title: '',
            comment: '',
            isVerified: false,
            isActive: true
        });
    };

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'isVerified' || name === 'isActive' ? checked : value
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axiosInstance.put(`/reviews/${selectedReview._id}`, formData);
            if (response.data.success) {
                setSuccess('Avis mis à jour avec succès');
                handleCloseDialog();
                loadReviews();
            } else {
                throw new Error(response.data.message || 'Erreur lors de la mise à jour de l\'avis');
            }
        } catch (err) {
            console.error('AdminReviews - Erreur lors de la mise à jour de l\'avis:', err);
            setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de l\'avis');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/reviews/${id}`);
                if (response.data.success) {
                    setSuccess('Avis supprimé avec succès');
                    loadReviews();
                } else {
                    throw new Error(response.data.message || 'Erreur lors de la suppression de l\'avis');
                }
            } catch (err) {
                console.error('AdminReviews - Erreur lors de la suppression de l\'avis:', err);
                setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression de l\'avis');
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return <Typography>Chargement...</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Gestion des Avis</Typography>
                <Grid container spacing={2} sx={{ maxWidth: 400 }}>
                    <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Vérifié</InputLabel>
                            <Select
                                name="isVerified"
                                value={filters.isVerified}
                                onChange={handleFilterChange}
                                label="Vérifié"
                            >
                                <MenuItem value="">Tous</MenuItem>
                                <MenuItem value="true">Oui</MenuItem>
                                <MenuItem value="false">Non</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Actif</InputLabel>
                            <Select
                                name="isActive"
                                value={filters.isActive}
                                onChange={handleFilterChange}
                                label="Actif"
                            >
                                <MenuItem value="">Tous</MenuItem>
                                <MenuItem value="true">Oui</MenuItem>
                                <MenuItem value="false">Non</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Produit</TableCell>
                            <TableCell>Client</TableCell>
                            <TableCell>Note</TableCell>
                            <TableCell>Titre</TableCell>
                            <TableCell>Commentaire</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reviews.map((review) => (
                            <TableRow key={review._id}>
                                <TableCell>{review.product?.name}</TableCell>
                                <TableCell>{review.user?.name}</TableCell>
                                <TableCell>
                                    <Rating value={review.rating} readOnly />
                                </TableCell>
                                <TableCell>{review.title}</TableCell>
                                <TableCell>{review.comment}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={review.isVerified ? 'Vérifié' : 'Non vérifié'}
                                        color={review.isVerified ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleOpenDialog(review)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDelete(review._id)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                />
            </Box>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedReview ? 'Modifier l\'avis' : 'Nouvel avis'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Rating
                                    name="rating"
                                    value={formData.rating}
                                    onChange={(e, value) => setFormData(prev => ({ ...prev, rating: value }))}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Titre"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Commentaire"
                                    name="comment"
                                    value={formData.comment}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isVerified}
                                            onChange={handleChange}
                                            name="isVerified"
                                            color="primary"
                                        />
                                    }
                                    label="Avis vérifié"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            name="isActive"
                                            color="primary"
                                        />
                                    }
                                    label="Avis actif"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess('')}
            >
                <Alert severity="success" onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminReviews; 