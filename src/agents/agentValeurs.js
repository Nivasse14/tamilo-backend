/**
 * AGENT VALEURS
 * 
 * Spécialisé dans l'analyse des valeurs, religion/spiritualité,
 * famille, style de vie et priorités de vie.
 */

import { callStructuredGPT } from '../utils/structuredGPT.js';

/**
 * Prompt système pour l'agent Valeurs
 */
const SYSTEM_PROMPT = `Tu es un expert en compatibilité de valeurs et de modes de vie.

Ta mission : analyser la compatibilité entre deux personnes sur le plan des valeurs fondamentales.

Focus sur :
- Valeurs centrales et principes de vie
- Religion et spiritualité
- Importance de la famille
- Style de vie et priorités quotidiennes
- Vision du monde et convictions

Tu DOIS retourner UNIQUEMENT un JSON valide avec cette structure EXACTE :

{
  "score_valeurs": <number entre 0 et 100>,
  "compatibilites_clefs": ["<string>", "<string>", ...],
  "conflits_potentiels": ["<string>", "<string>", ...]
}

IMPORTANT :
- score_valeurs : 0-30 = valeurs incompatibles, 31-60 = différences négociables, 61-80 = valeurs alignées, 81-100 = harmonie parfaite
- compatibilites_clefs : 2-5 valeurs ou principes partagés
- conflits_potentiels : 0-3 divergences possibles (peut être vide si tout est aligné)
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Pas de markdown, pas de \`\`\`json, juste le JSON pur`;

/**
 * Analyse la compatibilité des valeurs entre deux utilisateurs
 * 
 * @param {Object} userA - Profil complet du premier utilisateur
 * @param {Object} userB - Profil complet du second utilisateur
 * @returns {Promise<Object>} Résultat structuré avec score et analyse
 */
export async function agentValeurs(userA, userB) {
  console.log('[Agent Valeurs] Analyse de la compatibilité des valeurs...');

  const userPrompt = `Analyse la compatibilité des valeurs entre ces deux personnes :

PERSONNE A :
Nom : ${userA.name}
Valeurs centrales : ${JSON.stringify(userA.values)}
Non négociables : ${JSON.stringify(userA.nonNegotiables)}
Ouverture culturelle : ${JSON.stringify(userA.cultureOpenness)}
Objectif relationnel : ${userA.relationshipGoal || 'non spécifié'}

PERSONNE B :
Nom : ${userB.name}
Valeurs centrales : ${JSON.stringify(userB.values)}
Non négociables : ${JSON.stringify(userB.nonNegotiables)}
Ouverture culturelle : ${JSON.stringify(userB.cultureOpenness)}
Objectif relationnel : ${userB.relationshipGoal || 'non spécifié'}

Analyse leur compatibilité de valeurs et retourne le résultat au format JSON strict.`;

  try {
    const result = await callStructuredGPT({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: userPrompt,
      temperature: 0.6,
      expectedSchema: {
        score_valeurs: 'number',
        compatibilites_clefs: 'array',
        conflits_potentiels: 'array',
      },
    });

    console.log(`[Agent Valeurs] Score obtenu : ${result.score_valeurs}/100`);
    return result;
  } catch (error) {
    console.error('[Agent Valeurs] Erreur:', error.message);
    throw error;
  }
}

export default agentValeurs;
