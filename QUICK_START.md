# GUIDE DE DÉMARRAGE RAPIDE

## Installation automatique

```bash
chmod +x setup.sh
./setup.sh
```

Le script setup vous guidera à travers :
1. Installation des dépendances
2. Configuration du fichier .env
3. Génération du client Prisma
4. Migration de la base de données
5. Création de données de test

## Installation manuelle

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration des variables d'environnement

```bash
cp .env.example .env
```

Éditez `.env` et configurez :

```env
# Obligatoire : Votre clé API OpenAI
OPENAI_API_KEY=sk-proj-...

# Obligatoire : URL de votre base PostgreSQL
# Exemple Hetzner :
DATABASE_URL=postgresql://user:password@your-hetzner-server.com:5432/ia_tamilo?schema=public

# Optionnel
PORT=3000
OPENAI_MODEL=gpt-4-turbo-preview
```

### 3. Configuration de Prisma

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer la base de données et appliquer les migrations
npm run prisma:migrate

# (Optionnel) Remplir avec des données de test
npm run prisma:seed
```

### 4. Démarrer le serveur

```bash
# Mode production
npm start

# Mode développement (auto-reload)
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

---

## TESTS AVEC CURL

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Matching MVP (analyse directe)

```bash
curl -X POST http://localhost:3000/match/mvp \
  -H "Content-Type: application/json" \
  -d '{
    "userAId": "550e8400-e29b-41d4-a716-446655440001",
    "userBId": "550e8400-e29b-41d4-a716-446655440002"
  }'
```

### 3. Matching avec Agents (conversation + arbitrage)

```bash
curl -X POST http://localhost:3000/match/agents \
  -H "Content-Type: application/json" \
  -d '{
    "userAId": "550e8400-e29b-41d4-a716-446655440004",
    "userBId": "550e8400-e29b-41d4-a716-446655440002"
  }'
```

### 4. Récupérer un profil utilisateur

```bash
curl http://localhost:3000/profile/550e8400-e29b-41d4-a716-446655440001
```

### 5. Regénérer un résumé d'agent

```bash
curl -X POST http://localhost:3000/agents/rebuild/550e8400-e29b-41d4-a716-446655440001
```

---

## TESTS AVEC POSTMAN / INSOMNIA

### Collection de requêtes

Créez une nouvelle collection avec les requêtes suivantes :

**1. Health Check**
- Méthode : `GET`
- URL : `http://localhost:3000/health`

**2. Matching MVP**
- Méthode : `POST`
- URL : `http://localhost:3000/match/mvp`
- Body (JSON) :
```json
{
  "userAId": "550e8400-e29b-41d4-a716-446655440001",
  "userBId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**3. Matching Agents**
- Méthode : `POST`
- URL : `http://localhost:3000/match/agents`
- Body (JSON) :
```json
{
  "userAId": "550e8400-e29b-41d4-a716-446655440004",
  "userBId": "550e8400-e29b-41d4-a716-446655440002"
}
```

---

## UTILISATEURS DE TEST (après seed)

Après avoir exécuté `npm run prisma:seed`, vous aurez 5 utilisateurs :

| Nom | ID | Profil |
|-----|-----|--------|
| Sophie Dubois | `550e8400-e29b-41d4-a716-446655440001` | Femme, 28 ans, valeurs familiales fortes |
| Ravi Kumar | `550e8400-e29b-41d4-a716-446655440002` | Homme, 30 ans, culture tamoule, respect |
| Marie Laurent | `550e8400-e29b-41d4-a716-446655440003` | Femme, 32 ans, valorise liberté |
| Priya Sharma | `550e8400-e29b-41d4-a716-446655440004` | Femme, 27 ans, double culture, ambitieuse |
| Thomas Mercier | `550e8400-e29b-41d4-a716-446655440005` | Homme, 35 ans, calme, routine |

### Suggestions de matchings à tester :

**✅ Très compatible** : Sophie (001) x Ravi (002)
**✅ Excellent match** : Priya (004) x Ravi (002)
**⚠️  À explorer** : Sophie (001) x Marie (003)
**❌ Peu compatible** : Sophie (001) x Thomas (005)

---

## GESTION DE LA BASE DE DONNÉES

### Prisma Studio (interface graphique)

```bash
npm run prisma:studio
```

Ouvre une interface web sur `http://localhost:5555` pour visualiser et éditer les données.

### Créer un nouvel utilisateur manuellement

Via Prisma Studio ou avec du code :

```javascript
import prisma from './src/db.js';

const user = await prisma.user.create({
  data: {
    name: "Nouveau Utilisateur",
    age: 25,
    gender: "F",
    values: ["respect", "famille"],
    nonNegotiables: ["loyauté", "transparence"],
    emotionalNeeds: ["sécurité", "communication"],
    redFlags: ["violence", "mensonge"],
    relationshipGoal: "relation sérieuse",
    // ... autres champs
  }
});
```

---

## DÉPLOIEMENT SUR HETZNER

### 1. Préparer le serveur

```bash
# Connexion SSH
ssh root@your-hetzner-server.com

# Installation de Node.js (si pas déjà fait)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Installation de PostgreSQL (si pas déjà fait)
apt-get install -y postgresql postgresql-contrib
```

### 2. Configuration PostgreSQL

```bash
# Créer la base de données
sudo -u postgres psql
CREATE DATABASE ia_tamilo;
CREATE USER ia_tamilo_user WITH PASSWORD 'votre_mot_de_passe_fort';
GRANT ALL PRIVILEGES ON DATABASE ia_tamilo TO ia_tamilo_user;
\q
```

### 3. Déployer l'application

```bash
# Cloner le projet (ou uploader via SCP/SFTP)
git clone <votre-repo>
cd ia-tamilo

# Créer le fichier .env
nano .env
# Remplir avec les vraies valeurs

# Installer et configurer
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Démarrer avec PM2 (recommandé pour la production)
npm install -g pm2
pm2 start src/index.js --name ia-tamilo-api
pm2 save
pm2 startup
```

### 4. Configuration Nginx (optionnel mais recommandé)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## TROUBLESHOOTING

### Erreur : "OPENAI_API_KEY non configurée"
- Vérifiez que votre `.env` contient une clé valide
- Format : `OPENAI_API_KEY=sk-proj-...`

### Erreur : "Connexion à la base de données échouée"
- Vérifiez votre `DATABASE_URL` dans `.env`
- Testez la connexion : `npm run prisma:studio`
- Vérifiez que PostgreSQL est en cours d'exécution

### Erreur : "Utilisateur introuvable"
- Vérifiez que les IDs existent avec Prisma Studio
- Exécutez le seed : `npm run prisma:seed`

### Le serveur ne démarre pas
- Vérifiez les logs dans la console
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Changez le port dans `.env` : `PORT=3001`

---

## SUPPORT

Pour toute question ou problème, consultez :
- Le fichier `README.md`
- Les logs du serveur dans la console
- La documentation Prisma : https://www.prisma.io/docs
- La documentation OpenAI : https://platform.openai.com/docs
