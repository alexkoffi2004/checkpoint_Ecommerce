import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
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
    Grid,
    Alert,
    Snackbar,
    MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import axios from 'axios';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        images: []
    });

    // Charger les produits
    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/products');
            setProducts(response.data.products || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des produits');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // Gérer l'ouverture/fermeture du dialogue
    const handleOpen = (product = null) => {
        if (product) {
            setSelectedProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                images: product.images || []
            });
        } else {
            setSelectedProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                category: '',
                images: []
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category: '',
            images: []
        });
    };

    // Gérer les changements dans le formulaire
    const handleChange = async (e) => {
        const { name, value, files } = e.target;
        if (name === 'images' && files) {
            try {
                setLoading(true);
                const formData = new FormData();
                Array.from(files).forEach(file => {
                    formData.append('images', file);
                });

                // Télécharger les images vers le serveur
                const response = await axios.post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.data.success) {
                    // Utiliser les URLs retournées par le serveur
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, ...response.data.urls]
                    }));
                } else {
                    throw new Error(response.data.message || 'Erreur lors du téléchargement des images');
                }
            } catch (err) {
                console.error('Erreur lors du téléchargement des images:', err);
                setError(err.response?.data?.message || 'Erreur lors du téléchargement des images');
            } finally {
                setLoading(false);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Supprimer une image
    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            // Validation des données
            if (!formData.name || !formData.description || !formData.price || !formData.stock || !formData.category) {
                throw new Error('Tous les champs sont obligatoires');
            }

            if (formData.images.length === 0) {
                throw new Error('Au moins une image est requise');
            }

            // Vérifier que toutes les images sont des URLs valides
            const invalidImages = formData.images.filter(url => 
                !url.startsWith('http') && !url.startsWith('/')
            );
            if (invalidImages.length > 0) {
                throw new Error('Toutes les images doivent être des URLs valides');
            }

            // Préparation des données
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category: formData.category,
                images: formData.images,
                featured: formData.featured || false,
                discount: formData.discount || 0
            };

            if (selectedProduct) {
                const response = await axios.put(`/products/${selectedProduct._id}`, productData);
                if (response.data.success) {
                    setSuccess('Produit mis à jour avec succès');
                } else {
                    throw new Error(response.data.message || 'Erreur lors de la mise à jour');
                }
            } else {
                const response = await axios.post('/products', productData);
                if (response.data.success) {
                    setSuccess('Produit ajouté avec succès');
                } else {
                    throw new Error(response.data.message || 'Erreur lors de l\'ajout');
                }
            }

            handleClose();
            loadProducts();
        } catch (err) {
            console.error('Erreur détaillée:', err);
            setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors de l\'opération');
        } finally {
            setLoading(false);
        }
    };

    // Supprimer un produit
    const handleDelete = async (productId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            try {
                setLoading(true);
                const response = await axios.delete(`/products/${productId}`);
                if (response.data.success) {
                    setSuccess('Produit supprimé avec succès');
                    loadProducts();
                } else {
                    throw new Error(response.data.message || 'Erreur lors de la suppression');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Erreur lors de la suppression du produit');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestion des Produits
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Ajouter un produit
                </Button>
            </Box>

            {/* Messages de notification */}
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

            {/* Liste des produits */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Image</TableCell>
                            <TableCell>Nom</TableCell>
                            <TableCell>Prix</TableCell>
                            <TableCell>Stock</TableCell>
                            <TableCell>Catégorie</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product._id}>
                                <TableCell>
                                    {product.images && product.images[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <ImageIcon />
                                    )}
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.price.toFixed(2)} €</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpen(product)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(product._id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialogue d'ajout/modification */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedProduct ? 'Modifier le produit' : 'Ajouter un produit'}
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nom du produit"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Prix"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    inputProps={{ min: 0, step: 0.01 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Stock"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Catégorie"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="Électronique">Électronique</MenuItem>
                                    <MenuItem value="Vêtements">Vêtements</MenuItem>
                                    <MenuItem value="Maison">Maison</MenuItem>
                                    <MenuItem value="Sport">Sport</MenuItem>
                                    <MenuItem value="Loisirs">Loisirs</MenuItem>
                                    <MenuItem value="Autres">Autres</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="image-upload"
                                    type="file"
                                    multiple
                                    onChange={handleChange}
                                    name="images"
                                />
                                <label htmlFor="image-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        fullWidth
                                        disabled={loading}
                                    >
                                        {loading ? 'Téléchargement...' : 'Sélectionner des images'}
                                    </Button>
                                </label>
                                {formData.images.length > 0 && (
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {formData.images.map((url, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    position: 'relative',
                                                    width: 100,
                                                    height: 100,
                                                    border: '1px solid #ddd',
                                                    borderRadius: 1,
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <img
                                                    src={url}
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
                                                        top: 0,
                                                        right: 0,
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
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Annuler</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                    >
                        {selectedProduct ? 'Modifier' : 'Ajouter'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Products; 