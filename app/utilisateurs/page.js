'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // ou 'next/router' pour Pages Router
import Link from 'next/link';
import styles from '../page.module.css'; // Ajustez le chemin selon votre structure

const API_URL = 'http://localhost:8080';

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nouvelUtilisateur, setNouvelUtilisateur] = useState({
    nom: '',
    prenom: '',
    email: '',
  });
  const router = useRouter();

  // Récupérer tous les utilisateurs
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
      setError('Impossible de charger les utilisateurs. Vérifiez que votre API Spring est en cours d\'exécution.');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un nouvel utilisateur
  const ajouterUtilisateur = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${API_URL}/utilisateurs`, nouvelUtilisateur);
      
      // Ajouter le nouvel utilisateur à la liste
      fetchUtilisateurs();
      
      // Réinitialiser le formulaire
      setNouvelUtilisateur({
        nom: '',
        prenom: '',
        email: '',
      });
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', err);
      setError('Impossible d\'ajouter l\'utilisateur.');
    }
  };

  // Supprimer un utilisateur
  const supprimerUtilisateur = async (url) => {
    try {
      await axios.delete(url);
      
      // Mettre à jour la liste des utilisateurs
      setUtilisateurs(utilisateurs.filter(utilisateur => 
        utilisateur._links.self.href !== url
      ));
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      setError('Impossible de supprimer l\'utilisateur.');
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNouvelUtilisateur({
      ...nouvelUtilisateur,
      [name]: value,
    });
  };

  // Voir les tâches d'un utilisateur
  const voirTaches = (utilisateurId) => {
    router.push(`/?utilisateur=${utilisateurId}`);
  };

  // Extraire l'ID d'une URL
  const extractIdFromUrl = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Gestion des Utilisateurs</h1>
        
        <Link href="/" className={styles.backLink}>
          ← Retour à la liste des tâches
        </Link>
        
        {error && <p className={styles.error}>{error}</p>}
        
        <form onSubmit={ajouterUtilisateur} className={styles.form}>
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={nouvelUtilisateur.nom}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={nouvelUtilisateur.prenom}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={nouvelUtilisateur.email}
            onChange={handleChange}
            required
            className={styles.input}
          />
          
          <button type="submit" className={styles.button}>Ajouter Utilisateur</button>
        </form>
        
        {loading ? (
          <p>Chargement des utilisateurs...</p>
        ) : (
          <div className={styles.usersContainer}>
            <h2>Liste des Utilisateurs ({utilisateurs.length})</h2>
            <ul className={styles.userList}>
              {utilisateurs.length === 0 ? (
                <p>Aucun utilisateur trouvé.</p>
              ) : (
                utilisateurs.map(utilisateur => (
                  <li key={extractIdFromUrl(utilisateur._links.self.href)} className={styles.userItem}>
                    <div className={styles.userContent}>
                      <h3>{utilisateur.prenom} {utilisateur.nom}</h3>
                      <p>Email: {utilisateur.email}</p>
                      <p>Inscription: {new Date(utilisateur.dateInscription).toLocaleDateString()}</p>
                    </div>
                    <div className={styles.userActions}>
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
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}