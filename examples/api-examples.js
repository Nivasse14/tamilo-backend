/**
 * EXEMPLES D'APPELS API
 * 
 * Ce fichier contient des exemples de code JavaScript pour interagir
 * avec l'API IA Tamilo Matchmaker.
 */

const API_BASE_URL = 'http://localhost:3000';

// IDs des utilisateurs de test (après avoir exécuté le seed)
const USER_IDS = {
  sophie: '550e8400-e29b-41d4-a716-446655440001',
  ravi: '550e8400-e29b-41d4-a716-446655440002',
  marie: '550e8400-e29b-41d4-a716-446655440003',
  priya: '550e8400-e29b-41d4-a716-446655440004',
  thomas: '550e8400-e29b-41d4-a716-446655440005',
};

/**
 * Exemple 1 : Health Check
 */
async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('Health Check:', data);
    return data;
  } catch (error) {
    console.error('Erreur health check:', error);
  }
}

/**
 * Exemple 2 : Matching MVP
 */
async function matchMVP(userAId, userBId) {
  try {
    const response = await fetch(`${API_BASE_URL}/match/mvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAId: userAId,
        userBId: userBId,
      }),
    });

    const data = await response.json();
    console.log('Résultat Matching MVP:');
    console.log('Mode:', data.result.mode);
    console.log('Entre:', data.result.userA.name, 'et', data.result.userB.name);
    console.log('\nAnalyse IA:');
    console.log(data.result.analysis);
    
    return data;
  } catch (error) {
    console.error('Erreur matching MVP:', error);
  }
}

/**
 * Exemple 3 : Matching avec Agents
 */
async function matchAgents(userAId, userBId) {
  try {
    const response = await fetch(`${API_BASE_URL}/match/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAId: userAId,
        userBId: userBId,
      }),
    });

    const data = await response.json();
    console.log('Résultat Matching Agents:');
    console.log('Mode:', data.fullResult.mode);
    console.log('Entre:', data.fullResult.userA.name, 'et', data.fullResult.userB.name);
    console.log('\n=== CONVERSATION ENTRE AGENTS ===');
    console.log(data.rawConversation);
    console.log('\n=== VERDICT FINAL ===');
    console.log(data.verdict);
    
    return data;
  } catch (error) {
    console.error('Erreur matching agents:', error);
  }
}

/**
 * Exemple 4 : Récupérer un profil utilisateur
 */
async function getUserProfile(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
    const data = await response.json();
    console.log('Profil utilisateur:');
    console.log(JSON.stringify(data.profile, null, 2));
    return data;
  } catch (error) {
    console.error('Erreur récupération profil:', error);
  }
}

/**
 * Exemple 5 : Regénérer le résumé d'agent
 */
async function rebuildAgentSummary(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/rebuild/${userId}`, {
      method: 'POST',
    });
    const data = await response.json();
    console.log('Résumé d\'agent régénéré:');
    console.log(JSON.stringify(data.agentSummary, null, 2));
    return data;
  } catch (error) {
    console.error('Erreur rebuild agent:', error);
  }
}

/**
 * SCÉNARIOS DE TEST
 */

// Test 1 : Matching très compatible (Sophie x Ravi)
async function testCompatibleMatch() {
  console.log('\n🧪 TEST 1 : Matching très compatible (Sophie x Ravi)\n');
  await matchMVP(USER_IDS.sophie, USER_IDS.ravi);
}

// Test 2 : Matching à explorer (Sophie x Marie)
async function testExploreMatch() {
  console.log('\n🧪 TEST 2 : Matching à explorer (Sophie x Marie)\n');
  await matchMVP(USER_IDS.sophie, USER_IDS.marie);
}

// Test 3 : Matching peu compatible (Sophie x Thomas)
async function testIncompatibleMatch() {
  console.log('\n🧪 TEST 3 : Matching peu compatible (Sophie x Thomas)\n');
  await matchMVP(USER_IDS.sophie, USER_IDS.thomas);
}

// Test 4 : Matching avec agents (Priya x Ravi)
async function testAgentMatch() {
  console.log('\n🧪 TEST 4 : Matching avec agents (Priya x Ravi)\n');
  await matchAgents(USER_IDS.priya, USER_IDS.ravi);
}

// Test 5 : Récupération de profil
async function testGetProfile() {
  console.log('\n🧪 TEST 5 : Récupération du profil de Sophie\n');
  await getUserProfile(USER_IDS.sophie);
}

/**
 * Exécution de tous les tests
 */
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  TESTS DE L\'API IA TAMILO MATCHMAKER');
  console.log('═══════════════════════════════════════════════════');
  
  // Vérifier que le serveur est accessible
  const health = await healthCheck();
  if (!health || health.status !== 'ok') {
    console.error('❌ Le serveur ne répond pas correctement');
    return;
  }
  
  console.log('\n✅ Serveur accessible, lancement des tests...\n');
  
  // Exécuter les tests séquentiellement pour éviter de surcharger l'API OpenAI
  await testCompatibleMatch();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Pause de 2 secondes
  
  await testExploreMatch();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testIncompatibleMatch();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testGetProfile();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test avec agents (plus long, attend 3 appels IA)
  await testAgentMatch();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  TOUS LES TESTS SONT TERMINÉS');
  console.log('═══════════════════════════════════════════════════\n');
}

/**
 * UTILISATION
 * 
 * Dans Node.js (avec support des modules ES6) :
 * 
 * 1. Assurez-vous que le serveur tourne : npm start
 * 2. Exécutez ce fichier : node examples/api-examples.js
 * 
 * Dans un navigateur :
 * 
 * 1. Ouvrez la console du navigateur
 * 2. Copiez-collez les fonctions ci-dessus
 * 3. Appelez les fonctions individuellement :
 *    - healthCheck()
 *    - matchMVP(USER_IDS.sophie, USER_IDS.ravi)
 *    - matchAgents(USER_IDS.priya, USER_IDS.ravi)
 *    - getUserProfile(USER_IDS.sophie)
 * 
 * Ou exécutez tous les tests :
 *    - runAllTests()
 */

// Si exécuté directement avec Node.js
if (typeof module !== 'undefined' && require.main === module) {
  runAllTests();
}

// Export pour utilisation en tant que module
if (typeof module !== 'undefined') {
  module.exports = {
    healthCheck,
    matchMVP,
    matchAgents,
    getUserProfile,
    rebuildAgentSummary,
    runAllTests,
    USER_IDS,
  };
}
