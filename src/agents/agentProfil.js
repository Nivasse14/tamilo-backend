/**
 * AGENT PROFIL
 * 
 * Spécialisé dans l'analyse de la personnalité, du style d'attachement,
 * des traits émotionnels et du style d'interaction entre deux personnes.
 */

import { callStructuredGPT } from '../utils/structuredGPT.js';

/**
 * Prompt système pour l'agent Profil
 */
const SYSTEM_PROMPT = `Tu es un expert en psychologie relationnelle et en compatibilité de personnalités.

Ta mission : analyser la compatibilité entre deux profils sur le plan psychologique et émotionnel.

Focus sur :
- Personnalité et tempérament
- Style d'attachement (sécure, anxieux, évitant)
- Traits émotionnels et maturité
- Style d'interaction et de communication
- Dynamique relationnelle potentielle

Tu DOIS retourner UNIQUEMENT un JSON valide avec cette structure EXACTE :

{
  "score_profil": <number entre 0 et 100>,
  "resume": "<string: résumé en 2-3 phrases de la compatibilité psychologique>",
  "points_forts": ["<string>", "<string>", ...],
  "points_de_vigilance": ["<string>", "<string>", ...]
}

IMPORTANT :
- score_profil : 0-30 = incompatible, 31-60 = modéré, 61-80 = bon, 81-100 = excellent
- resume : concis et factuel
- points_forts : 2-4 éléments positifs concrets
- points_de_vigilance : 1-3 points à surveiller (même si globalement compatible)
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Pas de markdown, pas de \`\`\`json, juste le JSON pur`;

/**
 * Analyse la compatibilité psychologique et émotionnelle entre deux utilisateurs
 * 
 * @param {Object} userA - Profil complet du premier utilisateur
 * @param {Object} userB - Profil complet du second utilisateur
 * @returns {Promise<Object>} Résultat structuré avec score et analyse
 */
export async function agentProfil(userA, userB) {
  console.log('[Agent Profil] Analyse de la compatibilité psychologique...');

  const userPrompt = `Analyse la compatibilité psychologique entre ces deux personnes :

PERSONNE A :
Nom : ${userA.name}
Âge : ${userA.age || 'non spécifié'}
Besoins émotionnels : ${JSON.stringify(userA.emotionalNeeds)}
Style de communication : ${userA.communicationStyle || 'non spécifié'}
Profil détaillé : ${JSON.stringify(userA.rawProfile)}

PERSONNE B :
Nom : ${userB.name}
Âge : ${userB.age || 'non spécifié'}
Besoins émotionnels : ${JSON.stringify(userB.emotionalNeeds)}
Style de communication : ${userB.communicationStyle || 'non spécifié'}
Profil détaillé : ${JSON.stringify(userB.rawProfile)}

Analyse leur compatibilité psychologique et retourne le résultat au format JSON strict.`;

  try {
    const result = await callStructuredGPT({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: userPrompt,
      temperature: 0.7,
      expectedSchema: {
        score_profil: 'number',
        resume: 'string',
        points_forts: 'array',
        points_de_vigilance: 'array',
      },
    });

    console.log(`[Agent Profil] Score obtenu : ${result.score_profil}/100`);
    return result;
  } catch (error) {
    console.error('[Agent Profil] Erreur:', error.message);
    throw error;
  }
}

export default agentProfil;
