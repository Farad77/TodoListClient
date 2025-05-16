'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css'; // Assurez-vous que le chemin est correct

const API_URL = 'http://localhost:8080';

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nouvelUtilisateur, setNouvelUtilisateur] = useState({
    nom: '',
    prenom: '',
    email: '',
  });
  const router = useRouter();

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/utilisateurs`);
      
      if (response.data._embedded && response.data._embedded.utilisateurs) {
        setUtilisateurs(response.data._embedded.utilisateurs);
      }
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  const ajouterUtilisateur = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API_URL}/utilisateurs`, nouvelUtilisateur);
      
      fetchUtilisateurs();
      
      setNouvelUtilisateur({
        nom: '',
        prenom: '',
        email: '',
      });
      
      setShowModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', err);
      setError('Impossible d\'ajouter l\'utilisateur.');
    }
  };

  const supprimerUtilisateur = async (url) => {
    try {
      await axios.delete(url);
      
      setUtilisateurs(utilisateurs.filter(utilisateur => 
        utilisateur._links.self.href !== url
      ));
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      setError('Impossible de supprimer l\'utilisateur.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNouvelUtilisateur({
      ...nouvelUtilisateur,
      [name]: value,
    });
  };

  const voirTaches = (utilisateurId) => {
    router.push(`/?utilisateur=${utilisateurId}`);
  };

  const extractIdFromUrl = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Link href="/" className={styles.sidebarItem}>
          <span className={styles.sidebarIcon}>📊</span>
          Tableau de bord
        </Link>
        <Link href="/utilisateurs" className={styles.sidebarItem}>
          <span className={styles.sidebarIcon}>👥</span>
          Utilisateurs
        </Link>
        <Link href="/" className={styles.sidebarItem}>
          <span className={styles.sidebarIcon}>📝</span>
          Tâches
        </Link>
        <Link href="/" className={styles.sidebarItem}>
          <span className={styles.sidebarIcon}>📅</span>
          Calendrier
        </Link>
        <Link href="/" className={styles.sidebarItem}>
          <span className={styles.sidebarIcon}>⚙️</span>
          Paramètres
        </Link>
      </div>

      <div className={styles.content}>
        <h1 className={styles.pageTitle}>Gestion des Utilisateurs</h1>
        
        <button 
          className={styles.addButton}
          onClick={() => setShowModal(true)}
        >
          <span className={styles.addIcon}>+</span>
          Ajouter un utilisateur
        </button>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.userList}>
          <h2 className={styles.listTitle}>Liste des Utilisateurs</h2>
          
          {loading ? (
            <p className={styles.loading}>Chargement des utilisateurs...</p>
          ) : (
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>UTILISATEUR</th>
                  <th>EMAIL</th>
                  <th>DATE D'INSCRIPTION</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.length === 0 ? (
                  <tr>
                    <td colSpan="4">Aucun utilisateur trouvé.</td>
                  </tr>
                ) : (
                  utilisateurs.map(utilisateur => (
                    <tr key={extractIdFromUrl(utilisateur._links.self.href)}>
                      <td className={styles.userName}>
                        {utilisateur.prenom} {utilisateur.nom}
                      </td>
                      <td className={styles.userEmail}>{utilisateur.email}</td>
                      <td className={styles.userDate}>
                        {new Date(utilisateur.dateInscription).toLocaleDateString()}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            onClick={() => voirTaches(extractIdFromUrl(utilisateur._links.self.href))}
                            className={styles.viewButton}
                          >
                            Voir les tâches
                          </button>
                          <button
                            onClick={() => supprimerUtilisateur(utilisateur._links.self.href)}
                            className={styles.deleteButton}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Ajouter un nouvel utilisateur</h2>
              <button 
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <form onSubmit={ajouterUtilisateur}>
                <div className={styles.formGroup}>
                  <label htmlFor="prenom" className={styles.label}>Prénom</label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={nouvelUtilisateur.prenom}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="nom" className={styles.label}>Nom</label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={nouvelUtilisateur.nom}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={nouvelUtilisateur.email}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.modalFooter}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}