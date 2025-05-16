# Gestionnaire de Tâches avec Next.js et Spring Boot

Cette application est un gestionnaire de tâches personnelles et professionnelles utilisant Next.js pour le frontend et consommant une API REST Spring Boot.

## Prérequis

- Node.js (v16.0.0 ou plus récent)
- npm (v7.0.0 ou plus récent)
- API Spring Boot en cours d'exécution sur http://localhost:8080

## Installation

1. Clonez ce dépôt ou téléchargez les fichiers source

2. Installez les dépendances :

```bash
npm install
```

3. Si vous rencontrez une erreur concernant `@babel/runtime/regenerator`, installez les dépendances supplémentaires nécessaires :

```bash
npm install --save @babel/runtime regenerator-runtime
```

## Démarrage de l'application

### Lancer en mode développement

Pour démarrer l'application en mode développement :

```bash
npm run dev
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

### Construire pour la production

Pour construire l'application pour la production :

```bash
npm run build
```

Cette commande génère une version optimisée de l'application dans le dossier `.next`.

### Lancer en mode production

Après avoir construit l'application, vous pouvez la démarrer en mode production :

```bash
npm run start
```

## Fonctionnalités

Cette application permet de :

- Visualiser les tâches personnelles et professionnelles
- Ajouter de nouvelles tâches (personnelles ou professionnelles)
- Modifier le statut des tâches (En cours / Terminé)
- Supprimer des tâches
- Définir des priorités (Basse / Moyenne / Haute)

## Structure de l'API

L'application est conçue pour fonctionner avec une API Spring Boot exposant les endpoints suivants :

- `GET /taches` - Récupère toutes les tâches (personnelles et professionnelles)
- `POST /tachePersonnelles` - Crée une nouvelle tâche personnelle
- `POST /tacheProfessionnelles` - Crée une nouvelle tâche professionnelle
- `PUT /tachePersonnelles/{id}` - Met à jour une tâche personnelle existante
- `PUT /tacheProfessionnelles/{id}` - Met à jour une tâche professionnelle existante
- `DELETE /tachePersonnelles/{id}` - Supprime une tâche personnelle
- `DELETE /tacheProfessionnelles/{id}` - Supprime une tâche professionnelle

## Résolution des problèmes courants

### Erreur "turbo.createProject" is not supported by the wasm bindings

Si vous rencontrez cette erreur, essayez l'une des solutions suivantes :

1. Installez les dépendances Babel nécessaires :
```bash
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader
npm install --save @babel/runtime regenerator-runtime
```

2. Créez un fichier `.babelrc` à la racine du projet avec le contenu suivant :
```json
{
  "presets": ["next/babel"]
}
```

3. Utilisez un fichier `next.config.js` minimaliste :
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
```

### Erreur CORS

Si vous rencontrez des erreurs CORS lors de l'accès à l'API Spring Boot, assurez-vous que votre backend autorise les requêtes provenant de votre application Next.js. Voici un exemple de configuration à ajouter dans votre application Spring Boot :

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }


     @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");  // Utilisez addAllowedOriginPattern au lieu de addAllowedOrigin
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

## Variables d'environnement

Pour personnaliser l'URL de l'API, vous pouvez définir des variables d'environnement :

1. Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :
```
NEXT_PUBLIC_API_URL=http://votre-api.com
```

2. Modifiez la ligne de code dans `app/page.js` ou `pages/index.js` :
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
```

## Architecture du projet

- `app/page.js` ou `pages/index.js` - Composant principal de l'application
- `app/page.module.css` ou `styles/Home.module.css` - Styles CSS modulaires
- `next.config.js` - Configuration de Next.js
- `package.json` - Dépendances et scripts npm

## Développement futur

Pour améliorer cette application, vous pourriez envisager :

- Ajouter l'authentification des utilisateurs
- Implémenter des filtres et des recherches de tâches
- Ajouter des tableaux de bord et des statistiques
- Implémenter des notifications pour les tâches avec dates d'échéance
- Ajouter un système de catégories et d'étiquettes

## Licence

[MIT](LICENSE)

---

N'hésitez pas à contribuer à ce projet en soumettant des pull requests ou en signalant des problèmes !
