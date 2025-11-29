/**
 * SERVICE DE MATCHING
 * 
 * Ce module contient toute la logique métier pour le matching amoureux basé sur l'IA.
 * Il expose plusieurs modes :
 * 1. MVP : Analyse directe de compatibilité (mode simple)
 * 2. Agents V1 : Conversation simulée entre agents IA + arbitrage (LEGACY)
 * 3. Multi-Agent V2 : Architecture multi-agents avec 4 spécialistes + orchestrateur (NOUVEAU)
 */

import prisma from '../db.js';
import { callChatModel } from './aiClient.js';
import {
  SYSTEM_PROMPT_MVP,
  SYSTEM_PROMPT_AGENT_SUMMARY,
  SYSTEM_PROMPT_AGENT_CONVERSATION,
  SYSTEM_PROMPT_ARBITER,
} from '../config/prompts.js';
import matchTwoUsers from '../agents/orchestrator.js';
import { callStructuredGPT } from '../utils/structuredGPT.js';

/**
 * Récupère un profil utilisateur complet depuis la base de données
 * 
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Profil utilisateur formaté pour l'IA
 * @throws {Error} - Si l'utilisateur n'existe pas
 */
export async function getUserProfile(userId) {
  try {
    console.log(`[Match Service] Récupération du profil utilisateur ${userId}...`);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`Utilisateur ${userId} introuvable`);
    }

    // Formatage du profil pour l'IA (conversion des champs JSON si nécessaire)
    const profile = {
      id: user.id,
      name: user.name,
      age: user.age,
      gender: user.gender,
      city: user.city,
      country: user.country,
      values: user.values,
      nonNegotiables: user.nonNegotiables,
      emotionalNeeds: user.emotionalNeeds,
      redFlags: user.redFlags,
      relationshipGoal: user.relationshipGoal,
      cultureOpenness: user.cultureOpenness,
      familySituation: user.familySituation,
      communicationStyle: user.communicationStyle,
      rawProfile: user.rawProfile,
    };

    console.log(`[Match Service] Profil ${user.name} récupéré avec succès`);
    return profile;
  } catch (error) {
    console.error(`[Match Service] Erreur lors de la récupération du profil:`, error.message);
    throw error;
  }
}

/**
 * MODE MVP - Analyse directe de compatibilité entre deux utilisateurs
 * 
 * @param {string} userAId - ID du premier utilisateur
 * @param {string} userBId - ID du deuxième utilisateur
 * @returns {Promise<Object>} - Résultat du matching avec le verdict IA
 */
export async function matchMVP(userAId, userBId) {
  try {
    console.log(`[Match MVP] Démarrage du matching entre ${userAId} et ${userBId}...`);

    // Récupération des deux profils
    const [profileA, profileB] = await Promise.all([
      getUserProfile(userAId),
      getUserProfile(userBId),
    ]);

    // Construction du prompt utilisateur avec les deux profils
    const userPrompt = `Voici le profil A :
${JSON.stringify(profileA, null, 2)}

Voici le profil B :
${JSON.stringify(profileB, null, 2)}

Analyse la compatibilité entre A et B en respectant les instructions du système.`;

    // Appel à l'IA pour analyse directe
    console.log(`[Match MVP] Appel à l'IA pour analyse...`);
    const aiResponse = await callChatModel({
      systemPrompt: SYSTEM_PROMPT_MVP,
      userPrompt: userPrompt,
    });

    // Structure du résultat
    const result = {
      mode: 'MVP',
      userA: { id: profileA.id, name: profileA.name },
      userB: { id: profileB.id, name: profileB.name },
      analysis: aiResponse,
      timestamp: new Date().toISOString(),
    };

    // Log du matching dans la base de données
    await prisma.matchLog.create({
      data: {
        userAId: userAId,
        userBId: userBId,
        mode: 'MVP',
        result: result,
      },
    });

    console.log(`[Match MVP] Matching terminé avec succès`);
    return result;
  } catch (error) {
    console.error(`[Match MVP] Erreur:`, error.message);
    throw error;
  }
}

