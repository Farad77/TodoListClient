'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './page.module.css';

const API_URL = 'http://localhost:8080';

export default function Home() {
  const [tachesPersonnelles, setTachesPersonnelles] = useState([]);
  const [tachesProfessionnelles, setTachesProfessionnelles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nouvelleTache, setNouvelleTache] = useState({
    titre: '',
    description: '',
    statut: 'EN_COURS',
    priorite: 'BASSE',
    type: 'personnelle', // pour savoir quel type de tâche créer
  });

  // Récupérer toutes les tâches
  useEffect(() => {
    fetchTaches();
  }, []);

  const fetchTaches = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/taches`);
      
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
      
      // Déterminer l'endpoint en fonction du type de tâche
      const endpoint = type === 'personnelle' 
        ? `${API_URL}/tachePersonnelles` 
        : `${API_URL}/tacheProfessionnelles`;
      
      const response = await axios.post(endpoint, tacheData);
      
      // Rafraîchir la liste des tâches après l'ajout
      fetchTaches();
      
      // Réinitialiser le formulaire
      setNouvelleTache({
        titre: '',
        description: '',
        statut: 'EN_COURS',
        priorite: 'BASSE',
        type: 'personnelle',
      });
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la tâche:', err);
      setError('Impossible d\'ajouter la tâche.');
    }
  };

  // Supprimer une tâche
  const supprimerTache = async (url, type) => {
    try {
      await axios.delete(url);
      
      // Mettre à jour l'état en fonction du type de tâche
      if (type === 'personnelle') {
        setTachesPersonnelles(tachesPersonnelles.filter(tache => 
          tache._links.self.href !== url
        ));
      } else {
        setTachesProfessionnelles(tachesProfessionnelles.filter(tache => 
          tache._links.self.href !== url
        ));
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de la tâche:', err);
      setError('Impossible de supprimer la tâche.');
    }
  };

  // Mettre à jour une tâche (changer le statut)
  const toggleStatutTache = async (tache, type) => {
    try {
      // Déterminer le nouveau statut
      const nouveauStatut = tache.statut === 'EN_COURS' ? 'TERMINE' : 'EN_COURS';
      
      // Créer une copie de la tâche avec le statut mis à jour
      const tacheModifiee = { ...tache, statut: nouveauStatut };
      
      // Envoyer la mise à jour à l'API
      const url = tache._links.self.href;
      await axios.put(url, tacheModifiee);
      
      // Mettre à jour l'état en fonction du type de tâche
      if (type === 'personnelle') {
        setTachesPersonnelles(tachesPersonnelles.map(t => 
          t._links.self.href === url ? { ...t, statut: nouveauStatut } : t
        ));
      } else {
        setTachesProfessionnelles(tachesProfessionnelles.map(t => 
          t._links.self.href === url ? { ...t, statut: nouveauStatut } : t
        ));
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la tâche:', err);
      setError('Impossible de mettre à jour la tâche.');
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNouvelleTache({
      ...nouvelleTache,
      [name]: value,
    });
  };

  // Combiner les tâches personnelles et professionnelles pour l'affichage
  const allTaches = [
    ...tachesPersonnelles.map(tache => ({ ...tache, type: 'personnelle' })),
    ...tachesProfessionnelles.map(tache => ({ ...tache, type: 'professionnelle' }))
  ];

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Gestionnaire de Tâches</h1>
        
        {error && <p className={styles.error}>{error}</p>}
        
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
          
          <button type="submit" className={styles.button}>Ajouter</button>
        </form>
        
        {loading ? (
          <p>Chargement des tâches...</p>
        ) : (
          <div className={styles.tasksContainer}>
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