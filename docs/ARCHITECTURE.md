# Architecture du Projet IA Tamilo Matchmaker

## 📁 Structure Complète

```
ia-tamilo/
│
├── 📄 package.json                    # Dépendances et scripts npm
├── 📄 .env                            # Variables d'environnement (à configurer)
├── 📄 .env.example                    # Template de configuration
├── 📄 .gitignore                      # Fichiers ignorés par Git
├── 📄 README.md                       # Documentation principale
├── 📄 QUICK_START.md                  # Guide de démarrage rapide
├── 📄 setup.sh                        # Script d'installation automatique
│
├── 📂 src/                            # Code source de l'application
│   ├── 📄 index.js                    # Point d'entrée Express
│   ├── 📄 db.js                       # Client Prisma
│   │
│   ├── 📂 config/                     # Configuration
│   │   └── 📄 prompts.js              # Tous les prompts IA
│   │
│   ├── 📂 services/                   # Logique métier
│   │   ├── 📄 aiClient.js             # Client OpenAI
│   │   └── 📄 matchService.js         # Service de matching
│   │
│   └── 📂 routes/                     # Routes Express
│       └── 📄 matchRoutes.js          # Routes de matching
│
├── 📂 prisma/                         # Base de données
│   ├── 📄 schema.prisma               # Schéma de la DB
│   └── 📄 seed.js                     # Données de test
│
├── 📂 examples/                       # Exemples d'utilisation
│   └── 📄 api-examples.js             # Scripts de test API
│
└── 📂 docs/                           # Documentation
    ├── 📄 MATCHING_LOGIC.md           # Logique de matching détaillée
    └── 📄 COMMANDS_CHEATSHEET.md      # Commandes utiles
```

---

## 🏗️ Architecture Technique

