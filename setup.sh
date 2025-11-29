#!/bin/bash

# Script de démarrage rapide pour IA Tamilo Matchmaker
# Ce script configure automatiquement le projet

echo "🚀 Configuration du projet IA Tamilo Matchmaker..."
echo ""

# 1. Installation des dépendances
echo "📦 Installation des dépendances npm..."
npm install
echo "✓ Dépendances installées"
echo ""

# 2. Configuration de l'environnement
if [ ! -f .env ]; then
  echo "📝 Création du fichier .env..."
  cp .env.example .env
  echo "⚠️  IMPORTANT : Éditez le fichier .env avec vos vraies valeurs :"
  echo "   - OPENAI_API_KEY (obligatoire)"
  echo "   - DATABASE_URL (obligatoire)"
  echo ""
  echo "Voulez-vous éditer .env maintenant ? (y/n)"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    ${EDITOR:-nano} .env
  fi
else
  echo "✓ Fichier .env déjà existant"
fi
echo ""

# 3. Génération du client Prisma
echo "🔧 Génération du client Prisma..."
npm run prisma:generate
echo "✓ Client Prisma généré"
echo ""

# 4. Migration de la base de données
echo "🗄️  Application des migrations de la base de données..."
echo "⚠️  Assurez-vous que votre DATABASE_URL dans .env est correcte"
echo "Continuer avec la migration ? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
  npm run prisma:migrate
  echo "✓ Migrations appliquées"
  echo ""
  
  # 5. Seed de la base de données
  echo "🌱 Voulez-vous remplir la base avec des données de test ? (y/n)"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    npm run prisma:seed
    echo "✓ Données de test créées"
  fi
else
  echo "⏭️  Migration ignorée - vous devrez l'exécuter manuellement avec : npm run prisma:migrate"
fi
echo ""

echo "✨ Configuration terminée !"
echo ""
echo "Pour démarrer le serveur :"
echo "  npm start         # Mode production"
echo "  npm run dev       # Mode développement (auto-reload)"
echo ""
echo "Pour gérer la base de données :"
echo "  npm run prisma:studio    # Interface graphique Prisma"
echo ""
