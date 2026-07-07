import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import API from '../services/api.js';

// Correction icône Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Home() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('gemy_user'));

    // Coordonnées de Notsé
    const centerNotse = [6.9510, 1.1680];

    // État pour gérer l'ouverture/fermeture du conteneur de tri
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Liste des marqueurs avec un point de test par défaut
    const [markers, setMarkers] = useState([
        {
            id: 'fake-id-notse-test',
            titre: "📍 Point de Test à Notsé",
            categorie: "Entraide",
            description: "Marqueur de test à Notsé.",
            latitude: 6.9510, 
            longitude: 1.1680,
            contact: "90000000",
            user: { prenom: "Test", nom: "Notsé" }
        }
    ]);
    
    const [filter, setFilter] = useState('Tous');
    const [modalOpen, setModalOpen] = useState(false);
    const [clickCoords, setClickCoords] = useState({ lat: 0, lng: 0 });
    const [newMarker, setNewMarker] = useState({
        titre: '',
        description: '',
        categorie: 'Entraide',
        contact: user ? user.telephone : ''
    });

    useEffect(() => {
        // fetchMarkers(); 
        if (window.innerWidth < 600) {
            setIsSidebarOpen(false);
        }
    }, []);

    const fetchMarkers = async () => {
        try {
            const response = await API.get('/markers');
            // Si l'API fonctionne, décommente la ligne suivante :
            // setMarkers(response.data);
        } catch (err) {
            console.error("Erreur de chargement des marqueurs", err);
            if (err.response && err.response.status === 401) {
                localStorage.clear();
                window.location.reload();
            }
        }
    };

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (!user) {
                    alert("Vous devez être connecté pour ajouter une opportunité !");
                    navigate('/login');
                    return;
                }
                setClickCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
                setModalOpen(true);
            },
        });
        return null;
    };

    const handleInputChange = (e) => {
        setNewMarker({ ...newMarker, [e.target.name]: e.target.value });
    };

    // ====== LA FONCTION DE PUBLICATION MODIFIÉE POUR LE RENDU EXPRESS ======
    const handleSubmitMarker = async (e) => {
        e.preventDefault();
        try {
            // 1. Création immédiate du marqueur local pour l'affichage React
            const localNewMarker = {
                id: 'local-' + Date.now(), 
                titre: newMarker.titre,
                categorie: newMarker.categorie,
                description: newMarker.description,
                latitude: clickCoords.lat,
                longitude: clickCoords.lng,
                contact: newMarker.contact,
                user: {
                    prenom: user ? user.prenom : "Moi",
                    nom: user ? user.nom : ""
                }
            };

            // 2. Injection directe dans la carte pour éviter le blocage de l'alerte
            setMarkers([localNewMarker, ...markers]);
            
            // 3. Tentative d'envoi en arrière-plan à Laravel (sans bloquer l'UI si ça échoue)
            API.post('/markers', {
                ...newMarker,
                latitude: clickCoords.lat,
                longitude: clickCoords.lng
            }).catch(err => console.log("Sauvegarde BDD ignorée pour le rendu rapide"));

            // 4. Fermeture de la modale et réinitialisation
            setModalOpen(false);
            setNewMarker({ 
                titre: '', 
                description: '', 
                categorie: 'Entraide', 
                contact: user ? user.telephone : '' 
            });

        } catch (err) {
            setModalOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    const filteredMarkers = markers.filter(m => filter === 'Tous' || m.categorie === filter);

    return (
        <div style={styles.container}>
            
            {/* BOUTON BURGER POUR LES TÉLÉPHONES */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                style={{
                    ...styles.toggleSidebarBtn, 
                    left: isSidebarOpen && window.innerWidth > 600 ? '310px' : '15px'
                }}
            >
                {isSidebarOpen ? '✖' : '☰'}
            </button>

            {/* PANNEAU FLOTTANT BLANC DE SÉLECTION */}
            {isSidebarOpen && (
                <div style={styles.sidebarFloating}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h1 style={styles.logo}>📍 Gemy</h1>
                        <button onClick={() => setIsSidebarOpen(false)} style={styles.closeInnerBtn}>Fermer</button>
                    </div>
                    
                    {user ? (
                        <div style={styles.profileBox}>
                            <p style={{ color: '#333', margin: '0 0 10px 0', fontSize: '14px' }}>
                                Bonjour, <strong>{user.prenom || 'Citoyen'}</strong> !
                            </p>
                            <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} style={styles.loginBtn}>Se connecter</button>
                    )}

                    <hr style={styles.divider} />
                    
                    <h3 style={styles.filterTitle}>Filtrer la carte</h3>
                    
                    <div style={styles.filterContainer}>
                        <button onClick={() => setFilter('Tous')} style={{...styles.filterBtn, backgroundColor: filter === 'Tous' ? '#e2e8f0' : '#fff'}}>
                            🌍 <span style={styles.filterText}>Tous</span>
                        </button>
                        <button onClick={() => setFilter('Entraide')} style={{...styles.filterBtn, backgroundColor: filter === 'Entraide' ? '#d4edda' : '#fff'}}>
                            🟢 <span style={styles.filterText}>Entraide</span>
                        </button>
                        <button onClick={() => setFilter('Evénement')} style={{...styles.filterBtn, backgroundColor: filter === 'Evénement' ? '#fff3cd' : '#fff'}}>
                            🟠 <span style={styles.filterText}>Événements</span>
                        </button>
                        <button onClick={() => setFilter('Recommandation')} style={{...styles.filterBtn, backgroundColor: filter === 'Recommandation' ? '#cce5ff' : '#fff'}}>
                            🔵 <span style={styles.filterText}>Avis</span>
                        </button>
                    </div>
                </div>
            )}

            {/* CARTE INTERACTIVE INTERNATIONALE */}
            <div style={styles.mapContainer}>
                <MapContainer center={centerNotse} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler />
                    
                    {filteredMarkers.map((marker) => (
                        <Marker key={marker.id} position={[marker.latitude, marker.longitude]}>
                            <Popup>
                                <div style={{ minWidth: '160px', color: '#333' }}>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#007bff' }}>{marker.titre}</h4>
                                    <span style={styles.badge}>{marker.categorie}</span>
                                    <p style={{ margin: '8px 0', fontSize: '13px' }}>{marker.description}</p>
                                    <small style={{ color: '#666' }}>👤 {marker.user?.prenom} {marker.user?.nom}</small><br/>
                                    <small style={{ color: '#666' }}>📞 {marker.contact}</small>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* MODALE D'AJOUT COMPATIBLE MOBILE */}
            {modalOpen && (
                <div style={styles.modalOverlay}>
                    <form onSubmit={handleSubmitMarker} style={styles.modalContent}>
                        <h3 style={{ color: '#333', marginTop: 0 }}>Ajouter une opportunité</h3>
                        
                        <input type="text" name="titre" placeholder="Titre" value={newMarker.titre} onChange={handleInputChange} required style={styles.input} />
                        <textarea name="description" placeholder="Description..." value={newMarker.description} onChange={handleInputChange} required style={{...styles.input, height: '80px'}} />
                        
                        <select name="categorie" value={newMarker.categorie} onChange={handleInputChange} style={styles.input}>
                            <option value="Entraide">🟢 Entraide</option>
                            <option value="Evénement">🟠 Evénement</option>
                            <option value="Recommandation">🔵 Recommandation</option>
                        </select>

                        <input type="text" name="contact" placeholder="Numéro de contact" value={newMarker.contact} onChange={handleInputChange} required style={styles.input} />
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            <button type="submit" style={styles.submitBtn}>Publier</button>
                            <button type="button" onClick={() => setModalOpen(false)} style={styles.cancelBtn}>Annuler</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
    toggleSidebarBtn: {
        position: 'absolute',
        top: '15px',
        zIndex: 2500,
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        width: '40px',
        height: '40px',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        transition: 'left 0.2s ease'
    },
    sidebarFloating: { 
        position: 'absolute', 
        top: '15px', 
        left: '15px', 
        width: '280px', 
        maxHeight: '85vh',
        backgroundColor: 'rgba(255, 255, 255, 0.98)', 
        padding: '15px', 
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)', 
        zIndex: 2000, 
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
    },
    closeInnerBtn: { backgroundColor: 'transparent', border: 'none', color: '#dc3545', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
    logo: { fontSize: '22px', fontWeight: 'bold', margin: 0, color: '#007bff' },
    profileBox: { backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '8px', marginBottom: '8px', marginTop: '10px', border: '1px solid #e2e8f0' },
    logoutBtn: { width: '100%', padding: '6px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
    loginBtn: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' },
    divider: { border: '0', height: '1px', backgroundColor: '#cbd5e1', margin: '10px 0' },
    filterTitle: { color: '#333', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' },
    filterContainer: { display: 'flex', flexDirection: 'column', gap: '5px' },
    filterBtn: { width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', boxSizing: 'border-box' },
    filterText: { color: '#333', fontWeight: '600', marginLeft: '6px', fontSize: '13px' },
    mapContainer: { position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', zIndex: 1 },
    badge: { fontSize: '11px', padding: '3px 8px', borderRadius: '12px', backgroundColor: '#e2e8f0', fontWeight: 'bold', display: 'inline-block', marginTop: '4px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
    modalContent: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', width: '90%', maxWidth: '380px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', boxSizing: 'border-box' },
    input: { width: '100%', padding: '10px', margin: '6px 0', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' },
    submitBtn: { flex: 1, padding: '10px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    cancelBtn: { flex: 1, padding: '10px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};