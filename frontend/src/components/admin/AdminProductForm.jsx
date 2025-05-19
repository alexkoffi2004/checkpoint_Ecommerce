import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Grid,
    Paper,
    TextField,
    Typography,
    MenuItem,
    Alert,
    CircularProgress,
    Snackbar,
    IconButton
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const categories = [
    { value: 'Électronique', label: 'Électronique' },
    { value: 'Vêtements', label: 'Vêtements' },
    { value: 'Maison', label: 'Maison' },
    { value: 'Sport', label: 'Sport' },
    { value: 'Loisirs', label: 'Loisirs' },
    { value: 'Autres', label: 'Autres' }
];

const validationSchema = Yup.object({
    name: Yup.string()
        .required('Le nom du produit est requis')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    description: Yup.string()
        .required('La description est requise')
        .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
    price: Yup.number()
        .required('Le prix est requis')
        .min(0, 'Le prix ne peut pas être négatif'),
    category: Yup.string()
        .required('La catégorie est requise'),
    stock: Yup.number()
        .required('Le stock est requis')
        .min(0, 'Le stock ne peut pas être négatif')
        .integer('Le stock doit être un nombre entier')
});

const AdminProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [product, setProduct] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        const loadProduct = async () => {
            if (isEdit && id) {
                try {
                    setLoading(true);
                    const response = await axios.get(`/products/${id}`);
                    setProduct(response.data.data);
                    if (response.data.data.images) {
                        setImagePreviews(response.data.data.images);
                    }
                } catch (err) {
                    console.error('Erreur lors du chargement du produit:', err);
                    setError(err.response?.data?.message || 'Erreur lors du chargement du produit');
                    setSnackbar({
                        open: true,
                        message: err.response?.data?.message || 'Erreur lors du chargement du produit',
                        severity: 'error'
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        loadProduct();
    }, [isEdit, id]);

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedImages(prev => [...prev, ...files]);

        // Créer les aperçus des images
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: product?.name || '',
            description: product?.description || '',
            price: product?.price || '',
            category: product?.category || '',
            stock: product?.stock || ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                setError(null);

                // D'abord, télécharger les images
                const uploadFormData = new FormData();
                selectedImages.forEach((file) => {
                    uploadFormData.append('images', file);
                });

                let imageUrls = [];
                if (selectedImages.length > 0) {
                    const uploadResponse = await axios.post('/upload', uploadFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    if (!uploadResponse.data.success) {
                        throw new Error(uploadResponse.data.message || 'Erreur lors du téléchargement des images');
                    }
                    imageUrls = uploadResponse.data.urls;
                }

                // Préparer les données du produit avec les URLs des images
                const productData = {
                    name: values.name,
                    description: values.description,
                    price: values.price,
                    category: values.category,
                    stock: values.stock,
                    images: imageUrls
                };

                // Ajouter les URLs des images existantes si en mode édition
                if (isEdit && product?.images) {
                    productData.images = [...imageUrls, ...product.images];
                }

                if (isEdit) {
                    await axios.put(`/products/${id}`, productData);
                    setSnackbar({
                        open: true,
                        message: 'Produit mis à jour avec succès',
                        severity: 'success'
                    });
                } else {
                    await axios.post('/products', productData);
                    setSnackbar({
                        open: true,
                        message: 'Produit créé avec succès',
                        severity: 'success'
                    });
                }

                setTimeout(() => {
                    navigate('/admin/products');
                }, 2000);
            } catch (err) {
                console.error('Erreur détaillée:', err);
                setError(err.response?.data?.message || err.message || 'Une erreur est survenue');
                setSnackbar({
                    open: true,
                    message: err.response?.data?.message || err.message || 'Une erreur est survenue',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        }
    });

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4">
                        {isEdit ? 'Modifier le produit' : 'Ajouter un produit'}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/admin/products')}
                        disabled={loading}
                    >
                        Retour à la liste
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={4}>
                        {/* Section Informations principales */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Informations principales
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            id="name"
                                            name="name"
                                            label="Nom du produit"
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            error={formik.touched.name && Boolean(formik.errors.name)}
                                            helperText={formik.touched.name && formik.errors.name}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            id="description"
                                            name="description"
                                            label="Description"
                                            value={formik.values.description}
                                            onChange={formik.handleChange}
                                            error={formik.touched.description && Boolean(formik.errors.description)}
                                            helperText={formik.touched.description && formik.errors.description}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Section Images */}
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Images du produit
                                </Typography>
                                <Box sx={{ mb: 3 }}>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="image-upload"
                                        type="file"
                                        multiple
                                        onChange={handleImageChange}
                                    />
                                    <label htmlFor="image-upload">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<AddIcon />}
                                            fullWidth
                                        >
                                            Sélectionner des images
                                        </Button>
                                    </label>
                                </Box>

                                {imagePreviews.length > 0 && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                        {imagePreviews.map((preview, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    position: 'relative',
                                                    width: 150,
                                                    height: 150,
                                                    border: '1px solid #ddd',
                                                    borderRadius: 1,
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 4,
                                                        right: 4,
                                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                                        }
                                                    }}
                                                    onClick={() => handleRemoveImage(index)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Paper>
                        </Grid>

                        {/* Section Détails supplémentaires */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Détails supplémentaires
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            id="price"
                                            name="price"
                                            label="Prix"
                                            value={formik.values.price}
                                            onChange={formik.handleChange}
                                            error={formik.touched.price && Boolean(formik.errors.price)}
                                            helperText={formik.touched.price && formik.errors.price}
                                            InputProps={{
                                                endAdornment: <Typography>FCFA</Typography>
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            id="stock"
                                            name="stock"
                                            label="Stock"
                                            value={formik.values.stock}
                                            onChange={formik.handleChange}
                                            error={formik.touched.stock && Boolean(formik.errors.stock)}
                                            helperText={formik.touched.stock && formik.errors.stock}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            select
                                            id="category"
                                            name="category"
                                            label="Catégorie"
                                            value={formik.values.category}
                                            onChange={formik.handleChange}
                                            error={formik.touched.category && Boolean(formik.errors.category)}
                                            helperText={formik.touched.category && formik.errors.category}
                                        >
                                            {categories.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Boutons d'action */}
                            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/admin/products')}
                                    fullWidth
                                    disabled={loading}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={loading || imagePreviews.length === 0}
                                    startIcon={loading && <CircularProgress size={20} />}
                                >
                                    {isEdit ? 'Mettre à jour' : 'Créer'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminProductForm; 