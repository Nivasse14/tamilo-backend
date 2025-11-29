/**
 * ROUTES DE MATCHING
 * 
 * Ce fichier définit toutes les routes Express pour les fonctionnalités de matching.
 * Il expose les endpoints pour :
 * - Matching MVP (analyse directe)
 * - Matching avec agents V1 (conversation + arbitrage) - LEGACY
 * - Matching multi-agents V2 (4 spécialistes + orchestrateur) - NOUVEAU
 * - Régénération des résumés d'agents
 * - Memory layer (résumé psychologique)
 */

import express from 'express';
import {
  matchMVP,
  arbitrateMatchFromAgents,
  buildAgentSummaryForUser,
  getUserProfile,
  matchWithMultiAgents,
  buildOrUpdateAgentSummary,
} from '../services/matchService.js';

const router = express.Router();

/**
 * POST /match/mvp
 * Mode MVP : Analyse directe de compatibilité entre deux utilisateurs
 * 
 * Body: {
 *   "userAId": "uuid",
 *   "userBId": "uuid"
 * }
 */
router.post('/mvp', async (req, res) => {
  try {
    const { userAId, userBId } = req.body;

    // Validation des paramètres
    if (!userAId || !userBId) {
      return res.status(400).json({
        error: 'Les champs userAId et userBId sont requis',
      });
    }

    if (userAId === userBId) {
      return res.status(400).json({
        error: 'Les deux utilisateurs doivent être différents',
      });
    }

    console.log(`[API] POST /match/mvp - ${userAId} x ${userBId}`);

    // Exécution du matching MVP
    const result = await matchMVP(userAId, userBId);

    // Réponse avec le résultat complet
    res.json({
      success: true,
      result: result,
    });
  } catch (error) {
    console.error('[API] Erreur /match/mvp:', error.message);
    
    // Gestion des erreurs métier
    if (error.message.includes('introuvable')) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        details: error.message,
      });
    }

    res.status(500).json({
      error: 'Erreur lors du matching MVP',
      details: error.message,
    });
  }
});

/**
 * POST /match/agents
 * Mode Agents V1 : Conversation simulée + arbitrage final (LEGACY)
 * 
 * DEPRECATED : Utilisez /match/multi-agents pour la nouvelle architecture
 * 
 * Body: {
 *   "userAId": "uuid",
 *   "userBId": "uuid"
 * }
 */
router.post('/agents', async (req, res) => {
  try {
    const { userAId, userBId } = req.body;

    // Validation des paramètres
    if (!userAId || !userBId) {
      return res.status(400).json({
        error: 'Les champs userAId et userBId sont requis',
      });
    }

    if (userAId === userBId) {
      return res.status(400).json({
        error: 'Les deux utilisateurs doivent être différents',
      });
    }

    console.log(`[API] POST /match/agents (LEGACY) - ${userAId} x ${userBId}`);

    // Exécution du matching avec agents V1
    const result = await arbitrateMatchFromAgents(userAId, userBId);

    // Réponse avec conversation et verdict
    res.json({
      success: true,
      verdict: result.verdict,
      rawConversation: result.conversation,
      fullResult: result,
      _warning: 'This endpoint is LEGACY. Use /match/multi-agents for the new architecture.',
    });
  } catch (error) {
    console.error('[API] Erreur /match/agents:', error.message);
    
    // Gestion des erreurs métier
    if (error.message.includes('introuvable')) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        details: error.message,
      });
    }

    res.status(500).json({
      error: 'Erreur lors du matching avec agents',
      details: error.message,
    });
  }
});

/**
 * POST /match/multi-agents
 * Mode Multi-Agents V2 : Architecture avec 4 agents spécialisés + orchestrateur (NOUVEAU)
 * 
 * Cette route utilise la nouvelle architecture multi-agents :
 * - agentProfil : compatibilité psychologique et émotionnelle
 * - agentValeurs : compatibilité des valeurs et modes de vie
 * - agentProjection : compatibilité des projets de vie à long terme
 * - agentRisques : détection de red flags et risques
 * - orchestrator : synthèse finale et verdict structuré
 * 
 * Body: {
 *   "userAId": "uuid",
 *   "userBId": "uuid"
 * }
 */