/**
 * Génère un résumé d'agent IA pour un utilisateur
 * Ce résumé est utilisé dans le mode agents pour la conversation simulée
 * 
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Résumé structuré de l'agent
 */
export async function buildAgentSummaryForUser(userId) {
  try {
    console.log(`[Agent Summary] Génération du résumé d'agent pour ${userId}...`);

    // Récupération du profil complet
    const profile = await getUserProfile(userId);

    // Construction du prompt pour générer le résumé
    const userPrompt = `Voici le profil brut de la personne :
${JSON.stringify(profile, null, 2)}

Génère un résumé structuré au format JSON selon les instructions du système.`;

    // Appel à l'IA pour générer le résumé
    const aiResponse = await callChatModel({
      systemPrompt: SYSTEM_PROMPT_AGENT_SUMMARY,
      userPrompt: userPrompt,
      temperature: 0.5, // Plus de déterminisme pour le résumé
    });

    // Parsing du JSON retourné par l'IA
    let summaryData;
    try {
      // Nettoyage de la réponse (parfois l'IA entoure le JSON de ```json ... ```)
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      summaryData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(`[Agent Summary] Erreur de parsing JSON:`, parseError.message);
      // Fallback : stockage de la réponse brute
      summaryData = { raw: aiResponse };
    }

    // Sauvegarde ou mise à jour du résumé en base
    const agentSummary = await prisma.agentSummary.upsert({
      where: { userId: userId },
      update: {
        summary: summaryData,
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        summary: summaryData,
      },
    });

    console.log(`[Agent Summary] Résumé généré et sauvegardé avec succès`);
    return agentSummary;
  } catch (error) {
    console.error(`[Agent Summary] Erreur:`, error.message);
    throw error;
  }
}

/**
 * S'assure qu'un résumé d'agent existe pour un utilisateur
 * Si le résumé n'existe pas, il est généré automatiquement
 * 
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Résumé d'agent existant ou nouvellement créé
 */
export async function ensureAgentSummary(userId) {
  try {
    console.log(`[Agent Summary] Vérification du résumé pour ${userId}...`);

    // Recherche d'un résumé existant
    let agentSummary = await prisma.agentSummary.findUnique({
      where: { userId: userId },
    });

    // Si pas de résumé, on le génère
    if (!agentSummary) {
      console.log(`[Agent Summary] Aucun résumé trouvé, génération en cours...`);
      agentSummary = await buildAgentSummaryForUser(userId);
    } else {
      console.log(`[Agent Summary] Résumé existant trouvé`);
    }

    return agentSummary;
  } catch (error) {
    console.error(`[Agent Summary] Erreur:`, error.message);
    throw error;
  }
}

/**
 * Simule une conversation entre deux agents IA représentant les utilisateurs
 * 
 * @param {string} userAId - ID du premier utilisateur
 * @param {string} userBId - ID du deuxième utilisateur
 * @returns {Promise<string>} - Texte de la conversation simulée
 */
export async function simulateAgentConversation(userAId, userBId) {
  try {
    console.log(`[Agent Conversation] Simulation de conversation entre ${userAId} et ${userBId}...`);

    // S'assurer que les résumés d'agents existent pour les deux utilisateurs
    const [summaryA, summaryB] = await Promise.all([
      ensureAgentSummary(userAId),
      ensureAgentSummary(userBId),
    ]);

    // Construction du prompt avec les deux résumés d'agents
    const userPrompt = `Résumé Agent_A :
${JSON.stringify(summaryA.summary, null, 2)}

Résumé Agent_B :
${JSON.stringify(summaryB.summary, null, 2)}

Simule la discussion entre les deux agents selon les instructions du système.`;

    // Appel à l'IA pour simuler la conversation
    console.log(`[Agent Conversation] Appel à l'IA pour simulation...`);
    const conversation = await callChatModel({
      systemPrompt: SYSTEM_PROMPT_AGENT_CONVERSATION,
      userPrompt: userPrompt,
      temperature: 0.8, // Un peu plus de créativité pour la conversation
    });

    console.log(`[Agent Conversation] Conversation générée avec succès`);
    return conversation;
  } catch (error) {
    console.error(`[Agent Conversation] Erreur:`, error.message);
    throw error;
  }
}

