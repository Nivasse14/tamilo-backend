/**
 * AGENT RISQUES
 * 
 * Spécialisé dans la détection des red flags, patterns toxiques,
 * dealbreakers et risques émotionnels ou pratiques.
 */

import { callStructuredGPT } from '../utils/structuredGPT.js';

/**
 * Prompt système pour l'agent Risques
 */
const SYSTEM_PROMPT = `Tu es un expert en détection de risques relationnels et de red flags.

Ta mission : identifier les risques potentiels dans la compatibilité entre deux personnes.

Focus sur :
- Red flags comportementaux ou émotionnels
- Patterns toxiques ou destructeurs
- Dealbreakers absolus
- Risques émotionnels (attachement, dépendance, etc.)
- Risques pratiques (incompatibilités majeures)

CRITÈRES DE RED FLAGS PRIORITAIRES (selon Hélène) :
- Manque de respect (ton, comportement, politesse)
- Mensonge ou zones floues
- Manque d'ambition ou de vision
- Instabilité émotionnelle
- Irrespect culturel
- Violence verbale ou physique

Tu DOIS retourner UNIQUEMENT un JSON valide avec cette structure EXACTE :

{
  "score_risques": <number entre 0 et 100>,
  "red_flags": ["<string>", "<string>", ...],
  "points_a_surveiller": ["<string>", "<string>", ...]
}

IMPORTANT :
- score_risques : 0-30 = risques majeurs/dealbreakers, 31-60 = risques modérés, 61-80 = quelques vigilances, 81-100 = aucun risque détecté
- red_flags : 0-3 signaux d'alarme graves (peut être vide si RAS)
- points_a_surveiller : 1-4 éléments à observer sans être bloquants
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Pas de markdown, pas de \`\`\`json, juste le JSON pur`;

/**
 * Analyse les risques potentiels dans la relation entre deux utilisateurs
 * 
 * @param {Object} userA - Profil complet du premier utilisateur
 * @param {Object} userB - Profil complet du second utilisateur
 * @returns {Promise<Object>} Résultat structuré avec score et analyse
 */
export async function agentRisques(userA, userB) {
  console.log('[Agent Risques] Analyse des risques potentiels...');

  const userPrompt = `Analyse les risques potentiels entre ces deux personnes :

PERSONNE A :
Nom : ${userA.name}
Non négociables : ${JSON.stringify(userA.nonNegotiables)}
Red flags identifiés : ${JSON.stringify(userA.redFlags)}
Style de communication : ${userA.communicationStyle || 'non spécifié'}
Profil détaillé : ${JSON.stringify(userA.rawProfile)}

PERSONNE B :
Nom : ${userB.name}
Non négociables : ${JSON.stringify(userB.nonNegotiables)}
Red flags identifiés : ${JSON.stringify(userB.redFlags)}
Style de communication : ${userB.communicationStyle || 'non spécifié'}
Profil détaillé : ${JSON.stringify(userB.rawProfile)}

Identifie les risques et red flags et retourne le résultat au format JSON strict.`;

  try {
    const result = await callStructuredGPT({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: userPrompt,
      temperature: 0.5, // Plus déterministe pour la sécurité
      expectedSchema: {
        score_risques: 'number',
        red_flags: 'array',
        points_a_surveiller: 'array',
      },
    });

    console.log(`[Agent Risques] Score obtenu : ${result.score_risques}/100`);
    return result;
  } catch (error) {
    console.error('[Agent Risques] Erreur:', error.message);
    throw error;
  }
}

export default agentRisques;
