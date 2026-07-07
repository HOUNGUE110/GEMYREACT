import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

export default function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/login', credentials);
            localStorage.setItem('gemy_token', response.data.access_token);
            localStorage.setItem('gemy_user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Identifiants incorrects ou erreur serveur.');
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.card}>
                <h2 style={styles.title}>Connexion à Gemy</h2>
                
                {error && <p style={styles.error}>{error}</p>}

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Adresse Email</label>
                    <input type="email" name="email" placeholder="exemple@email.com" value={credentials.email} onChange={handleChange} required style={styles.input} />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Mot de passe</label>
                    <input type="password" name="password" placeholder="••••••••••••" value={credentials.password} onChange={handleChange} required style={styles.input} />
                </div>

                <button type="submit" style={styles.button}>Se connecter</button>

                <p style={styles.footerText}>
                    Nouveau citoyen ? <Link to="/register" style={styles.link}>Créer un compte</Link>
                </p>
            </form>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#f1f5f9', fontFamily: 'Arial, sans-serif' },
    card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', width: '100%', maxWidth: '400px', boxSizing: 'border-box' },
    title: { color: '#1e293b', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', marginStatic: 0 },
    error: { color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', fontSize: '14px', textAlign: 'center', marginBottom: '15px', fontWeight: '500' },
    inputGroup: { marginBottom: '18px' },
    label: { display: 'block', color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '6px' },
    input: { width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#1e293b', fontSize: '14px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
    footerText: { textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '20px', marginBottom: 0 },
    link: { color: '#007bff', fontWeight: '600', textDecoration: 'none' }
};