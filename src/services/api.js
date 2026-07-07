import axios from 'axios';

// Configuration de l'URL de base de ton API Laravel
const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
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