# BodyBud Web Application

Application web BodyBud construite avec Nuxt 4, Vue 3 et Vuetify.

## Technologies

- **Nuxt 4** - Framework Vue.js full-stack
- **Vue 3** - Framework JavaScript progressif
- **Vuetify** - Bibliothèque de composants Material Design
- **TypeScript** - Typage statique
- **Pinia** - Gestion d'état
- **SCSS** - Préprocesseur CSS
- **pnpm** - Gestionnaire de paquets rapide

## Prérequis

- Node.js (version 18 ou supérieure)
- pnpm (recommandé)

## Installation

Installez les dépendances avec pnpm :

```bash
pnpm install
```

## Développement

Lancez le serveur de développement sur `http://localhost:3000` :

```bash
pnpm dev
```

## Scripts disponibles

```bash
# Démarrer le serveur de développement
pnpm dev

# Construire l'application pour la production
pnpm build

# Prévisualiser la build de production
pnpm preview

# Générer l'application statique
pnpm generate

# Linter le code
pnpm lint

# Corriger automatiquement les problèmes de lint
pnpm lint:fix
```

## Structure du projet

```
bodybudwebapp/
├── src/
│   ├── assets/          # Ressources statiques (CSS, images)
│   ├── components/      # Composants Vue réutilisables
│   ├── composables/     # Composables Vue et logique API
│   ├── layouts/         # Layouts d'application
│   ├── middleware/      # Middleware de routage
│   ├── pages/          # Pages et routes de l'application
│   ├── plugins/        # Plugins Nuxt (Vuetify, API)
│   ├── store/          # Store Pinia
│   ├── types/          # Types TypeScript
│   └── app.vue         # Composant racine
├── public/             # Fichiers publics statiques
└── nuxt.config.ts      # Configuration Nuxt
```

## Pages

- `/` - Page d'accueil
- `/dashboard` - Tableau de bord
- `/user/[id]` - Profil utilisateur dynamique

## API

Les composables API sont organisés dans `src/composables/api/` pour gérer les appels vers le backend.

## AI Development Guidelines (GitHub Copilot)

Ce projet utilise **GitHub Copilot** avec des instructions personnalisées pour guider le développement.

Les instructions sont organisées dans le dossier `.github/`:

- `.github/copilot-instructions.md` - Instructions principales du projet (lues automatiquement)
- `.github/instructions/vue-components.md` - Bonnes pratiques pour les composants Vue
- `.github/instructions/vue-composables.md` - Conventions pour les composables Nuxt
- `.github/instructions/vue-pages.md` - Règles de routage et structure des pages
- `.github/instructions/vue-store.md` - Gestion d'état avec Pinia

### Utilisation dans Copilot

Les instructions principales sont automatiquement lues. Pour utiliser les instructions spécifiques par domaine, référencez-les avec `#` dans le chat Copilot :

```
# #vue-components Crée un composant carte utilisateur avec Vuetify
# #vue-store Crée un store Pinia pour gérer les workouts
```

Pour plus de détails, consultez `.github/README.md`.

## Documentation

## Documentation References

- [Nuxt 4](https://nuxt.com/docs)
- [Vue 3](https://vuejs.org/)
- [Vuetify](https://vuetifyjs.com/)
- [Pinia](https://pinia.vuejs.org/)