router.post('/multi-agents', async (req, res) => {
  try {
    let { userAId, userBId } = req.body;

    // Validation des paramètres
    if (!userAId || !userBId) {
      return res.status(400).json({
        error: 'Les champs userAId et userBId sont requis',
      });
    }

    // Conversion en string si nécessaire (pour compatibilité avec les anciens appels en integer)
    userAId = String(userAId);
    userBId = String(userBId);

    if (userAId === userBId) {
      return res.status(400).json({
        error: 'Les deux utilisateurs doivent être différents',
      });
    }

    console.log(`[API] POST /match/multi-agents - ${userAId} x ${userBId}`);

    // Exécution du matching multi-agents V2
    const result = await matchWithMultiAgents(userAId, userBId);

    // Réponse structurée avec tous les détails
    res.json({
      success: true,
      result: result,
    });
  } catch (error) {
    console.error('[API] Erreur /match/multi-agents:', error.message);
    
    // Gestion des erreurs métier
    if (error.message.includes('introuvable')) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        details: error.message,
      });
    }

    res.status(500).json({
      error: 'Erreur lors du matching multi-agents',
      details: error.message,
    });
  }
});

/**
 * POST /agents/rebuild/:userId
 * Régénère le résumé d'agent pour un utilisateur spécifique (LEGACY)
 * Utile quand le profil utilisateur a été modifié
 * 
 * DEPRECATED : Utilisez /memory/update/:userId pour la nouvelle architecture
 */
router.post('/agents/rebuild/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'Le paramètre userId est requis',
      });
    }

    console.log(`[API] POST /agents/rebuild/${userId} (LEGACY)`);

    // Régénération du résumé d'agent V1
    const agentSummary = await buildAgentSummaryForUser(userId);

    res.json({
      success: true,
      message: 'Résumé d\'agent régénéré avec succès',
      agentSummary: agentSummary,
      _warning: 'This endpoint is LEGACY. Use /memory/update/:userId for the new architecture.',
    });
  } catch (error) {
    console.error('[API] Erreur /agents/rebuild:', error.message);
    
    if (error.message.includes('introuvable')) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        details: error.message,
      });
    }

    res.status(500).json({
      error: 'Erreur lors de la régénération du résumé d\'agent',
      details: error.message,
    });
  }
});

/**
 * POST /memory/update/:userId
 * Génère ou met à jour le résumé psychologique structuré (NOUVEAU)
 * 
 * À appeler quand un utilisateur crée ou modifie son profil.
 * Produit un JSON structuré avec :
 * - resume_psy
 * - valeurs_clefs
 * - risques_relationnels
 * - dealbreakers_probables
 * - type_de_partenaire_recommande
 */
router.post('/memory/update/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'Le paramètre userId est requis',
      });
    }

    console.log(`[API] POST /memory/update/${userId}`);

    // Génération/mise à jour du résumé psychologique V2
    const summary = await buildOrUpdateAgentSummary(userId);

    res.json({
      success: true,
      message: 'Résumé psychologique mis à jour avec succès',
      summary: summary,
    });
  } catch (error) {
    console.error('[API] Erreur /memory/update:', error.message);
    
    if (error.message.includes('introuvable')) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        details: error.message,
      });
    }

    res.status(500).json({
      error: 'Erreur lors de la mise à jour du résumé psychologique',
      details: error.message,
    });
  }
});

/**
 * GET /profile/:userId
 * Récupère le profil d'un utilisateur (pour debug/vérification)
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`[API] GET /profile/${userId}`);

    const profile = await getUserProfile(userId);

    res.json({
      success: true,
      profile: profile,
    });
  } catch (error) {
    console.error('[API] Erreur /profile:', error.message);
    
    if (error.message.includes('introuvable')) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        details: error.message,
      });
    }

    res.status(500).json({
      error: 'Erreur lors de la récupération du profil',
      details: error.message,
    });
  }
});

export default router;
