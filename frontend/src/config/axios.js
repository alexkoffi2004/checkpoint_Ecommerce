import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://checkpoint-ecommerce-backend-tvl9.onrender.com/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token d'authentification
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 