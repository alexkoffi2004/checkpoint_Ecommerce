import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Alert,
    Snackbar,
    Pagination,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    FormControlLabel,
    Switch,
    CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axiosInstance from '../../config/axios';

const AdminProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        isActive: true,
        featured: false,
        discount: 0,
        images: []
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        category: '',
        isActive: ''
    });

    useEffect(() => {
        loadProducts();
    }, [page, filters]);

    const convertCategory = (oldCategory) => {
        const categoryMap = {
            'electronics': 'Électronique',
            'clothing': 'Vêtements',
            'books': 'Loisirs'
        };
        return categoryMap[oldCategory] || oldCategory;
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError('');

            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                ...filters,
                _t: new Date().getTime()
            }).toString();

            console.log('Chargement des produits avec les paramètres:', queryParams);
            const response = await axiosInstance.get(`/products/admin?${queryParams}`);
            console.log('Réponse du serveur:', response.data);

            if (response.data.success) {
                const products = response.data.products || [];
                if (products.length === 0) {
                    setError('Aucun produit trouvé');
                } else {
                    setProducts(products);
                    const total = parseInt(response.data.total) || 0;
                    const limit = parseInt(response.data.limit) || 10;
                    setTotalPages(Math.max(1, Math.ceil(total / limit)));
                }
            } else {
                throw new Error(response.data.message || 'Erreur lors du chargement des produits');
            }
        } catch (err) {
            console.error('Erreur lors du chargement des produits:', err);
            if (err.response?.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
                navigate('/login');
            } else if (err.response?.status === 403) {
                setError('Accès non autorisé. Droits administrateur requis.');
            } else if (err.response?.status === 500) {
                setError('Erreur serveur. Veuillez réessayer plus tard ou contacter l\'administrateur.');
            } else {
                setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des produits');
            }
            setProducts([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (product = null) => {
        if (product) {
            setSelectedProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                isActive: product.isActive,
                featured: product.featured,
                discount: product.discount,
                images: product.images
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category: '',
            isActive: true,
            featured: false,
            discount: 0,
            images: []
        });
        setError('');
        setSuccess('');
    };

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'isActive' ? checked : value
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
            setError('');
            setSuccess('');

            if (!selectedProduct || !selectedProduct._id) {
                throw new Error('Produit non sélectionné ou invalide');
            }

            // Préparation des données
            const productData = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                category: formData.category,
                stock: Number(formData.stock),
                isActive: Boolean(formData.isActive),
                featured: Boolean(formData.featured),
                discount: Number(formData.discount) || 0,
                images: formData.images
            };

            console.log('AdminProducts - Mise à jour du produit:', {
                id: selectedProduct._id,
                data: productData
            });

            const response = await axiosInstance.put(`/products/${selectedProduct._id}`, productData);
            
            if (response.data.success) {
                setSuccess('Produit mis à jour avec succès');
                handleCloseDialog();
                loadProducts();
            } else {
                throw new Error(response.data.message || 'Erreur lors de la mise à jour du produit');
            }
        } catch (err) {
            console.error('AdminProducts - Erreur lors de la mise à jour du produit:', err);
            setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du produit');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/products/${id}`);
                if (response.data.success) {
                    setSuccess('Produit supprimé avec succès');
                    loadProducts();
                } else {
                    throw new Error(response.data.message || 'Erreur lors de la suppression du produit');
                }
            } catch (err) {
                console.error('AdminProducts - Erreur lors de la suppression du produit:', err);
                setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression du produit');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = (product) => {
        if (!product || !product._id) {
            console.error('AdminProducts - Produit invalide:', product);
            setError('Produit invalide');
            return;
        }

        console.log('AdminProducts - Édition du produit:', product);
        
        setSelectedProduct(product);
        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || 0,
            category: convertCategory(product.category) || '',
            stock: product.stock || 0,
            isActive: product.isActive !== undefined ? product.isActive : true,
            featured: product.featured || false,
            discount: product.discount || 0,
            images: product.images || []
        });
        setOpenDialog(true);
    };

    if (loading) return <Typography>Chargement...</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Gestion des Produits
            </Typography>

            {/* Filtres */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Catégorie</InputLabel>
                            <Select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                label="Catégorie"
                            >
                                <MenuItem value="">Toutes</MenuItem>
                                <MenuItem value="electronics">Électronique</MenuItem>
                                <MenuItem value="clothing">Vêtements</MenuItem>
                                <MenuItem value="books">Loisirs</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Statut</InputLabel>
                            <Select
                                name="isActive"
                                value={filters.isActive}
                                onChange={handleFilterChange}
                                label="Statut"
                            >
                                <MenuItem value="">Tous</MenuItem>
                                <MenuItem value="true">Actif</MenuItem>
                                <MenuItem value="false">Inactif</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenDialog()}
                            fullWidth
                        >
                            Ajouter un produit
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Tableau des produits */}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Nom</TableCell>
                                    <TableCell>Catégorie</TableCell>
                                    <TableCell>Prix</TableCell>
                                    <TableCell>Stock</TableCell>
                                    <TableCell>Statut</TableCell>
                                    <TableCell>Actions</TableCell>
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
                                                'Pas d\'image'
                                            )}
                                        </TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{convertCategory(product.category)}</TableCell>
                                        <TableCell>{product.price} €</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={product.isActive ? 'Actif' : 'Inactif'}
                                                color={product.isActive ? 'success' : 'error'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(product)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(product._id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(e, value) => setPage(value)}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Messages de succès/erreur */}
            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess('')}
            >
                <Alert severity="success" onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
            >
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            </Snackbar>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nom"
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
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Prix"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Stock"
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Catégorie</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        label="Catégorie"
                                        required
                                    >
                                        <MenuItem value="Électronique">Électronique</MenuItem>
                                        <MenuItem value="Vêtements">Vêtements</MenuItem>
                                        <MenuItem value="Maison">Maison</MenuItem>
                                        <MenuItem value="Sport">Sport</MenuItem>
                                        <MenuItem value="Loisirs">Loisirs</MenuItem>
                                        <MenuItem value="Autres">Autres</MenuItem>
                                    </Select>
                                </FormControl>
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
                                    label="Produit actif"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.featured}
                                            onChange={handleChange}
                                            name="featured"
                                            color="primary"
                                        />
                                    }
                                    label="Produit mis en avant"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Discount"
                                    name="discount"
                                    type="number"
                                    value={formData.discount}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Images"
                                    name="images"
                                    value={formData.images.join(', ')}
                                    onChange={handleChange}
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
        </Box>
    );
};

export default AdminProducts;