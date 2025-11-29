# IA Tamilo - Matchmaker Backend

Backend API pour un système de matching amoureux basé sur l'IA avec **architecture multi-agents**.

## 🎯 Modes de matching disponibles

### 🚀 **Multi-Agents V2** (NOUVEAU - RECOMMANDÉ)
Architecture avancée avec 4 agents spécialisés travaillant en parallèle :
- **Agent Profil** : Analyse psychologique et émotionnelle
- **Agent Valeurs** : Compatibilité des valeurs et modes de vie
- **Agent Projection** : Projets de vie à long terme
- **Agent Risques** : Détection de red flags et risques

→ **[Documentation complète](./docs/MULTI_AGENT_ARCHITECTURE.md)**

### 📊 **Modes Legacy** (toujours disponibles)
- **MVP** : Analyse directe de compatibilité
- **Agents V1** : Conversation simulée entre agents IA

---

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

---

## 📡 API Endpoints

### ✅ Health Check
```bash
GET /health
```

---

### 🚀 **Matching Multi-Agents V2** (NOUVEAU)
**Architecture avec 4 agents spécialisés + orchestrateur**

```bash
POST /match/multi-agents
Content-Type: application/json

{
  "userAId": "550e8400-e29b-41d4-a716-446655440001",
  "userBId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Réponse structurée :**
```json
{
  "success": true,
  "result": {
    "userA": { "id": "...", "name": "Sophie Dubois" },
    "userB": { "id": "...", "name": "Ravi Kumar" },
    "agents": {
      "profil": {
        "score_profil": 78,
        "resume": "...",
        "points_forts": [...],
        "points_de_vigilance": [...]
      },
      "valeurs": { "score_valeurs": 78, ... },
      "projection": { "score_projection": 75, ... },
      "risques": { "score_risques": 75, ... }
    },
    "verdict": {
      "verdict": "MATCH",
      "score_global": 76.5,
      "resume_executif": "...",
      "forces_majeures": [...],
      "defis_principaux": [...],
      "recommandation": "..."
    },
    "meta": {
      "duration_seconds": "12.65",
      "mode": "MULTI_AGENT_V2"
    }
  }
}
```

**Temps d'exécution :** ~12-15 secondes (4 agents en parallèle)

---

### 🧠 **Memory Layer** (NOUVEAU)
**Génère ou met à jour le résumé psychologique d'un utilisateur**

```bash
POST /memory/update/:userId
```

**Réponse :**
```json
{
  "success": true,
  "summary": {
    "resume_psy": "Analyse psychologique...",
    "valeurs_clefs": ["Valeur 1", "Valeur 2", ...],
    "risques_relationnels": ["Risque 1", ...],
    "dealbreakers_probables": ["Dealbreaker 1", ...],
    "type_de_partenaire_recommande": "..."
  }
}
```

**Usage :** Appeler quand un utilisateur crée ou modifie son profil.

---

### 📊 Matching MVP (LEGACY)
**Analyse directe simple**

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
