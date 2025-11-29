# COMMANDES UTILES - CHEAT SHEET

## 🚀 Démarrage et Développement

```bash
# Installation initiale
npm install

# Démarrer le serveur (production)
npm start

# Démarrer en mode développement (auto-reload)
npm run dev

# Vérifier que tout fonctionne
curl http://localhost:3000/health
```

---

## 🗄️ Gestion de la Base de Données (Prisma)

### Génération et Migration

```bash
# Générer le client Prisma après modification du schema
npm run prisma:generate

# Créer une nouvelle migration
npm run prisma:migrate

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser complètement la DB (⚠️ DANGER : supprime toutes les données)
npx prisma migrate reset
```

### Visualisation et Manipulation

```bash
# Ouvrir Prisma Studio (interface graphique)
npm run prisma:studio

# Remplir la DB avec des données de test
npm run prisma:seed

# Formater le schema.prisma
npx prisma format

# Vérifier le schema sans appliquer
npx prisma validate
```

### Backup et Restauration

```bash
# Backup de la base PostgreSQL
pg_dump -U username -d ia_tamilo_db > backup.sql

# Restauration depuis un backup
psql -U username -d ia_tamilo_db < backup.sql

# Backup avec compression
pg_dump -U username -d ia_tamilo_db | gzip > backup.sql.gz

# Restauration depuis backup compressé
gunzip -c backup.sql.gz | psql -U username -d ia_tamilo_db
```

---

## 🧪 Tests et Debugging

### Tests manuels avec curl

```bash
# Health check
curl http://localhost:3000/health

# Matching MVP
curl -X POST http://localhost:3000/match/mvp \
  -H "Content-Type: application/json" \
  -d '{"userAId":"550e8400-e29b-41d4-a716-446655440001","userBId":"550e8400-e29b-41d4-a716-446655440002"}'

# Matching Agents
curl -X POST http://localhost:3000/match/agents \
  -H "Content-Type: application/json" \
  -d '{"userAId":"550e8400-e29b-41d4-a716-446655440004","userBId":"550e8400-e29b-41d4-a716-446655440002"}'

# Récupérer un profil
curl http://localhost:3000/profile/550e8400-e29b-41d4-a716-446655440001

# Régénérer un agent
curl -X POST http://localhost:3000/agents/rebuild/550e8400-e29b-41d4-a716-446655440001
```

### Tests avec jq (pour formater le JSON)

```bash
# Installer jq si nécessaire
brew install jq  # macOS
# ou
sudo apt-get install jq  # Linux

# Health check formaté
curl -s http://localhost:3000/health | jq

# Matching MVP formaté
curl -s -X POST http://localhost:3000/match/mvp \
  -H "Content-Type: application/json" \
  -d '{"userAId":"550e8400-e29b-41d4-a716-446655440001","userBId":"550e8400-e29b-41d4-a716-446655440002"}' \
  | jq '.result.analysis'
```

### Logs en temps réel

```bash
# Suivre les logs du serveur
npm start | tee server.log

# Filtrer les logs d'erreur
npm start 2>&1 | grep ERROR

# Logs avec timestamp
npm start 2>&1 | while read line; do echo "$(date '+%Y-%m-%d %H:%M:%S') $line"; done
```

---

## 🔍 Inspection de la Base de Données

### Via psql (PostgreSQL CLI)

```bash
# Se connecter à la base
psql postgresql://user:password@localhost:5432/ia_tamilo_db

# Lister toutes les tables
\dt

# Voir la structure d'une table
\d users

# Compter les utilisateurs
SELECT COUNT(*) FROM users;

# Voir les 5 derniers matchs
SELECT * FROM match_logs ORDER BY "createdAt" DESC LIMIT 5;

# Voir tous les utilisateurs avec leurs agents
SELECT u.name, u.age, 
       CASE WHEN a.id IS NOT NULL THEN 'Oui' ELSE 'Non' END as has_agent
FROM users u
LEFT JOIN agent_summaries a ON u.id = a."userId";

# Statistiques de matching
SELECT mode, COUNT(*) as count 
FROM match_logs 
GROUP BY mode;

# Exporter les résultats en CSV
\copy (SELECT * FROM users) TO 'users.csv' CSV HEADER;
```

### Requêtes SQL utiles

```sql
-- Trouver les utilisateurs sans agent summary
SELECT id, name FROM users 
WHERE id NOT IN (SELECT "userId" FROM agent_summaries);

-- Compter les matchings par utilisateur
SELECT u.name, COUNT(m.id) as total_matches
FROM users u
LEFT JOIN match_logs m ON u.id = m."userAId" OR u.id = m."userBId"
GROUP BY u.id, u.name
ORDER BY total_matches DESC;

-- Voir les matchings d'un utilisateur spécifique
SELECT 
  ml."createdAt",
  ua.name as user_a,
  ub.name as user_b,
  ml.mode,
  ml.result->>'verdict' as verdict
FROM match_logs ml
JOIN users ua ON ml."userAId" = ua.id
JOIN users ub ON ml."userBId" = ub.id
WHERE ml."userAId" = '550e8400-e29b-41d4-a716-446655440001'
   OR ml."userBId" = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY ml."createdAt" DESC;

-- Nettoyer les vieux logs (plus de 30 jours)
DELETE FROM match_logs 
WHERE "createdAt" < NOW() - INTERVAL '30 days';

-- Recréer les résumés d'agents (supprime tous les agents existants)
DELETE FROM agent_summaries;
```

---

## 🚢 Déploiement et Production

### Avec PM2 (Process Manager)

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer l'application
pm2 start src/index.js --name ia-tamilo-api

# Lister les processus
pm2 list

# Voir les logs en temps réel
pm2 logs ia-tamilo-api

