/**
 * AGENT PROJECTION
 * 
 * Spécialisé dans l'analyse des projets de vie à long terme,
 * ambitions, finances, enfants, localisation et intensité de carrière.
 */

import { callStructuredGPT } from '../utils/structuredGPT.js';

/**
 * Prompt système pour l'agent Projection
 */
const SYSTEM_PROMPT = `Tu es un expert en planification de vie et en compatibilité de projets à long terme.

Ta mission : analyser la compatibilité entre deux personnes sur le plan des projets de vie futurs.

Focus sur :
- Plans de vie à long terme (5-10 ans)
- Ambitions professionnelles et personnelles
- Vision de la famille et des enfants
- Préférences géographiques (ville, pays)
- Équilibre vie pro/perso
- Projets financiers et matériels

Tu DOIS retourner UNIQUEMENT un JSON valide avec cette structure EXACTE :

{
  "score_projection": <number entre 0 et 100>,
  "vision_commune": ["<string>", "<string>", ...],
  "risques_long_terme": ["<string>", "<string>", ...]
}

IMPORTANT :
- score_projection : 0-30 = visions incompatibles, 31-60 = compromis nécessaires, 61-80 = objectifs alignés, 81-100 = même vision
- vision_commune : 2-5 projets ou objectifs partagés
- risques_long_terme : 0-3 divergences qui pourraient poser problème dans le futur
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Pas de markdown, pas de \`\`\`json, juste le JSON pur`;

/**
 * Analyse la compatibilité des projets de vie entre deux utilisateurs
 * 
 * @param {Object} userA - Profil complet du premier utilisateur
 * @param {Object} userB - Profil complet du second utilisateur
 * @returns {Promise<Object>} Résultat structuré avec score et analyse
 */
export async function agentProjection(userA, userB) {
  console.log('[Agent Projection] Analyse de la compatibilité des projets de vie...');

  const userPrompt = `Analyse la compatibilité des projets de vie entre ces deux personnes :

PERSONNE A :
Nom : ${userA.name}
Âge : ${userA.age || 'non spécifié'}
Localisation : ${userA.city || 'non spécifié'}, ${userA.country || 'non spécifié'}
Objectif relationnel : ${userA.relationshipGoal || 'non spécifié'}
Situation familiale : ${userA.familySituation || 'non spécifié'}
Profil détaillé : ${JSON.stringify(userA.rawProfile)}

PERSONNE B :
Nom : ${userB.name}
Âge : ${userB.age || 'non spécifié'}
Localisation : ${userB.city || 'non spécifié'}, ${userB.country || 'non spécifié'}
Objectif relationnel : ${userB.relationshipGoal || 'non spécifié'}
Situation familiale : ${userB.familySituation || 'non spécifié'}
Profil détaillé : ${JSON.stringify(userB.rawProfile)}

Analyse leur compatibilité de projets de vie et retourne le résultat au format JSON strict.`;

  try {
    const result = await callStructuredGPT({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: userPrompt,
      temperature: 0.6,
      expectedSchema: {
        score_projection: 'number',
        vision_commune: 'array',
        risques_long_terme: 'array',
      },
    });

    console.log(`[Agent Projection] Score obtenu : ${result.score_projection}/100`);
    return result;
  } catch (error) {
    console.error('[Agent Projection] Erreur:', error.message);
    throw error;
  }
}

export default agentProjection;