### Couches de l'Application

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTS (HTTP)                          │
│         (Postman, curl, Frontend, Mobile App)               │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                           │
│                   (src/index.js)                            │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐         │
│  │  Middleware│  │   Routes   │  │ Error Handler│         │
│  │   (JSON)   │  │  /match/*  │  │              │         │
│  └────────────┘  └────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               SERVICES (Logique Métier)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          matchService.js                             │  │
│  │  • getUserProfile()                                  │  │
│  │  • matchMVP()                ┌──────────────────┐   │  │
│  │  • buildAgentSummary()  ──→  │   aiClient.js    │   │  │
│  │  • simulateConversation()    │ callChatModel()  │   │  │
│  │  • arbitrateMatch()          └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                     ↓                      ↓
        ┌────────────────────┐    ┌───────────────────┐
        │  PRISMA CLIENT     │    │   OPENAI API      │
        │   (PostgreSQL)     │    │  (GPT-4 Turbo)    │
        └────────────────────┘    └───────────────────┘
                     ↓
        ┌────────────────────────────────────┐
        │     POSTGRESQL DATABASE            │
        │  • users                           │
        │  • agent_summaries                 │
        │  • match_logs                      │
        └────────────────────────────────────┘
```

---

## 🔄 Flux de Données

### Mode MVP (Analyse Directe)

```
Client
  │
  │ POST /match/mvp { userAId, userBId }
  ↓
matchRoutes.js
  │
  │ Validation des paramètres
  ↓
matchService.matchMVP()
  │
  ├─→ getUserProfile(userAId)  ──→ Prisma ──→ PostgreSQL
  │                                    ↓
  ├─→ getUserProfile(userBId)          Profils
  │                                    ↓
  └─→ callChatModel()  ──────────→  OpenAI API
         │                              ↓
         │                         GPT-4 Turbo
         │                              ↓
         │                         Analyse IA
         │                              ↓
         └──────────────────────────  Verdict
              ↓
         Sauvegarde dans match_logs
              ↓
         Retour au client
```

### Mode Agents (Conversation + Arbitrage)

```
Client
  │
  │ POST /match/agents { userAId, userBId }
  ↓
matchRoutes.js
  │
  ↓
matchService.arbitrateMatchFromAgents()
  │
  ├─→ ensureAgentSummary(userAId)
  │     ├─→ Vérifier si existe en DB
  │     └─→ Si non : buildAgentSummary()
  │           └─→ OpenAI API (Appel 1)
  │                   ↓
  │              Agent A créé
  │
  ├─→ ensureAgentSummary(userBId)
  │     └─→ OpenAI API (Appel 2)
  │           ↓
  │      Agent B créé
  │
  ├─→ simulateAgentConversation()
  │     └─→ OpenAI API (Appel 3)
  │           ↓
  │      Conversation simulée
  │           ↓
  └─→ callChatModel (Arbitre)
        └─→ OpenAI API (Appel 4)
              ↓
         Verdict final
              ↓
         Sauvegarde
              ↓
         Retour au client
```

---

## 🗃️ Modèle de Données

### Table `users`

```sql
CREATE TABLE users (
  id                  UUID PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  age                 INTEGER,
  gender              VARCHAR(10),
  city                VARCHAR(100),
  country             VARCHAR(100),
  values              JSONB,           -- ["respect", "famille"]
  non_negotiables     JSONB,           -- ["loyauté", "transparence"]
  emotional_needs     JSONB,           -- ["sécurité", "communication"]
  red_flags           JSONB,           -- ["violence", "mensonge"]
  relationship_goal   VARCHAR(255),
  culture_openness    JSONB,
  family_situation    VARCHAR(255),
  communication_style VARCHAR(255),
  raw_profile         JSONB,           -- Profil complet
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);
```

### Table `agent_summaries`

```sql
CREATE TABLE agent_summaries (
  id         UUID PRIMARY KEY,
  user_id    UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  summary    JSONB NOT NULL,  -- Résumé structuré de l'agent
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table `match_logs`

```sql
CREATE TABLE match_logs (
  id         UUID PRIMARY KEY,
  user_a_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  user_b_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  mode       VARCHAR(20) NOT NULL,  -- 'MVP' ou 'AGENT_V2'
  result     JSONB NOT NULL,        -- Verdict complet
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_match_logs_user_a ON match_logs(user_a_id);
CREATE INDEX idx_match_logs_user_b ON match_logs(user_b_id);
CREATE INDEX idx_match_logs_created ON match_logs(created_at);
```

---

## 🔌 API Endpoints

### Public Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/` | Informations sur l'API |
| `GET` | `/health` | Status du serveur et de la DB |

### Matching Endpoints

| Méthode | Endpoint | Body | Description |
|---------|----------|------|-------------|
| `POST` | `/match/mvp` | `{ userAId, userBId }` | Matching MVP (rapide) |
| `POST` | `/match/agents` | `{ userAId, userBId }` | Matching avec agents (détaillé) |

### Profile Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/profile/:userId` | Récupère un profil utilisateur |

### Agent Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/agents/rebuild/:userId` | Régénère le résumé d'agent |

---

## 🧩 Modules et Responsabilités

### `src/index.js`
- ✅ Initialisation Express
- ✅ Configuration des middlewares
- ✅ Montage des routes
- ✅ Gestion des erreurs globales
- ✅ Démarrage du serveur

### `src/db.js`
- ✅ Initialisation du client Prisma
- ✅ Gestion de la connexion DB
- ✅ Export du client

### `src/config/prompts.js`
- ✅ Centralisation de tous les prompts IA
- ✅ SYSTEM_PROMPT_MVP
- ✅ SYSTEM_PROMPT_AGENT_SUMMARY
- ✅ SYSTEM_PROMPT_AGENT_CONVERSATION
- ✅ SYSTEM_PROMPT_ARBITER

### `src/services/aiClient.js`
- ✅ Wrapper pour l'API OpenAI
- ✅ Fonction `callChatModel()`
- ✅ Gestion des erreurs API
- ✅ Configuration du modèle

### `src/services/matchService.js`
- ✅ `getUserProfile()` - Récupération profil
- ✅ `matchMVP()` - Matching simple
- ✅ `buildAgentSummaryForUser()` - Création agent
- ✅ `ensureAgentSummary()` - Vérification agent
- ✅ `simulateAgentConversation()` - Conversation
- ✅ `arbitrateMatchFromAgents()` - Arbitrage final

### `src/routes/matchRoutes.js`
- ✅ Définition des routes Express
- ✅ Validation des paramètres
- ✅ Gestion des erreurs HTTP
- ✅ Format des réponses

### `prisma/schema.prisma`
- ✅ Définition du schéma de données
- ✅ Relations entre tables
- ✅ Indexes pour performance

### `prisma/seed.js`
- ✅ Création de données de test
- ✅ 5 utilisateurs avec profils variés
- ✅ Suggestions de tests

---

## ⚙️ Configuration

### Variables d'Environnement

| Variable | Requis | Défaut | Description |
|----------|--------|--------|-------------|
| `OPENAI_API_KEY` | ✅ Oui | - | Clé API OpenAI |
| `DATABASE_URL` | ✅ Oui | - | URL PostgreSQL |
| `PORT` | ❌ Non | 3000 | Port du serveur |
| `OPENAI_MODEL` | ❌ Non | gpt-4-turbo-preview | Modèle IA |
| `NODE_ENV` | ❌ Non | development | Environnement |

---

## 🚀 Scripts npm

| Script | Commande | Description |
|--------|----------|-------------|
| `start` | `node src/index.js` | Démarre le serveur |
| `dev` | `node --watch src/index.js` | Mode développement |
| `prisma:generate` | `prisma generate` | Génère le client Prisma |
| `prisma:migrate` | `prisma migrate dev` | Applique les migrations |
| `prisma:studio` | `prisma studio` | Interface graphique DB |
| `prisma:seed` | `node prisma/seed.js` | Remplit la DB de test |

---

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

- ✅ Variables d'environnement (.env)
- ✅ Pas de clés en dur dans le code
- ✅ .gitignore configuré
- ✅ Validation des paramètres d'entrée
- ✅ Gestion des erreurs sans leak d'info sensible
- ✅ Cascade DELETE pour intégrité DB

### À Ajouter en Production

- ⚠️ Rate limiting (express-rate-limit)
- ⚠️ CORS configuré
- ⚠️ Helmet.js pour headers sécurisés
- ⚠️ Authentification/Autorisation
- ⚠️ HTTPS/SSL
- ⚠️ Logs structurés (Winston, Pino)
- ⚠️ Monitoring (Sentry, DataDog)

---

## 📈 Performance

### Optimisations Actuelles

- ✅ Indexes sur les clés étrangères
- ✅ Prisma pooling de connexions
- ✅ Logs conditionnels selon l'environnement
- ✅ Réutilisation des agents IA

### Optimisations Futures

- 🔄 Cache Redis pour agents fréquents
- 🔄 Queue (Bull/BullMQ) pour matchings longs
- 🔄 Pagination des résultats
- 🔄 Compression gzip des réponses
- 🔄 CDN pour assets statiques

---

## 🧪 Tests

### Tests Manuels Disponibles

- ✅ Script curl (QUICK_START.md)
- ✅ Script Node.js (examples/api-examples.js)
- ✅ Collection Postman suggérée

### Tests Automatisés (À implémenter)

```bash
# Structure suggérée
tests/
├── unit/
│   ├── services/
│   │   ├── aiClient.test.js
│   │   └── matchService.test.js
│   └── routes/
│       └── matchRoutes.test.js
└── integration/
    ├── match-mvp.test.js
    └── match-agents.test.js
```

Frameworks recommandés :
- Jest
- Supertest (tests API)
- @faker-js/faker (données de test)

---

## 📚 Documentation

| Fichier | Contenu |
|---------|---------|
| `README.md` | Vue d'ensemble et installation |
| `QUICK_START.md` | Guide de démarrage rapide |
| `docs/MATCHING_LOGIC.md` | Logique métier détaillée |
| `docs/COMMANDS_CHEATSHEET.md` | Commandes utiles |
| `docs/ARCHITECTURE.md` | Ce fichier |

---

## 🎯 Prochaines Étapes

### Phase 1 : MVP Complet ✅
- ✅ Backend Node.js/Express
- ✅ Base de données PostgreSQL
- ✅ Intégration OpenAI
- ✅ Mode MVP
- ✅ Mode Agents
- ✅ Documentation complète

### Phase 2 : Production Ready
- ⏳ Tests automatisés
- ⏳ Authentification/Autorisation
- ⏳ Rate limiting
- ⏳ Monitoring et logs
- ⏳ Déploiement sur Hetzner

### Phase 3 : Évolutions
- ⏳ Interface web (React/Next.js)
- ⏳ Application mobile
- ⏳ Matching en lot
- ⏳ Recommandations IA
- ⏳ Analytics avancées

---

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

---

## 📞 Support

Pour toute question ou problème :

1. Consulter la documentation dans `docs/`
2. Vérifier les logs du serveur
3. Utiliser Prisma Studio pour inspecter la DB
4. Consulter les issues GitHub (si applicable)

---

**Version :** 1.0.0  
**Dernière mise à jour :** 29 novembre 2025  
**Stack :** Node.js 20+ | Express 4 | Prisma 5 | PostgreSQL 15+ | OpenAI API v4
