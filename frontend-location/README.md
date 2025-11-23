# Frontend Location - Application de Gestion de Location de Véhicules

## Description

Application frontend React pour la gestion d'un système de location de véhicules. Cette application permet de gérer les clients, véhicules et réservations avec une interface utilisateur moderne et responsive.

## Technologies Utilisées

- **React 19.2.0** - Bibliothèque frontend
- **Vite 7.2.4** - Outil de build moderne et rapide
- **React Router DOM 7.9.6** - Navigation côté client
- **React Bootstrap 2.10.10** - Composants UI
- **Bootstrap 5.3.8** - Framework CSS
- **Lucide React 0.554.0** - Icônes
- **Axios 1.13.2** - Client HTTP pour les appels API

## Fonctionnalités

### 📊 Tableau de Bord
- Vue d'ensemble des statistiques
- Réservations récentes
- Activités récentes
- Métriques en temps réel

### 👥 Gestion des Clients
- Ajout, modification et suppression de clients
- Recherche et filtrage
- Pagination des résultats
- Validation des formulaires

### 🚗 Gestion des Véhicules
- Gestion complète de la flotte de véhicules
- Interface en cartes responsive
- Filtrage par marque, modèle ou matricule
- Gestion des statuts de disponibilité

### 📅 Gestion des Réservations
- Création et suivi des réservations
- Gestion des statuts (En attente, Confirmée, Terminée, Annulée)
- Attribution des véhicules aux clients
- Suivi des périodes de location

## Installation et Démarrage

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

3. **Accéder à l'application**
   Ouvrir [http://localhost:5173](http://localhost:5173) dans votre navigateur

## Scripts Disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run lint     # Vérification du code
npm run preview  # Prévisualiser la build
```

## Configuration Backend

L'application communique avec une API backend sur `http://localhost:8080/api`.
Assurez-vous que votre serveur Spring Boot est démarré.

## Structure du Projet

```
src/
├── components/layout/  # Composants de mise en page
├── pages/             # Pages principales (Dashboard, Clients, Véhicules, Réservations)  
├── services/          # Services pour appels API
└── assets/           # Ressources statiques
```

## Corrections Apportées

✅ **Erreurs ESLint corrigées**
- Variables `err` inutilisées dans les blocs catch
- Composant `StatCard` déplacé hors du render

✅ **Pages complètes créées**
- Dashboard avec statistiques et graphiques
- Gestion des véhicules avec interface en cartes
- Gestion des réservations avec statuts

✅ **Styles améliorés**
- CSS responsive pour mobile/desktop  
- Sidebar avec overlay sur mobile
- Interface Bootstrap moderne

✅ **Navigation fonctionnelle**
- Toutes les routes implémentées
- Navigation latérale responsive
- Breadcrumbs et indicateurs

## ✅ Intégration API Complète

L'application frontend est maintenant entièrement intégrée avec le backend Spring Boot :

### 🔌 Services API

- **`clientService.js`** - CRUD complet pour les clients
- **`vehiculeService.js`** - Gestion des véhicules avec disponibilité
- **`reservationService.js`** - Création de réservations

### 🎯 Pages Connectées

- **Dashboard** - Statistiques en temps réel depuis l'API
- **Clients** - Données dynamiques avec CRUD complet
- **Véhicules** - Flotte gérée via l'API backend
- **Réservations** - Création de nouvelles réservations

### ⚙️ Configuration

L'URL de l'API est configurée dans le fichier `.env` :
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 🚀 Démarrage avec Backend

1. **Démarrer le backend Spring Boot** sur le port 8080
2. **Démarrer le frontend** : `npm run dev`
3. L'application chargera automatiquement les vraies données
