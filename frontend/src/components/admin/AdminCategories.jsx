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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        parent: '',
        isActive: true
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const { data } = await axios.get('/api/categories');
            setCategories(data.categories);
            setLoading(false);
        } catch (err) {
            setError('Erreur lors du chargement des catégories');
            setLoading(false);
        }
    };

    const handleOpenDialog = (category = null) => {
        if (category) {
            setSelectedCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                image: category.image || '',
                parent: category.parent?._id || '',
                isActive: category.isActive
            });
        } else {
            setSelectedCategory(null);
            setFormData({
                name: '',
                description: '',
                image: '',
                parent: '',
                isActive: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCategory(null);
        setFormData({
            name: '',
            description: '',
            image: '',
            parent: '',
            isActive: true
        });
    };

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'isActive' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedCategory) {
                await axios.put(`/api/categories/${selectedCategory._id}`, formData);
                setSuccess('Catégorie mise à jour avec succès');
            } else {
                await axios.post('/api/categories', formData);
                setSuccess('Catégorie créée avec succès');
            }
            handleCloseDialog();
            loadCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            try {
                await axios.delete(`/api/categories/${id}`);
                setSuccess('Catégorie supprimée avec succès');
                loadCategories();
            } catch (err) {
                setError(err.response?.data?.message || 'Erreur lors de la suppression');
            }
        }
    };

    if (loading) return <Typography>Chargement...</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Gestion des Catégories</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nouvelle Catégorie
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nom</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Catégorie Parente</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category._id}>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>{category.description}</TableCell>
                                <TableCell>{category.parent?.name || '-'}</TableCell>
                                <TableCell>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleOpenDialog(category)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDelete(category._id)}
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

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Nom"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="URL de l'image"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Catégorie Parente</InputLabel>
                            <Select
                                name="parent"
                                value={formData.parent}
                                onChange={handleChange}
                                label="Catégorie Parente"
                            >
                                <MenuItem value="">Aucune</MenuItem>
                                {categories
                                    .filter(cat => cat._id !== selectedCategory?._id)
                                    .map(cat => (
                                        <MenuItem key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    name="isActive"
                                />
                            }
                            label="Catégorie Active"
                            margin="normal"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Annuler</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {selectedCategory ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
            >
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            </Snackbar>

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

export default AdminCategories; 