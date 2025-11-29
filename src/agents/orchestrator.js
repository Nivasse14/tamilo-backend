/**
 * ORCHESTRATEUR MULTI-AGENTS
 * 
 * Coordonne les 4 agents spécialisés et produit une analyse finale structurée.
 */

import agentProfil from './agentProfil.js';
import agentValeurs from './agentValeurs.js';
import agentProjection from './agentProjection.js';
import agentRisques from './agentRisques.js';
import { callStructuredGPT } from '../utils/structuredGPT.js';

/**
 * Prompt système pour l'orchestrateur final
 */
const SYSTEM_PROMPT_ORCHESTRATOR = `Tu es l'orchestrateur final d'un système multi-agents de matching amoureux.

Tu reçois les résultats de 4 agents spécialisés :
- Agent Profil : compatibilité psychologique et émotionnelle
- Agent Valeurs : compatibilité des valeurs et modes de vie
- Agent Projection : compatibilité des projets de vie à long terme
- Agent Risques : détection de red flags et risques

Ta mission : synthétiser ces analyses pour produire un verdict final structuré et nuancé.

Tu DOIS retourner UNIQUEMENT un JSON valide avec cette structure EXACTE :

{
  "verdict": "<MATCH|NO_MATCH|ATTENTION>",
  "score_global": <number entre 0 et 100>,
  "resume_executif": "<string: résumé en 3-5 phrases du potentiel de cette relation>",
  "forces_majeures": ["<string>", "<string>", ...],
  "defis_principaux": ["<string>", "<string>", ...],
  "recommandation": "<string: conseil personnalisé pour ce couple>"
}

CRITÈRES DE VERDICT :
- MATCH : score_global >= 70 ET score_risques >= 60 (peu de red flags)
- NO_MATCH : score_global < 50 OU score_risques < 40 (red flags majeurs)
- ATTENTION : tous les autres cas (potentiel mais vigilance requise)

IMPORTANT :
- score_global : moyenne pondérée intelligente des 4 scores (privilégie risques et valeurs)
- resume_executif : ton bienveillant mais honnête
- forces_majeures : 2-4 atouts concrets de ce couple
- defis_principaux : 1-3 défis à anticiper
- recommandation : conseil actionnable et personnalisé
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Pas de markdown, pas de \`\`\`json, juste le JSON pur`;

/**
 * Fonction principale : orchestre les 4 agents et produit le verdict final
 * 
 * @param {number} userAId - ID du premier utilisateur
 * @param {number} userBId - ID du second utilisateur
 * @param {Object} db - Instance Prisma client
 * @returns {Promise<Object>} Résultat structuré complet du matching
 */
export async function matchTwoUsers(userAId, userBId, db) {
  console.log(`\n[Orchestrateur] Lancement du matching multi-agents entre User ${userAId} et User ${userBId}`);

  // 1. Récupérer les profils complets
  const [userA, userB] = await Promise.all([
    db.user.findUnique({ where: { id: userAId } }),
    db.user.findUnique({ where: { id: userBId } }),
  ]);

  if (!userA || !userB) {
    throw new Error(`User ${!userA ? userAId : userBId} introuvable`);
  }

  console.log(`[Orchestrateur] Profils récupérés : ${userA.name} et ${userB.name}`);

  // 2. Appeler les 4 agents EN PARALLÈLE
  console.log('[Orchestrateur] Lancement des 4 agents en parallèle...');
  const startTime = Date.now();

  const [
    resultProfil,
    resultValeurs,
    resultProjection,
    resultRisques,
  ] = await Promise.all([
    agentProfil(userA, userB),
    agentValeurs(userA, userB),
    agentProjection(userA, userB),
    agentRisques(userA, userB),
  ]);

  const agentDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[Orchestrateur] 4 agents terminés en ${agentDuration}s`);

  // 3. Préparer le résumé pour l'orchestrateur final
  const agentsSummary = {
    profil: resultProfil,
    valeurs: resultValeurs,
    projection: resultProjection,
    risques: resultRisques,
  };

  // 4. Appeler l'orchestrateur final pour le verdict
  console.log('[Orchestrateur] Synthèse finale en cours...');

  const userPrompt = `Voici les résultats des 4 agents spécialisés pour ${userA.name} et ${userB.name} :

AGENT PROFIL (score: ${resultProfil.score_profil}/100) :
${JSON.stringify(resultProfil, null, 2)}

AGENT VALEURS (score: ${resultValeurs.score_valeurs}/100) :
${JSON.stringify(resultValeurs, null, 2)}

AGENT PROJECTION (score: ${resultProjection.score_projection}/100) :
${JSON.stringify(resultProjection, null, 2)}

AGENT RISQUES (score: ${resultRisques.score_risques}/100) :
${JSON.stringify(resultRisques, null, 2)}

Synthétise ces analyses et produis le verdict final au format JSON strict.`;

  const finalVerdict = await callStructuredGPT({
    systemPrompt: SYSTEM_PROMPT_ORCHESTRATOR,
    userPrompt: userPrompt,
    temperature: 0.7,
    expectedSchema: {
      verdict: 'string',
      score_global: 'number',
      resume_executif: 'string',
      forces_majeures: 'array',
      defis_principaux: 'array',
      recommandation: 'string',
    },
  });

  // 5. Construire la réponse complète
  const response = {
    userA: { id: userA.id, name: userA.name },
    userB: { id: userB.id, name: userB.name },
    timestamp: new Date().toISOString(),
    agents: agentsSummary,
    verdict: finalVerdict,
    meta: {
      duration_seconds: ((Date.now() - startTime) / 1000).toFixed(2),
      mode: 'MULTI_AGENT_V2',
    },
  };

  console.log(`[Orchestrateur] Verdict final : ${finalVerdict.verdict} (${finalVerdict.score_global}/100)`);
  console.log(`[Orchestrateur] Matching terminé en ${response.meta.duration_seconds}s\n`);

  return response;
}

export default matchTwoUsers;
