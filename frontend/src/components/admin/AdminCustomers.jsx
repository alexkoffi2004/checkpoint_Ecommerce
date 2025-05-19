import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Chip,
    Alert,
    Snackbar,
    CircularProgress,
    Grid,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Block as BlockIcon,
    CheckCircle as ActiveIcon
} from '@mui/icons-material';
import axiosInstance from '../../config/axios';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        isActive: true
    });

    useEffect(() => {
        loadCustomers();
    }, [page, rowsPerPage]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            console.log('AdminCustomers - Chargement des clients...');
            const response = await axiosInstance.get('/users/admin', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    _t: new Date().getTime()
                }
            });
            console.log('AdminCustomers - Réponse:', response.data);
            if (response.data.success) {
                setCustomers(response.data.users);
                setError(null);
            } else {
                throw new Error(response.data.message || 'Erreur lors du chargement des clients');
            }
        } catch (err) {
            console.error('AdminCustomers - Erreur lors du chargement des clients:', err);
            console.error('AdminCustomers - Détails de l\'erreur:', {
                status: err.response?.status,
                data: err.response?.data,
                headers: err.response?.headers,
                message: err.message
            });
            setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des clients');
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewCustomer = (customer) => {
        setSelectedCustomer(customer);
        setOpenDialog(true);
    };

    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setEditForm({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            role: customer.role,
            isActive: customer.isActive
        });
        setOpenEditDialog(true);
    };

    const handleEditChange = (e) => {
        const { name, value, checked } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: name === 'isActive' ? checked : value
        }));
    };

    const handleEditSubmit = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.put(`/users/${selectedCustomer._id}`, editForm);
            if (response.data.success) {
                setCustomers(prev => prev.map(customer => 
                    customer._id === selectedCustomer._id ? response.data.user : customer
                ));
                setSuccess('Client mis à jour avec succès');
                setOpenEditDialog(false);
            } else {
                throw new Error(response.data.message || 'Erreur lors de la mise à jour du client');
            }
        } catch (err) {
            console.error('AdminCustomers - Erreur lors de la mise à jour du client:', err);
            setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du client');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCustomer = async (customerId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/users/${customerId}`);
                if (response.data.success) {
                    setCustomers(prev => prev.filter(customer => customer._id !== customerId));
                    setSuccess('Client supprimé avec succès');
                } else {
                    throw new Error(response.data.message || 'Erreur lors de la suppression du client');
                }
            } catch (err) {
                console.error('AdminCustomers - Erreur lors de la suppression du client:', err);
                setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression du client');
            } finally {
                setLoading(false);
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Gestion des Clients
            </Typography>

            {loading && (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nom</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Téléphone</TableCell>
                            <TableCell>Rôle</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Date d'inscription</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer._id}>
                                <TableCell>{customer.name}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell>{customer.phone || '-'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={customer.role === 'admin' ? 'Administrateur' : 'Client'}
                                        color={customer.role === 'admin' ? 'primary' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={customer.isActive ? 'Actif' : 'Inactif'}
                                        color={customer.isActive ? 'success' : 'error'}
                                        icon={customer.isActive ? <ActiveIcon /> : <BlockIcon />}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{formatDate(customer.createdAt)}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleViewCustomer(customer)}
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                    <IconButton
                                        color="info"
                                        onClick={() => handleEditCustomer(customer)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteCustomer(customer._id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={-1}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Dialog pour voir les détails du client */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                {selectedCustomer && (
                    <>
                        <DialogTitle>
                            Détails du client
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Informations personnelles
                                    </Typography>
                                    <Typography variant="body2">
                                        Nom: {selectedCustomer.name}
                                    </Typography>
                                    <Typography variant="body2">
                                        Email: {selectedCustomer.email}
                                    </Typography>
                                    {selectedCustomer.phone && (
                                        <Typography variant="body2">
                                            Téléphone: {selectedCustomer.phone}
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Informations du compte
                                    </Typography>
                                    <Typography variant="body2">
                                        Rôle: {selectedCustomer.role === 'admin' ? 'Administrateur' : 'Client'}
                                    </Typography>
                                    <Typography variant="body2">
                                        Statut: {selectedCustomer.isActive ? 'Actif' : 'Inactif'}
                                    </Typography>
                                    <Typography variant="body2">
                                        Date d'inscription: {formatDate(selectedCustomer.createdAt)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>
                                Fermer
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Dialog pour modifier le client */}
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Modifier le client
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nom"
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={editForm.email}
                                onChange={handleEditChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Téléphone"
                                name="phone"
                                value={editForm.phone}
                                onChange={handleEditChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Rôle"
                                name="role"
                                value={editForm.role}
                                onChange={handleEditChange}
                            >
                                <option value="user">Client</option>
                                <option value="admin">Administrateur</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editForm.isActive}
                                        onChange={handleEditChange}
                                        name="isActive"
                                        color="primary"
                                    />
                                }
                                label="Compte actif"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleEditSubmit}
                        disabled={loading}
                    >
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>

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

export default AdminCustomers; 