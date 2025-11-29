/**
 * UTILITAIRE POUR APPELS GPT STRUCTURÉS
 * 
 * Wrapper autour de l'OpenAI API pour garantir des réponses JSON valides.
 * Gère la validation, le retry et le fallback.
 */

import { callChatModel } from '../services/aiClient.js';

/**
 * Appelle GPT avec validation stricte du JSON retourné
 * 
 * @param {Object} params - Paramètres de l'appel
 * @param {string} params.systemPrompt - Prompt système
 * @param {string} params.userPrompt - Prompt utilisateur
 * @param {number} [params.temperature=0.7] - Température du modèle
 * @param {string} [params.model='gpt-4-turbo-preview'] - Modèle à utiliser
 * @param {Object} [params.expectedSchema] - Schéma attendu pour validation
 * @param {number} [params.maxRetries=2] - Nombre de tentatives en cas d'échec
 * @returns {Promise<Object>} Objet JSON parsé et validé
 * @throws {Error} Si impossible d'obtenir un JSON valide après les retries
 */
export async function callStructuredGPT({
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  model = 'gpt-4-turbo-preview',
  expectedSchema = null,
  maxRetries = 2,
}) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[StructuredGPT] Tentative ${attempt}/${maxRetries}...`);

      // Appel au modèle
      const rawResponse = await callChatModel({
        systemPrompt,
        userPrompt,
        model,
        temperature,
      });

      // Nettoyage de la réponse (au cas où le modèle ajoute du markdown)
      let cleanedResponse = rawResponse.trim();

      // Retirer les balises markdown si présentes
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Parser le JSON
      const parsed = JSON.parse(cleanedResponse);

      // Validation du schéma si fourni
      if (expectedSchema) {
        validateSchema(parsed, expectedSchema);
      }

      console.log('[StructuredGPT] ✅ JSON valide obtenu');
      return parsed;
    } catch (error) {
      lastError = error;
      console.warn(`[StructuredGPT] ⚠️ Tentative ${attempt} échouée :`, error.message);

      // Si c'est la dernière tentative, on throw
      if (attempt === maxRetries) {
        console.error('[StructuredGPT] ❌ Échec après toutes les tentatives');
        throw new Error(`Impossible d'obtenir un JSON valide après ${maxRetries} tentatives : ${error.message}`);
      }

      // Sinon, attendre un peu avant de retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw lastError;
}

/**
 * Valide que l'objet parsé respecte le schéma attendu
 * 
 * @param {Object} obj - Objet à valider
 * @param {Object} schema - Schéma attendu { key: 'type' }
 * @throws {Error} Si la validation échoue
 */
function validateSchema(obj, schema) {
  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in obj)) {
      throw new Error(`Clé manquante dans le JSON : "${key}"`);
    }

    const actualType = Array.isArray(obj[key]) ? 'array' : typeof obj[key];

    if (actualType !== expectedType) {
      throw new Error(
        `Type incorrect pour "${key}" : attendu ${expectedType}, reçu ${actualType}`
      );
    }

    // Validation supplémentaire pour les arrays
    if (expectedType === 'array' && obj[key].length === 0) {
      console.warn(`[Validation] Array vide pour "${key}" (accepté mais à surveiller)`);
    }

    // Validation supplémentaire pour les numbers (score entre 0 et 100)
    if (expectedType === 'number' && key.includes('score')) {
      if (obj[key] < 0 || obj[key] > 100) {
        throw new Error(`Score "${key}" hors limites : ${obj[key]} (attendu 0-100)`);
      }
    }
  }

  console.log('[Validation] ✅ Schéma validé');
}

export default callStructuredGPT;
