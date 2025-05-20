# MERN E-commerce Platform

Une plateforme e-commerce moderne construite avec la pile MERN (MongoDB, Express.js, React.js, Node.js).

## Fonctionnalités

- Authentification des utilisateurs (inscription, connexion, gestion de profil)
- Catalogue de produits avec recherche et filtrage
- Panier d'achat
- Processus de paiement sécurisé
- Interface d'administration
- Design responsive

## Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)
- MongoDB (local ou MongoDB Atlas)

## Installation

1. Cloner le repository :
```bash
git clone https://github.com/alexkoffi2004/checkpoint_Ecommerce.git
cd mern-ecommerce
```

2. Installer les dépendances :
```bash
npm run install:all
```

3. Configuration de l'environnement :
   - Créer un fichier `.env` dans le dossier `backend` basé sur `.env.example`
   - Configurer les variables d'environnement nécessaires

4. Démarrer l'application :
```bash
npm start
```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- Backend : http://localhost:5000

## Structure du Projet

```
mern-ecommerce/
├── backend/           # Serveur Node.js/Express
│   ├── config/       # Configuration
│   ├── controllers/  # Contrôleurs
│   ├── models/       # Modèles Mongoose
│   ├── routes/       # Routes API
│   └── middleware/   # Middleware personnalisé
│
├── frontend/         # Application React
│   ├── public/       # Fichiers statiques
│   ├── src/          # Code source React
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
│
└── package.json      # Configuration du monorepo
```

## Technologies Utilisées

### Backend
- Node.js
- Express.js
- MongoDB avec Mongoose
- JWT pour l'authentification
- bcrypt pour le hachage des mots de passe
- Express Validator pour la validation
- Multer pour la gestion des fichiers

### Frontend
- React.js
- React Router pour la navigation
- Context API pour la gestion d'état
- Axios pour les requêtes HTTP
- Material-UI pour l'interface utilisateur
- React Query pour la gestion des données
- Formik & Yup pour la validation des formulaires

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

# Author

Alex KOffi

## preview link website

```
https://cute-kitten-7ff22d.netlify.app/
```

## Email Address

```
kouadiojeanalexkoffi@gmail.com
```
