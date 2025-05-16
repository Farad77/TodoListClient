'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css'; // Assurez-vous que le chemin est correct

const API_URL = 'http://localhost:8080';

export default function Home() {
  const [tachesPersonnelles, setTachesPersonnelles] = useState([]);
  const [tachesProfessionnelles, setTachesProfessionnelles] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [selectedUtilisateur, setSelectedUtilisateur] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nouvelleTache, setNouvelleTache] = useState({
    titre: '',
    description: '',
    statut: 'EN_COURS',
    priorite: 'BASSE',
    type: 'personnelle',
    utilisateur: null
  });
  
  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    terminees: 0,
    enCours: 0,
    hautePriorite: 0
  });
  
  const searchParams = useSearchParams();
  const utilisateurIdParam = searchParams ? searchParams.get('utilisateur') : null;
  
  useEffect(() => {
    fetchUtilisateurs();
  }, []);
  
  useEffect(() => {
    if (utilisateurIdParam) {
      setSelectedUtilisateur(utilisateurIdParam);
    }
  }, [utilisateurIdParam]);
  
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
      let url = `${API_URL}/taches`;
      if (selectedUtilisateur) {
        url = `${API_URL}/utilisateurs/${selectedUtilisateur}/taches`;
      }
      
      const response = await axios.get(url);
      
      setTachesPersonnelles([]);
      setTachesProfessionnelles([]);
      
      if (response.data._embedded) {
        if (response.data._embedded.tachePersonnelles) {
          setTachesPersonnelles(response.data._embedded.tachePersonnelles);
        }
        
        if (response.data._embedded.tacheProfessionnelles) {
          setTachesProfessionnelles(response.data._embedded.tacheProfessionnelles);
        }
      }

      // Calculer les statistiques
      const allTaches = [
        ...(response.data._embedded?.tachePersonnelles || []),
        ...(response.data._embedded?.tacheProfessionnelles || [])
      ];
      
      setStats({
        total: allTaches.length,
        terminees: allTaches.filter(t => t.statut === 'TERMINE').length,
        enCours: allTaches.filter(t => t.statut === 'EN_COURS').length,
        hautePriorite: allTaches.filter(t => t.priorite === 'HAUTE').length
      });
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des tâches:', err);
      setError('Impossible de charger les tâches.');
    } finally {
      setLoading(false);
    }
  };

  const ajouterTache = async (e) => {
    e.preventDefault();
    
    try {
      const { type, ...tacheData } = nouvelleTache;
      
      if (selectedUtilisateur) {
        tacheData.utilisateur = `/utilisateurs/${selectedUtilisateur}`;
      }
      
      const endpoint = type === 'personnelle' 
        ? `${API_URL}/tachePersonnelles` 
        : `${API_URL}/tacheProfessionnelles`;
      
      await axios.post(endpoint, tacheData);
      
      fetchTaches();
      
      setNouvelleTache({
        titre: '',
        description: '',
        statut: 'EN_COURS',
        priorite: 'BASSE',
        type: 'personnelle',
        utilisateur: null
      });
      
      setShowModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la tâche:', err);
      setError('Impossible d\'ajouter la tâche.');
    }
  };

  const supprimerTache = async (url, type) => {
    try {
      await axios.delete(url);
      
      if (type === 'personnelle') {
        setTachesPersonnelles(tachesPersonnelles.filter(tache => 
          tache._links.self.href !== url
        ));
      } else {
        setTachesProfessionnelles(tachesProfessionnelles.filter(tache => 
          tache._links.self.href !== url
        ));
      }
      
      // Mettre à jour les statistiques
      fetchTaches();
    } catch (err) {
      console.error('Erreur lors de la suppression de la tâche:', err);
      setError('Impossible de supprimer la tâche.');
    }
  };

  const toggleStatutTache = async (tache, type) => {
    try {
      const nouveauStatut = tache.statut === 'EN_COURS' ? 'TERMINE' : 'EN_COURS';
      const tacheModifiee = { ...tache, statut: nouveauStatut };
      
      const url = tache._links.self.href;
      await axios.put(url, tacheModifiee);
      
      if (type === 'personnelle') {
        setTachesPersonnelles(tachesPersonnelles.map(t => 
          t._links.self.href === url ? { ...t, statut: nouveauStatut } : t
        ));
      } else {
        setTachesProfessionnelles(tachesProfessionnelles.map(t => 
          t._links.self.href === url ? { ...t, statut: nouveauStatut } : t
        ));
      }
      
      // Mettre à jour les statistiques
      fetchTaches();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la tâche:', err);
      setError('Impossible de mettre à jour la tâche.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNouvelleTache({
      ...nouvelleTache,
      [name]: value,
    });
  };

  const handleUtilisateurChange = (e) => {
    setSelectedUtilisateur(e.target.value);
  };

  const extractIdFromUrl = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const getUserById = (id) => {
    const utilisateur = utilisateurs.find(u => extractIdFromUrl(u._links.self.href) === id);
    return utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : 'Inconnu';
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Link href="/" className={`${styles.sidebarItem}`}>
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
        <h1 className={styles.pageTitle}>Gestion des Tâches</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statCardBlue}`}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>📊</div>
            <div className={styles.statContent}>
              <h2 className={styles.statValue}>{stats.total}</h2>
              <p className={styles.statLabel}>Total des tâches</p>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statCardGreen}`}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>✓</div>
            <div className={styles.statContent}>
              <h2 className={styles.statValue}>{stats.terminees}</h2>
              <p className={styles.statLabel}>Tâches terminées</p>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statCardOrange}`}>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}>⏳</div>
            <div className={styles.statContent}>
              <h2 className={styles.statValue}>{stats.enCours}</h2>
              <p className={styles.statLabel}>Tâches en cours</p>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statCardRed}`}>
            <div className={`${styles.statIcon} ${styles.statIconRed}`}>🔥</div>
            <div className={styles.statContent}>
              <h2 className={styles.statValue}>{stats.hautePriorite}</h2>
              <p className={styles.statLabel}>Haute priorité</p>
            </div>
          </div>
        </div>
        
        <div className={styles.filterGroup}>
          <label htmlFor="utilisateur" className={styles.filterLabel}>Utilisateur:</label>
          <select
            id="utilisateur"
            value={selectedUtilisateur}
            onChange={handleUtilisateurChange}
            className={styles.filterSelect}
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
        </div>
        
        <button 
          className={styles.addButton}
          onClick={() => setShowModal(true)}
        >
          <span className={styles.addIcon}>+</span>
          Ajouter une tâche
        </button>
        
        {loading ? (
          <p>Chargement des tâches...</p>
        ) : (
          <>
            <div className={styles.taskSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Tâches Personnelles</h2>
              </div>
              
              <ul className={styles.taskList}>
                {tachesPersonnelles.length === 0 ? (
                  <li className={styles.taskItem}>Aucune tâche personnelle trouvée.</li>
                ) : (
                  tachesPersonnelles.map(tache => (
                    <li key={extractIdFromUrl(tache._links.self.href)} className={styles.taskItem}>
                      <h3 className={styles.taskTitle}>{tache.titre}</h3>
                      {tache.description && <p>{tache.description}</p>}
                      
                      <div className={styles.taskMeta}>
                        <span className={`${styles.statusTag} ${tache.statut === 'TERMINE' ? styles.statusComplete : styles.statusPending}`}>
                          {tache.statut === 'TERMINE' ? 'Terminée' : 'En cours'}
                        </span>
                        
                        <span className={`${styles.priorityTag} ${
                          tache.priorite === 'HAUTE' ? styles.priorityHigh : 
                          tache.priorite === 'MOYENNE' ? styles.priorityMedium : 
                          styles.priorityLow
                        }`}>
                          {tache.priorite === 'HAUTE' ? 'Priorité haute' : 
                           tache.priorite === 'MOYENNE' ? 'Priorité moyenne' : 
                           'Priorité basse'}
                        </span>
                        
                        {tache._links && tache._links.utilisateur && (
                          <span>
                            Assignée à: {getUserById(extractIdFromUrl(tache._links.utilisateur.href))}
                          </span>
                        )}
                      </div>
                      
                      <div className={styles.taskActions}>
                        <button
                          onClick={() => toggleStatutTache(tache, 'personnelle')}
                          className={`${styles.actionButton} ${styles.completeButton}`}
                        >
                          {tache.statut === 'TERMINE' ? 'Marquer comme en cours' : 'Marquer comme terminée'}
                        </button>
                        <button
                          onClick={() => supprimerTache(tache._links.self.href, 'personnelle')}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          Supprimer
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
            
            <div className={styles.taskSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Tâches Professionnelles</h2>
              </div>
              
              <ul className={styles.taskList}>
                {tachesProfessionnelles.length === 0 ? (
                  <li className={styles.taskItem}>Aucune tâche professionnelle trouvée.</li>
                ) : (
                  tachesProfessionnelles.map(tache => (
                    <li key={extractIdFromUrl(tache._links.self.href)} className={styles.taskItem}>
                      <h3 className={styles.taskTitle}>{tache.titre}</h3>
                      {tache.description && <p>{tache.description}</p>}
                      
                      <div className={styles.taskMeta}>
                        <span className={`${styles.statusTag} ${tache.statut === 'TERMINE' ? styles.statusComplete : styles.statusPending}`}>
                          {tache.statut === 'TERMINE' ? 'Terminée' : 'En cours'}
                        </span>
                        
                        <span className={`${styles.priorityTag} ${
                          tache.priorite === 'HAUTE' ? styles.priorityHigh : 
                          tache.priorite === 'MOYENNE' ? styles.priorityMedium : 
                          styles.priorityLow
                        }`}>
                          {tache.priorite === 'HAUTE' ? 'Priorité haute' : 
                           tache.priorite === 'MOYENNE' ? 'Priorité moyenne' : 
                           'Priorité basse'}
                        </span>
                        
                        {tache.projet && <span>Projet: {tache.projet}</span>}
                        {tache.client && <span>Client: {tache.client}</span>}
                        <span>Facturable: {tache.facturable ? 'Oui' : 'Non'}</span>
                        
                        {tache._links && tache._links.utilisateur && (
                          <span>
                            Assignée à: {getUserById(extractIdFromUrl(tache._links.utilisateur.href))}
                          </span>
                        )}
                      </div>
                      
                      <div className={styles.taskActions}>
                        <button
                          onClick={() => toggleStatutTache(tache, 'professionnelle')}
                          className={`${styles.actionButton} ${styles.completeButton}`}
                        >
                          {tache.statut === 'TERMINE' ? 'Marquer comme en cours' : 'Marquer comme terminée'}
                        </button>
                        <button
                          onClick={() => supprimerTache(tache._links.self.href, 'professionnelle')}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          Supprimer
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        )}
      </div>
      
      {/* Modal d'ajout de tâche */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Ajouter une nouvelle tâche</h2>
              <button 
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <form onSubmit={ajouterTache}>
                <div className={styles.formGroup}>
                  <label htmlFor="titre" className={styles.label}>Titre</label>
                  <input
                    type="text"
                    id="titre"
                    name="titre"
                    value={nouvelleTache.titre}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="description" className={styles.label}>Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={nouvelleTache.description}
                    onChange={handleChange}
                    className={styles.textarea}
                  ></textarea>
                </div>
                
                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${styles.formCol}`}>
                    <label htmlFor="priorite" className={styles.label}>Priorité</label>
                    <select
                      id="priorite"
                      name="priorite"
                      value={nouvelleTache.priorite}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="BASSE">Basse</option>
                   
                        <option value="MOYENNE">Moyenne</option>
                      <option value="HAUTE">Haute</option>
                    </select>
                  </div>
                  
                  <div className={`${styles.formGroup} ${styles.formCol}`}>
                    <label htmlFor="type" className={styles.label}>Type de tâche</label>
                    <select
                      id="type"
                      name="type"
                      value={nouvelleTache.type}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="personnelle">Personnelle</option>
                      <option value="professionnelle">Professionnelle</option>
                    </select>
                  </div>
                </div>
                
                {!selectedUtilisateur && (
                  <div className={styles.formGroup}>
                    <label htmlFor="utilisateur" className={styles.label}>Attribuer à</label>
                    <select
                      id="utilisateur"
                      name="utilisateur"
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
                
                {nouvelleTache.type === 'professionnelle' && (
                  <>
                    <div className={styles.formRow}>
                      <div className={`${styles.formGroup} ${styles.formCol}`}>
                        <label htmlFor="projet" className={styles.label}>Projet</label>
                        <input
                          type="text"
                          id="projet"
                          name="projet"
                          value={nouvelleTache.projet || ''}
                          onChange={handleChange}
                          className={styles.input}
                        />
                      </div>
                      
                      <div className={`${styles.formGroup} ${styles.formCol}`}>
                        <label htmlFor="client" className={styles.label}>Client</label>
                        <input
                          type="text"
                          id="client"
                          name="client"
                          value={nouvelleTache.client || ''}
                          onChange={handleChange}
                          className={styles.input}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="facturable"
                          checked={nouvelleTache.facturable || false}
                          onChange={(e) => setNouvelleTache({
                            ...nouvelleTache,
                            facturable: e.target.checked
                          })}
                        />
                        Facturable
                      </label>
                    </div>
                  </>
                )}
                
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