# Redémarrer l'application
pm2 restart ia-tamilo-api

# Arrêter l'application
pm2 stop ia-tamilo-api

# Supprimer du PM2
pm2 delete ia-tamilo-api

# Sauvegarder la configuration PM2
pm2 save

# Configurer le démarrage automatique au boot
pm2 startup
# Suivre les instructions affichées

# Monitorer l'application
pm2 monit
```

### Avec Docker (optionnel)

```bash
# Créer un Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
EOF

# Créer un docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ia_tamilo
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ia_tamilo
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Build et démarrage
docker-compose up -d

# Voir les logs
docker-compose logs -f app

# Arrêter
docker-compose down

# Rebuild après modifications
docker-compose up -d --build
```

### Mise à jour en production

```bash
# 1. Sauvegarder la base de données
pg_dump -U user ia_tamilo_db > backup-$(date +%Y%m%d).sql

# 2. Récupérer les nouvelles modifications
git pull origin main

# 3. Installer les dépendances
npm install

# 4. Régénérer Prisma
npm run prisma:generate

# 5. Appliquer les migrations
npx prisma migrate deploy

# 6. Redémarrer avec PM2
pm2 restart ia-tamilo-api

# 7. Vérifier les logs
pm2 logs ia-tamilo-api --lines 50
```

---

## 🔧 Maintenance et Optimisation

### Nettoyage

```bash
# Nettoyer node_modules
rm -rf node_modules
npm install

# Nettoyer le cache npm
npm cache clean --force

# Supprimer les logs PM2
pm2 flush

# Nettoyer les fichiers temporaires
rm -rf .cache tmp/ *.log
```

### Monitoring

```bash
# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -m

# Processus Node.js actifs
ps aux | grep node

# Ports ouverts
lsof -i :3000

# Taille de la base de données
psql -c "SELECT pg_size_pretty(pg_database_size('ia_tamilo_db'));"

# Connexions actives à la DB
psql -c "SELECT COUNT(*) FROM pg_stat_activity WHERE datname='ia_tamilo_db';"
```

### Performance

```bash
# Analyser les requêtes lentes (dans PostgreSQL)
psql -c "SELECT query, calls, total_time, mean_time 
         FROM pg_stat_statements 
         ORDER BY mean_time DESC 
         LIMIT 10;"

# Vacuum de la base (nettoyage)
psql -c "VACUUM ANALYZE;"

# Reindex
psql -c "REINDEX DATABASE ia_tamilo_db;"
```

---

## 🔐 Sécurité

### Permissions des fichiers

```bash
# .env doit être privé
chmod 600 .env

# Scripts exécutables
chmod +x setup.sh

# Vérifier les permissions
ls -la
```

### Audit de sécurité

```bash
# Audit des dépendances npm
npm audit

# Corriger automatiquement les vulnérabilités
npm audit fix

# Corriger même les breaking changes (prudence !)
npm audit fix --force
```

### Variables d'environnement

```bash
# Vérifier que les variables sont chargées
node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY ? 'OpenAI OK' : 'OpenAI Missing')"

# Lister toutes les variables d'env
printenv | grep -E 'OPENAI|DATABASE|PORT'
```

---

## 📊 Analytics et Statistiques

### Requêtes SQL pour analytics

```sql
-- Matchings par jour (7 derniers jours)
SELECT 
  DATE("createdAt") as date,
  COUNT(*) as total_matches,
  COUNT(CASE WHEN mode = 'MVP' THEN 1 END) as mvp_matches,
  COUNT(CASE WHEN mode = 'AGENT_V2' THEN 1 END) as agent_matches
FROM match_logs
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY DATE("createdAt")
ORDER BY date DESC;

-- Distribution des genres
SELECT gender, COUNT(*) as count
FROM users
WHERE gender IS NOT NULL
GROUP BY gender;

-- Âge moyen des utilisateurs
SELECT 
  AVG(age) as age_moyen,
  MIN(age) as age_min,
  MAX(age) as age_max
FROM users
WHERE age IS NOT NULL;

-- Villes les plus représentées
SELECT city, COUNT(*) as count
FROM users
WHERE city IS NOT NULL
GROUP BY city
ORDER BY count DESC
LIMIT 10;
```

---

## 🆘 Dépannage Rapide

### Le serveur ne démarre pas

```bash
# Vérifier que le port n'est pas déjà utilisé
lsof -i :3000
# Si occupé, tuer le processus :
kill -9 <PID>

# Vérifier les variables d'environnement
cat .env

# Tester la connexion DB
psql $DATABASE_URL -c "SELECT 1;"

# Logs détaillés
NODE_ENV=development npm start
```

### Erreurs OpenAI

```bash
# Tester la clé API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Vérifier le quota
# Allez sur : https://platform.openai.com/account/usage
```

### Erreurs Prisma

```bash
# Régénérer complètement
npx prisma generate --force

# Vérifier la connexion
npx prisma db pull

# Synchroniser le schema avec la DB
npx prisma db push
```

---

## 📦 Backup Automatique

### Script de backup quotidien

```bash
# Créer un script de backup
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ia_tamilo_db"

# Créer le dossier si nécessaire
mkdir -p $BACKUP_DIR

# Backup de la DB
pg_dump $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup terminé : $BACKUP_DIR/db_backup_$DATE.sql.gz"
EOF

chmod +x backup.sh

# Ajouter au cron (tous les jours à 2h du matin)
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup.sh") | crontab -
```

---

## 🎓 Ressources

- **Prisma Docs** : https://www.prisma.io/docs
- **OpenAI API** : https://platform.openai.com/docs
- **Express.js** : https://expressjs.com
- **PostgreSQL** : https://www.postgresql.org/docs
- **PM2** : https://pm2.keymetrics.io/docs