/**
 * MODE AGENTS - Arbitrage final après conversation entre agents
 * 
 * @param {string} userAId - ID du premier utilisateur
 * @param {string} userBId - ID du deuxième utilisateur
 * @returns {Promise<Object>} - Verdict final avec analyse complète
 */
export async function arbitrateMatchFromAgents(userAId, userBId) {
  try {
    console.log(`[Match Agents] Démarrage du matching avec agents entre ${userAId} et ${userBId}...`);

    // Étape 1 : Simuler la conversation entre les agents
    const conversation = await simulateAgentConversation(userAId, userBId);

    // Étape 2 : Faire arbitrer la conversation par l'agent arbitre
    const userPrompt = `Conversation entre les deux agents :

${conversation}

Donne le verdict final de compatibilité.`;

    console.log(`[Match Agents] Appel à l'arbitre pour verdict final...`);
    const verdict = await callChatModel({
      systemPrompt: SYSTEM_PROMPT_ARBITER,
      userPrompt: userPrompt,
      temperature: 0.6, // Équilibre entre déterminisme et nuance
    });

    // Récupération des noms pour le résultat
    const [profileA, profileB] = await Promise.all([
      getUserProfile(userAId),
      getUserProfile(userBId),
    ]);

    // Structure du résultat complet
    const result = {
      mode: 'AGENT_V2',
      userA: { id: profileA.id, name: profileA.name },
      userB: { id: profileB.id, name: profileB.name },
      conversation: conversation,
      verdict: verdict,
      timestamp: new Date().toISOString(),
    };

    // Log du matching dans la base de données
    await prisma.matchLog.create({
      data: {
        userAId: userAId,
        userBId: userBId,
        mode: 'AGENT_V2',
        result: result,
      },
    });

    console.log(`[Match Agents] Matching terminé avec succès`);
    return result;
  } catch (error) {
    console.error(`[Match Agents] Erreur:`, error.message);
    throw error;
  }
}

/**
 * NOUVELLE FONCTION PRINCIPALE : MULTI-AGENT V2
 * 
 * Utilise l'architecture multi-agents avec 4 spécialistes + orchestrateur.
 * Remplace progressivement arbitrateMatchFromAgents pour les nouveaux matchings.
 * 
 * @param {string} userAId - ID du premier utilisateur
 * @param {string} userBId - ID du second utilisateur
 * @returns {Promise<Object>} - Résultat structuré complet du matching
 */
export async function matchWithMultiAgents(userAId, userBId) {
  try {
    console.log(`\n[Match Multi-Agent] Lancement du matching entre ${userAId} et ${userBId}...`);

    // Appel de l'orchestrateur multi-agents
    const result = await matchTwoUsers(userAId, userBId, prisma);

    // Log du matching dans la base de données
    await prisma.matchLog.create({
      data: {
        userAId: userAId,
        userBId: userBId,
        mode: 'MULTI_AGENT_V2',
        result: result,
      },
    });

    console.log(`[Match Multi-Agent] ✅ Matching terminé avec succès`);
    return result;
  } catch (error) {
    console.error(`[Match Multi-Agent] ❌ Erreur:`, error.message);
    throw error;
  }
}

/**
 * NOUVELLE FONCTION : MEMORY LAYER V2
 * 
 * Génère ou met à jour le résumé psychologique structuré d'un utilisateur.
 * Utilisé pour enrichir le contexte avant le matching.
 * 
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Résumé psychologique structuré
 */
