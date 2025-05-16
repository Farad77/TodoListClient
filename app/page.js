'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // ou 'next/router' pour Pages Router
import styles from './page.module.css';

const API_URL = 'http://localhost:8080';

export default function Home() {
  const [tachesPersonnelles, setTachesPersonnelles] = useState([]);
  const [tachesProfessionnelles, setTachesProfessionnelles] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [selectedUtilisateur, setSelectedUtilisateur] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nouvelleTache, setNouvelleTache] = useState({
    titre: '',
    description: '',
    statut: 'EN_COURS',
    priorite: 'BASSE',
    type: 'personnelle',
    utilisateur: null
  });
  
  // Utilisons useSearchParams pour obtenir l'ID utilisateur de l'URL
  const searchParams = useSearchParams();
  const utilisateurIdParam = searchParams ? searchParams.get('utilisateur') : null;
  
  // Récupérer les utilisateurs
  useEffect(() => {
    fetchUtilisateurs();
  }, []);
  
  // Mettre à jour le filtre utilisateur si présent dans l'URL
  useEffect(() => {
    if (utilisateurIdParam) {
      setSelectedUtilisateur(utilisateurIdParam);
    }
  }, [utilisateurIdParam]);
  
  // Récupérer les tâches lorsque le filtre utilisateur change
  useEffect(() => {
    fetchTaches();
  }, [selectedUtilisateur]);

  const fetchUtilisateurs = async () => {
    try {
      const response = await axios.get(`${API_URL}/utilisateurs`);
      
      if (response.data._embedded && response.data._embedded.utilisateurs) {
        setUtilisateurs(response.data._embedded.utilisateurs);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
    }
  };

  const fetchTaches = async () => {
    try {
      setLoading(true);
      // Construire l'URL en fonction du filtrage par utilisateur
      let url = `${API_URL}/taches`;
      if (selectedUtilisateur) {
        url = `${API_URL}/utilisateurs/${selectedUtilisateur}/taches`;
      }
      
      const response = await axios.get(url);
      
      // Réinitialiser les tableaux de tâches
      setTachesPersonnelles([]);
      setTachesProfessionnelles([]);
      
      // Vérifier si les données existent dans le format attendu
      if (response.data._embedded) {
        // Extraire les tâches personnelles
        if (response.data._embedded.tachePersonnelles) {
          setTachesPersonnelles(response.data._embedded.tachePersonnelles);
        }
        
        // Extraire les tâches professionnelles
        if (response.data._embedded.tacheProfessionnelles) {
          setTachesProfessionnelles(response.data._embedded.tacheProfessionnelles);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des tâches:', err);
      setError('Impossible de charger les tâches. Vérifiez que votre API Spring est en cours d\'exécution.');
    } finally {
      setLoading(false);
    }
  };

  // Extraire l'ID d'une URL
  const extractIdFromUrl = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  // Ajouter une nouvelle tâche
  const ajouterTache = async (e) => {
    e.preventDefault();
    
    try {
      const { type, ...tacheData } = nouvelleTache;
      
      // Ajouter l'utilisateur si sélectionné
      if (selectedUtilisateur) {
        tacheData.utilisateur = `/utilisateurs/${selectedUtilisateur}`;
      }
      
      // Déterminer l'endpoint en fonction du type de tâche
      const endpoint = type === 'personnelle' 
        ? `${API_URL}/tachePersonnelles` 
        : `${API_URL}/tacheProfessionnelles`;
      
      await axios.post(endpoint, tacheData);
      
      // Rafraîchir la liste des tâches après l'ajout
      fetchTaches();
      
      // Réinitialiser le formulaire
      setNouvelleTache({
        titre: '',
        description: '',
        statut: 'EN_COURS',
        priorite: 'BASSE',
        type: 'personnelle',
        utilisateur: null
      });
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la tâche:', err);
      setError('Impossible d\'ajouter la tâche.');
    }
  };

  // Le reste de vos fonctions existantes pour supprimer et mettre à jour les tâches...
  // (supprimerTache, toggleStatutTache, etc.)

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNouvelleTache({
      ...nouvelleTache,
      [name]: value,
    });
  };

  // Gérer le changement d'utilisateur sélectionné
  const handleUtilisateurChange = (e) => {
    setSelectedUtilisateur(e.target.value);
  };

  // Obtenir le nom complet d'un utilisateur par son ID
  const getUserNameById = (id) => {
    const utilisateur = utilisateurs.find(u => extractIdFromUrl(u._links.self.href) === id);
    return utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : 'Inconnu';
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Gestionnaire de Tâches</h1>
        
        <Link href="/utilisateurs" className={styles.userLink}>
          Gérer les utilisateurs →
        </Link>
        
        {error && <p className={styles.error}>{error}</p>}
        
        <div className={styles.filterSection}>
          <label htmlFor="utilisateur">Filtrer par utilisateur:</label>
          <select
            id="utilisateur"
            value={selectedUtilisateur}
            onChange={handleUtilisateurChange}
            className={styles.select}
          >
            <option value="">Tous les utilisateurs</option>
            {utilisateurs.map((utilisateur) => (
              <option 
                key={extractIdFromUrl(utilisateur._links.self.href)} 
                value={extractIdFromUrl(utilisateur._links.self.href)}
              >
                {utilisateur.prenom} {utilisateur.nom}
              </option>
            ))}
          </select>
          
          {selectedUtilisateur && (
            <button 
              onClick={() => setSelectedUtilisateur('')}
              className={styles.resetButton}
            >
              Réinitialiser le filtre
            </button>
          )}
        </div>
        
        <form onSubmit={ajouterTache} className={styles.form}>
          <input
            type="text"
            name="titre"
            placeholder="Titre de la tâche"
            value={nouvelleTache.titre}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={nouvelleTache.description}
            onChange={handleChange}
            className={styles.input}
          />
          
          <div className={styles.selectGroup}>
            <label htmlFor="priorite">Priorité:</label>
            <select
              name="priorite"
              id="priorite"
              value={nouvelleTache.priorite}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="BASSE">Basse</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="HAUTE">Haute</option>
            </select>
          </div>
          
          <div className={styles.selectGroup}>
            <label htmlFor="type">Type de tâche:</label>
            <select
              name="type"
              id="type"
              value={nouvelleTache.type}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="personnelle">Personnelle</option>
              <option value="professionnelle">Professionnelle</option>
            </select>
          </div>
          
          {!selectedUtilisateur && (
            <div className={styles.selectGroup}>
              <label htmlFor="tacheUtilisateur">Attribuer à:</label>
              <select
                name="utilisateur"
                id="tacheUtilisateur"
                value={nouvelleTache.utilisateur || ''}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">Aucun utilisateur</option>
                {utilisateurs.map((utilisateur) => (
                  <option 
                    key={extractIdFromUrl(utilisateur._links.self.href)} 
                    value={`/utilisateurs/${extractIdFromUrl(utilisateur._links.self.href)}`}
                  >
                    {utilisateur.prenom} {utilisateur.nom}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button type="submit" className={styles.button}>Ajouter</button>
        </form>
        
        {loading ? (
          <p>Chargement des tâches...</p>
        ) : (
          <div className={styles.tasksContainer}>
            {selectedUtilisateur && (
              <div className={styles.userInfo}>
                <h2>Tâches de {getUserNameById(selectedUtilisateur)}</h2>
              </div>
            )}
            
            <div className={styles.taskTypeSection}>
              <h2>Tâches Personnelles ({tachesPersonnelles.length})</h2>
              <ul className={styles.taskList}>
                {tachesPersonnelles.length === 0 ? (
                  <p>Aucune tâche personnelle trouvée.</p>
                ) : (
                  tachesPersonnelles.map(tache => (
                    <li key={extractIdFromUrl(tache._links.self.href)} 
                        className={`${styles.taskItem} ${tache.statut === 'TERMINE' ? styles.completed : ''}`}>
                      <div className={styles.taskContent}>
                        <h3>{tache.titre}</h3>
                        {tache.description && <p>{tache.description}</p>}
                        <div className={styles.taskMeta}>
                          <span className={styles.priorityTag} 
                                data-priority={tache.priorite.toLowerCase()}>
                            {tache.priorite}
                          </span>
                          <span>Statut: {tache.statut}</span>
                          {tache._links && tache._links.utilisateur && (
                            <span className={styles.assignedUser}>
                              Assignée à: {getUserNameById(extractIdFromUrl(tache._links.utilisateur.href))}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.taskActions}>
                        <button
                          onClick={() => toggleStatutTache(tache, 'personnelle')}
                          className={styles.toggleButton}
                        >
                          {tache.statut === 'TERMINE' ? 'Marquer comme en cours' : 'Marquer comme terminée'}
                        </button>
                        <button
                          onClick={() => supprimerTache(tache._links.self.href, 'personnelle')}
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
            
            <div className={styles.taskTypeSection}>
              <h2>Tâches Professionnelles ({tachesProfessionnelles.length})</h2>
              <ul className={styles.taskList}>
                {tachesProfessionnelles.length === 0 ? (
                  <p>Aucune tâche professionnelle trouvée.</p>
                ) : (
                  tachesProfessionnelles.map(tache => (
                    <li key={extractIdFromUrl(tache._links.self.href)} 
                        className={`${styles.taskItem} ${tache.statut === 'TERMINE' ? styles.completed : ''}`}>
                      <div className={styles.taskContent}>
                        <h3>{tache.titre}</h3>
                        {tache.description && <p>{tache.description}</p>}
                        <div className={styles.taskMeta}>
                          <span className={styles.priorityTag} 
                                data-priority={tache.priorite.toLowerCase()}>
                            {tache.priorite}
                          </span>
                          {tache.projet && <span>Projet: {tache.projet}</span>}
                          {tache.client && <span>Client: {tache.client}</span>}
                          <span>Facturable: {tache.facturable ? 'Oui' : 'Non'}</span>
                          <span>Statut: {tache.statut}</span>
                          {tache._links && tache._links.utilisateur && (
                            <span className={styles.assignedUser}>
                              Assignée à: {getUserNameById(extractIdFromUrl(tache._links.utilisateur.href))}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.taskActions}>
                        <button
                          onClick={() => toggleStatutTache(tache, 'professionnelle')}
                          className={styles.toggleButton}
                        >
                          {tache.statut === 'TERMINE' ? 'Marquer comme en cours' : 'Marquer comme terminée'}
                        </button>
                        <button
                          onClick={() => supprimerTache(tache._links.self.href, 'professionnelle')}
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
          </div>
        )}
      </main>
    </div>
  );
}