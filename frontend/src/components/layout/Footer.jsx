import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Divider, IconButton, Stack, Container, Grid } from '@mui/material';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Logo et description */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            AJK MARKET
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Votre destination de shopping en ligne pour des produits de qualité à des prix compétitifs.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <IconButton size="small" color="primary">
                                <FaFacebook />
                            </IconButton>
                            <IconButton size="small" color="primary">
                                <FaTwitter />
                            </IconButton>
                            <IconButton size="small" color="primary">
                                <FaInstagram />
                            </IconButton>
                            <IconButton size="small" color="primary">
                                <FaLinkedin />
                            </IconButton>
                        </Stack>
                    </Grid>

                    {/* Liens rapides */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Liens Rapides
                        </Typography>
                        <Stack spacing={1}>
                            <Link to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                                    Produits
                                </Typography>
                            </Link>
                            <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                                    Panier
                                </Typography>
                            </Link>
                            <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                                    Mon Compte
                                </Typography>
                            </Link>
                            <Link to="/favorites" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                                    Favoris
                                </Typography>
                            </Link>
                        </Stack>
                    </Grid>

                    {/* Informations */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Informations
                        </Typography>
                        <Stack spacing={1}>
                            <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                                    À propos
                                </Typography>
                            </Link>
                            <Link to="/contact" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                                    Contact
                                </Typography>
                            </Link>
                            <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                                    Conditions d'utilisation
                                </Typography>
                            </Link>
                            <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                                    Politique de confidentialité
                                </Typography>
                            </Link>
                        </Stack>
                    </Grid>

                    {/* Contact */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Contact
                        </Typography>
                        <Stack spacing={1}>
                            <Typography variant="body2" color="text.secondary">
                                Email: AJK.market@gmail.com
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Téléphone: +225 07 19 95 13 19
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Adresse: Abidjan, Côte d'Ivoire
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Horaires: Lun-Sam, 8h-18h
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>

                {/* Copyright */}
                <Box sx={{ mt: 4, pt: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" align="center">
                        &copy; {new Date().getFullYear()} AJK MARKET. Tous droits réservés.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer; 