export async function buildOrUpdateAgentSummary(userId) {
  try {
    console.log(`[Memory Layer] Construction du résumé psychologique pour ${userId}...`);

    // Récupération du profil complet
    const profile = await getUserProfile(userId);

    // Prompt système pour le résumé psychologique
    const SYSTEM_PROMPT_MEMORY = `Tu es un expert en psychologie relationnelle.

Ta mission : analyser un profil utilisateur et produire un résumé psychologique structuré.

Focus sur :
- Résumé psychologique global
- Valeurs clés et non-négociables
- Risques relationnels potentiels
- Dealbreakers probables
- Type de partenaire recommandé

Tu DOIS retourner UNIQUEMENT un JSON valide avec cette structure EXACTE :

{
  "resume_psy": "<string: résumé psychologique en 3-4 phrases>",
  "valeurs_clefs": ["<string>", "<string>", ...],
  "risques_relationnels": ["<string>", "<string>", ...],
  "dealbreakers_probables": ["<string>", "<string>", ...],
  "type_de_partenaire_recommande": "<string: description du profil idéal pour cette personne>"
}

IMPORTANT :
- resume_psy : synthèse de la personnalité et des besoins
- valeurs_clefs : 3-5 valeurs centrales
- risques_relationnels : 2-4 patterns à surveiller
- dealbreakers_probables : 1-3 critères rédhibitoires
- type_de_partenaire_recommande : description détaillée du partenaire idéal
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Pas de markdown, pas de \`\`\`json, juste le JSON pur`;

    const userPrompt = `Analyse ce profil utilisateur :

NOM : ${profile.name}
ÂGE : ${profile.age || 'non spécifié'}
LOCALISATION : ${profile.city || 'non spécifié'}, ${profile.country || 'non spécifié'}
VALEURS : ${JSON.stringify(profile.values)}
NON-NÉGOCIABLES : ${JSON.stringify(profile.nonNegotiables)}
BESOINS ÉMOTIONNELS : ${JSON.stringify(profile.emotionalNeeds)}
RED FLAGS : ${JSON.stringify(profile.redFlags)}
OBJECTIF RELATIONNEL : ${profile.relationshipGoal || 'non spécifié'}
PROFIL COMPLET : ${JSON.stringify(profile.rawProfile)}

Produis le résumé psychologique structuré au format JSON strict.`;

    // Appel à l'IA avec validation JSON
    const summary = await callStructuredGPT({
      systemPrompt: SYSTEM_PROMPT_MEMORY,
      userPrompt: userPrompt,
      temperature: 0.6,
      expectedSchema: {
        resume_psy: 'string',
        valeurs_clefs: 'array',
        risques_relationnels: 'array',
        dealbreakers_probables: 'array',
        type_de_partenaire_recommande: 'string',
      },
    });

    // Enregistrement ou mise à jour dans la base de données
    const existingSummary = await prisma.agentSummary.findUnique({
      where: { userId: userId },
    });

    if (existingSummary) {
      console.log(`[Memory Layer] Mise à jour du résumé existant...`);
      await prisma.agentSummary.update({
        where: { userId: userId },
        data: { summary: summary },
      });
    } else {
      console.log(`[Memory Layer] Création du résumé initial...`);
      await prisma.agentSummary.create({
        data: {
          userId: userId,
          summary: summary,
        },
      });
    }

    console.log(`[Memory Layer] ✅ Résumé psychologique enregistré`);
    return summary;
  } catch (error) {
    console.error(`[Memory Layer] ❌ Erreur:`, error.message);
    throw error;
  }
}

export default {
  getUserProfile,
  matchMVP,
  buildAgentSummaryForUser,
  ensureAgentSummary,
  simulateAgentConversation,
  arbitrateMatchFromAgents,
  // NOUVELLES FONCTIONS V2
  matchWithMultiAgents,
  buildOrUpdateAgentSummary,
};
