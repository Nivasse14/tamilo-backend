/**
 * CLIENT OPENAI
 * 
 * Ce module encapsule toutes les interactions avec l'API OpenAI.
 * Il fournit une interface simple pour appeler les modèles de chat.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialisation du client OpenAI avec la clé API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Appelle un modèle de chat OpenAI avec des prompts système et utilisateur
 * 
 * @param {Object} params - Paramètres de l'appel
 * @param {string} params.systemPrompt - Le prompt système qui définit le comportement de l'IA
 * @param {string} params.userPrompt - Le message de l'utilisateur/la requête
 * @param {string} [params.model='gpt-4-turbo-preview'] - Le modèle OpenAI à utiliser
 * @param {number} [params.temperature=0.7] - Température (0-2) pour contrôler la créativité
 * @returns {Promise<string>} - Le contenu de la réponse de l'IA
 * @throws {Error} - Si l'appel API échoue
 */
export async function callChatModel({
  systemPrompt,
  userPrompt,
  model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  temperature = 0.7,
}) {
  try {
    console.log(`[AI] Appel au modèle ${model}...`);
    
    // Création de la requête de completion de chat
    const completion = await openai.chat.completions.create({
      model: model,
      temperature: temperature,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extraction du contenu de la réponse
    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('Aucune réponse reçue du modèle OpenAI');
    }

    console.log(`[AI] Réponse reçue (${responseContent.length} caractères)`);
    
    return responseContent;
  } catch (error) {
    console.error('[AI] Erreur lors de l\'appel à OpenAI:', error.message);
    
    // Gestion spécifique des erreurs OpenAI
    if (error.status === 401) {
      throw new Error('Clé API OpenAI invalide. Vérifiez votre OPENAI_API_KEY dans .env');
    } else if (error.status === 429) {
      throw new Error('Limite de quota OpenAI atteinte. Vérifiez votre compte OpenAI');
    } else if (error.status === 500) {
      throw new Error('Erreur serveur OpenAI. Réessayez dans quelques instants');
    }
    
    throw error;
  }
}

/**
 * Vérifie que la clé API OpenAI est configurée
 * @returns {boolean} - True si la clé est présente
 */
export function isOpenAIConfigured() {
  return !!process.env.OPENAI_API_KEY;
}

export default {
  callChatModel,
  isOpenAIConfigured,
};
