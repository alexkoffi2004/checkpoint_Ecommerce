import React from 'react';
import {
    Container,
    Grid,
    Box,
    Typography,
    TextField,
    MenuItem,
    Pagination,
    CircularProgress,
    Alert,
    Paper,
    Button
} from '@mui/material';
import { useProducts } from '../../context/ProductContext';
import ProductCard from './ProductCard';

const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'electronics', label: 'Électronique' },
    { value: 'clothing', label: 'Vêtements' },
    { value: 'books', label: 'Livres' },
    { value: 'home', label: 'Maison' },
    { value: 'sports', label: 'Sports' }
];

const sortOptions = [
    { value: '-createdAt', label: 'Plus récent' },
    { value: 'price', label: 'Prix croissant' },
    { value: '-price', label: 'Prix décroissant' },
    { value: '-rating', label: 'Meilleures notes' }
];

const ProductList = () => {
    const {
        products,
        loading,
        error,
        page,
        pages,
        filters,
        updateFilters,
        setPage
    } = useProducts();

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        updateFilters({ [name]: value });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert 
                    severity="error"
                    action={
                        <Button 
                            color="inherit" 
                            size="small" 
                            onClick={() => {
                                updateFilters({ keyword: '', category: '', sort: '-createdAt' });
                                setPage(1);
                            }}
                        >
                            Réinitialiser les filtres
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Rechercher"
                            name="keyword"
                            value={filters.keyword}
                            onChange={handleFilterChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            select
                            label="Catégorie"
                            name="category"
                            value={filters.category}
                            onChange={handleFilterChange}
                            variant="outlined"
                        >
                            {categories.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            select
                            label="Trier par"
                            name="sort"
                            value={filters.sort}
                            onChange={handleFilterChange}
                            variant="outlined"
                        >
                            {sortOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            {products.length === 0 ? (
                <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary">
                        Aucun produit trouvé
                    </Typography>
                    <Button 
                        variant="outlined" 
                        sx={{ mt: 2 }}
                        onClick={() => {
                            updateFilters({ keyword: '', category: '', sort: '-createdAt' });
                            setPage(1);
                        }}
                    >
                        Réinitialiser les filtres
                    </Button>
                </Box>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {products.map((product) => (
                            <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                                <ProductCard product={product} />
                            </Grid>
                        ))}
                    </Grid>

                    {pages > 1 && (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <Pagination
                                count={pages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                            />
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default ProductList; 