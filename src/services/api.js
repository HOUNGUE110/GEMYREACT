import axios from 'axios';

// Configuration de l'URL de base de ton API Laravel
const API = axios.create({
    baseURL: 'https://gemylaravel.onrender.com',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Middleware pour injecter automatiquement le Token s'il existe
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('gemy_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;