# IA Tamilo - Matchmaker Backend

Backend API pour un système de matching amoureux basé sur l'IA avec deux modes :
- **MVP** : Analyse directe de compatibilité entre deux profils
- **Agents** : Simulation de conversation entre agents IA représentant chaque personne

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos vraies valeurs

# Générer le client Prisma
npm run prisma:generate

# Créer la base de données et appliquer les migrations
npm run prisma:migrate

# (Optionnel) Remplir avec des données de test
npm run prisma:seed
```

## 🏃 Démarrage

```bash
# Mode production
npm start

# Mode développement (auto-reload)
npm run dev
```

Le serveur démarre sur `http://localhost:3000` (ou le port défini dans `.env`)

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Matching MVP (analyse directe)
```bash
POST /match/mvp
Content-Type: application/json

{
  "userAId": "uuid-user-a",
  "userBId": "uuid-user-b"
}
```

### Matching avec Agents (conversation simulée)
```bash
POST /match/agents
Content-Type: application/json

{
  "userAId": "uuid-user-a",
  "userBId": "uuid-user-b"
}
```

### Regénérer le résumé d'agent
```bash
POST /agents/rebuild/:userId
```

## 🗄️ Base de données

Utilisez Prisma Studio pour gérer vos données :
```bash
npm run prisma:studio
```

## 📋 Structure du projet

```
ia-tamilo/
├── prisma/
│   ├── schema.prisma       # Schéma de base de données
│   └── seed.js             # Données de test
├── src/
│   ├── config/
│   │   └── prompts.js      # Tous les prompts IA
│   ├── services/
│   │   ├── aiClient.js     # Client OpenAI
│   │   └── matchService.js # Logique de matching
│   ├── routes/
│   │   └── matchRoutes.js  # Routes Express
│   ├── db.js               # Connexion Prisma
│   └── index.js            # Point d'entrée
├── .env                    # Configuration (à créer)
├── .env.example            # Template de configuration
└── package.json
```

## 🧠 Modèle IA

Par défaut, le système utilise `gpt-4-turbo-preview`. Vous pouvez changer le modèle dans `.env`.

## 🔑 Critères de compatibilité

Le système évalue la compatibilité selon les critères d'Hélène :

**Non négociables** (priorité absolue) :
- Respect absolu
- Loyauté et transparence
- Ambition claire
- Intelligence émotionnelle
- Stabilité émotionnelle
- Respect de la culture
- Douceur avec les enfants

**Sans importance** (jamais pénalisants) :
- Physique
- Richesse/statut
- Style vestimentaire
- Origine ethnique
# tamilo-backend
