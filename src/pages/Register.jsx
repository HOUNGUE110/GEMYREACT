import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api.js';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Payload envoyant les formats attendus (name complet + nom/prenom séparés)
            const payload = {
                name: `${formData.prenom} ${formData.nom}`.trim(),
                nom: formData.nom,
                prenom: formData.prenom,
                email: formData.email,
                telephone: formData.telephone,
                password: formData.password,
                password_confirmation: formData.password_confirmation || formData.password
            };

            const response = await API.post('/register', payload);

            // Stockage harmonisé dans le localStorage
            const token = response.data.access_token || response.data.token;
            const user = response.data.user;

            localStorage.setItem('gemy_token', token);
            localStorage.setItem('gemy_user', JSON.stringify(user));
            
            navigate('/');
        } catch (err) {
            console.error("Erreur complète API :", err.response);
            
            // Capture et affichage du premier message de validation de Laravel (HTTP 422)
            if (err.response?.status === 422 && err.response.data.errors) {
                const firstErrorKey = Object.keys(err.response.data.errors)[0];
                const firstErrorMessage = err.response.data.errors[firstErrorKey][0];
                setError(`${firstErrorKey.toUpperCase()}: ${firstErrorMessage}`);
            } else {
                setError(err.response?.data?.message || "Erreur lors de la création du compte.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>📍 Gemy — Inscription</h2>
                <p style={styles.subtitle}>Créez votre compte pour partager des opportunités</p>

                {error && <div style={styles.errorBox}>⚠️ {error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.row}>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Nom</label>
                            <input type="text" name="nom" placeholder="Votre nom" value={formData.nom} onChange={handleInputChange} required style={styles.input} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Prénom</label>
                            <input type="text" name="prenom" placeholder="Votre prénom" value={formData.prenom} onChange={handleInputChange} required style={styles.input} />
                        </div>
                    </div>

                    <label style={styles.label}>Adresse Email</label>
                    <input type="email" name="email" placeholder="exemple@mail.com" value={formData.email} onChange={handleInputChange} required style={styles.input} />

                    <label style={styles.label}>Numéro de Téléphone</label>
                    <input type="text" name="telephone" placeholder="Ex: 90000000" value={formData.telephone} onChange={handleInputChange} required style={styles.input} />

                    <label style={styles.label}>Mot de passe</label>
                    <input type="password" name="password" placeholder="Minimum 6 caractères" value={formData.password} onChange={handleInputChange} required style={styles.input} />

                    <button type="submit" disabled={loading} style={{...styles.submitBtn, backgroundColor: loading ? '#94a3b8' : '#22c55e'}}>
                        {loading ? "Création en cours..." : "Créer mon compte"}
                    </button>
                </form>

                <p style={styles.footerText}>
                    Déjà un compte ? <span onClick={() => navigate('/login')} style={styles.link}>Se connecter</span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
    card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', boxSizing: 'border-box' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#007bff', margin: '0 0 5px 0', textAlign: 'center' },
    subtitle: { fontSize: '14px', color: '#64748b', margin: '0 0 20px 0', textAlign: 'center' },
    errorBox: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', border: '1px solid #fca5a5' },
    form: { display: 'flex', flexDirection: 'column' },
    row: { display: 'flex', gap: '10px', marginBottom: '0' },
    label: { fontSize: '13px', fontWeight: '600', color: '#334155', marginTop: '10px', marginBottom: '4px' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' },
    submitBtn: { width: '100%', padding: '12px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '20px' },
    footerText: { fontSize: '14px', color: '#64748b', textAlign: 'center', marginTop: '20px', margin: '20px 0 0 0' },
    link: { color: '#007bff', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }
};