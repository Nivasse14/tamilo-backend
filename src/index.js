/**
 * POINT D'ENTRÉE PRINCIPAL - SERVEUR EXPRESS
 * 
 * Ce fichier initialise et configure le serveur Express.
 * Il charge les variables d'environnement, configure les middlewares,
 * monte les routes et démarre l'écoute HTTP.
 */

import express from 'express';
import dotenv from 'dotenv';
import prisma from './db.js';
import matchRoutes from './routes/matchRoutes.js';
import { isOpenAIConfigured } from './services/aiClient.js';

// Chargement des variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * MIDDLEWARES
 */

// Parser JSON pour les requêtes
app.use(express.json());

// Logger simple pour toutes les requêtes
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

/**
 * ROUTE DE SANTÉ
 * GET /health
 * Vérifie que le serveur fonctionne et que la DB est accessible
 */
app.get('/health', async (req, res) => {
  try {
    // Test de connexion à la base de données
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      openai: isOpenAIConfigured() ? 'configured' : 'not configured',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

/**
 * ROUTE RACINE
 * GET /
 * Informations de base sur l'API
 */
app.get('/', (req, res) => {
  res.json({
    name: 'IA Tamilo - Matchmaker API',
    version: '1.0.0',
    description: 'API de matching amoureux basée sur l\'IA avec agents conversationnels',
    endpoints: {
      health: 'GET /health',
      matchMVP: 'POST /match/mvp',
      matchAgents: 'POST /match/agents',
      rebuildAgent: 'POST /agents/rebuild/:userId',
      getProfile: 'GET /profile/:userId',
    },
    documentation: 'Consultez le README.md pour plus de détails',
  });
});

/**
 * MONTAGE DES ROUTES
 */
app.use('/match', matchRoutes);
app.use('/agents', matchRoutes);
app.use('/profile', matchRoutes);

/**
 * GESTION DES ROUTES NON TROUVÉES
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
    method: req.method,
  });
});

/**
 * GESTION GLOBALE DES ERREURS
 */
app.use((error, req, res, next) => {
  console.error('[Erreur serveur]:', error);
  
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: error.message,
  });
});

/**
 * DÉMARRAGE DU SERVEUR
 */
async function startServer() {
  try {
    // Vérification de la connexion à la base de données
    console.log('[Serveur] Vérification de la connexion à la base de données...');
    await prisma.$connect();
    console.log('[Serveur] ✓ Connexion à la base de données établie');

    // Vérification de la configuration OpenAI
    if (!isOpenAIConfigured()) {
      console.warn('[Serveur] ⚠️  OPENAI_API_KEY non configurée dans .env');
      console.warn('[Serveur] ⚠️  Les appels à l\'IA échoueront');
    } else {
      console.log('[Serveur] ✓ Clé OpenAI configurée');
    }

    // Démarrage de l'écoute HTTP
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`  IA Tamilo - Matchmaker API`);
      console.log('═══════════════════════════════════════════════════════');
      console.log(`  🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`  📚 Documentation : http://localhost:${PORT}/`);
      console.log(`  💚 Health check  : http://localhost:${PORT}/health`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('Endpoints disponibles :');
      console.log(`  • POST http://localhost:${PORT}/match/mvp`);
      console.log(`  • POST http://localhost:${PORT}/match/agents`);
      console.log(`  • POST http://localhost:${PORT}/agents/rebuild/:userId`);
      console.log(`  • GET  http://localhost:${PORT}/profile/:userId`);
      console.log('');
    });
  } catch (error) {
    console.error('[Serveur] Erreur au démarrage:', error.message);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', async () => {
  console.log('\n[Serveur] Arrêt en cours...');
  await prisma.$disconnect();
  console.log('[Serveur] Serveur arrêté proprement');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[Serveur] Arrêt en cours...');
  await prisma.$disconnect();
  console.log('[Serveur] Serveur arrêté proprement');
  process.exit(0);
});

// Démarrage
startServer();
