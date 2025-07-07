# Le Banc - Réseau Social des Bancs

Le Banc est un réseau social permettant aux utilisateurs de partager et découvrir des bancs avec leur géolocalisation.

## Structure du projet

```
frontend/
├── app/
│   ├── api/auth/          # API routes d'authentification
│   ├── auth/              # Pages d'authentification
│   ├── dashboard/         # Dashboard utilisateur
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/ui/         # Composants UI réutilisables
├── lib/                   # Utilitaires et configuration
├── prisma/               # Schéma de base de données
└── types/                # Types TypeScript
```

## Configuration requise

1. **Base de données PostgreSQL**
   - Créer une base de données nommée `lebanc`
   - Modifier l'URL de connexion dans `.env.local`

2. **Variables d'environnement**
   - Copier et modifier `.env.local` avec vos valeurs

3. **Initialisation de la base de données**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Démarrage

```bash
npm install
npm run dev
```

## Fonctionnalités implémentées

✅ **Authentification**
- Inscription/connexion avec email/mot de passe
- Session management avec NextAuth.js
- Protection des routes

✅ **Base de données**
- Modèles User, Bench, Like, Comment
- Relations entre entités
- Indexation géospatiale

✅ **Interface utilisateur**
- Page d'accueil attractive
- Formulaires d'authentification
- Dashboard utilisateur de base
- Composants UI réutilisables

## Prochaines étapes

🔄 **À développer**
- Upload et gestion d'images
- Carte interactive avec géolocalisation
- CRUD complet des bancs
- Système de recherche et filtres
- Interface mobile optimisée

## Technologies utilisées

- **Framework**: Next.js 15 avec App Router
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: NextAuth.js
- **UI**: Tailwind CSS
- **Validation**: Zod
- **Formulaires**: React Hook Form

## Architecture

Le projet utilise l'architecture moderne de Next.js avec:
- Server Components pour la performance
- Client Components pour l'interactivité
- API Routes pour les endpoints backend
- Middleware pour la protection des routes