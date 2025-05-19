import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    TextField, 
    Button, 
    Typography, 
    Box, 
    Container, 
    Alert,
    Paper,
    Stack,
    Divider
} from '@mui/material';
import { 
    Login as LoginIcon,
    PersonAdd as RegisterIcon,
    Home as HomeIcon
} from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      console.log('Tentative de connexion avec:', { email });
      const response = await login({ email, password });
      console.log('Connexion réussie:', response);
      navigate('/');
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Erreur de connexion');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        {/* Navigation Links */}
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            mb: 4, 
            justifyContent: 'center',
            '& a': {
              textDecoration: 'none',
              color: 'inherit'
            }
          }}
        >
          <Button
            component={Link}
            to="/"
            startIcon={<HomeIcon />}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'primary.light',
                opacity: 0.1
              }
            }}
          >
            Accueil
          </Button>
          <Button
            component={Link}
            to="/register"
            startIcon={<RegisterIcon />}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'primary.light',
                opacity: 0.1
              }
            }}
          >
            Inscription
          </Button>
        </Stack>

        {/* Login Form */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LoginIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Connexion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connectez-vous pour accéder à votre compte
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Mot de passe"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large"
              sx={{ 
                py: 1.5,
                mb: 2,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              Se connecter
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              ou
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Pas encore de compte ?
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              fullWidth
              sx={{ 
                mt: 1,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Créer un compte
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;