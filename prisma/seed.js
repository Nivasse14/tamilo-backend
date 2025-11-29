/**
 * SCRIPT DE SEED - DONNÉES DE TEST
 * 
 * Ce script remplit la base de données avec des utilisateurs de test
 * pour pouvoir tester rapidement les fonctionnalités de matching.
 * 
 * Utilisation : npm run prisma:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Données de test : profils utilisateurs
 */
const testUsers = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Sophie Dubois',
    age: 28,
    gender: 'F',
    city: 'Paris',
    country: 'France',
    values: ['respect', 'famille', 'ambition', 'honnêteté'],
    nonNegotiables: ['respect absolu', 'loyauté', 'stabilité émotionnelle', 'transparence'],
    emotionalNeeds: ['sécurité affective', 'communication ouverte', 'soutien mutuel'],
    redFlags: ['violence (verbale ou physique)', 'mensonges répétés', 'manque de respect'],
    relationshipGoal: 'relation sérieuse menant au mariage',
    cultureOpenness: ['culture française', 'culture tamoule', 'ouverture interculturelle'],
    familySituation: 'sans enfant, souhaite en avoir',
    communicationStyle: 'directe mais douce, préfère parler des problèmes',
    rawProfile: {
      bio: 'Professionnelle ambitieuse cherchant une relation stable et respectueuse. J\'accorde une grande importance aux valeurs familiales et à l\'intelligence émotionnelle.',
      interests: ['lecture', 'cuisine', 'voyages', 'yoga'],
      profession: 'Chef de projet marketing',
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Ravi Kumar',
    age: 30,
    gender: 'M',
    city: 'Lyon',
    country: 'France',
    values: ['respect', 'famille', 'tradition', 'progression personnelle'],
    nonNegotiables: ['respect de la culture', 'loyauté', 'ambition', 'douceur'],
    emotionalNeeds: ['compréhension', 'stabilité', 'encouragement'],
    redFlags: ['irrespect culturel', 'instabilité émotionnelle', 'manque d\'ambition'],
    relationshipGoal: 'mariage et fondation d\'une famille',
    cultureOpenness: ['culture tamoule', 'culture française', 'respect des traditions'],
    familySituation: 'sans enfant, famille très importante',
    communicationStyle: 'calme et réfléchi, préfère discuter calmement',
    rawProfile: {
      bio: 'Ingénieur informatique attaché à ses racines tamoules tout en étant ouvert à la culture française. Je recherche une partenaire qui partage mes valeurs familiales.',
      interests: ['technologie', 'cricket', 'cuisine indienne', 'famille'],
      profession: 'Ingénieur logiciel senior',
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Marie Laurent',
    age: 32,
    gender: 'F',
    city: 'Marseille',
    country: 'France',
    values: ['liberté', 'créativité', 'spontanéité', 'indépendance'],
    nonNegotiables: ['respect personnel', 'espace individuel'],
    emotionalNeeds: ['liberté d\'expression', 'respect de l\'indépendance'],
    redFlags: ['possessivité excessive', 'contrôle', 'jalousie maladive'],
    relationshipGoal: 'relation sérieuse mais avec liberté',
    cultureOpenness: ['toutes cultures'],
    familySituation: 'célibataire sans enfant, pas de projet immédiat',
    communicationStyle: 'spontanée et directe',
    rawProfile: {
      bio: 'Artiste indépendante qui valorise la liberté et la créativité. Je cherche quelqu\'un qui respecte mon besoin d\'espace.',
      interests: ['art', 'musique', 'voyages solo', 'photographie'],
      profession: 'Photographe freelance',
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Priya Sharma',
    age: 27,
    gender: 'F',
    city: 'Toulouse',
    country: 'France',
    values: ['respect', 'famille', 'éducation', 'ambition', 'culture'],
    nonNegotiables: ['respect absolu', 'intelligence émotionnelle', 'ambition claire', 'respect culturel'],
    emotionalNeeds: ['sécurité', 'transparence totale', 'communication authentique'],
    redFlags: ['violence verbale', 'mensonge', 'manque de respect pour la famille'],
    relationshipGoal: 'mariage traditionnel avec valeurs modernes',
    cultureOpenness: ['culture tamoule', 'culture française', 'biculturelle'],
    familySituation: 'sans enfant, veut des enfants',
    communicationStyle: 'douce mais ferme, valorise l\'honnêteté',
    rawProfile: {
      bio: 'Double culture franco-tamoule, je cherche un partenaire qui comprend et respecte mes deux identités. L\'éducation et l\'ambition sont essentielles pour moi.',
      interests: ['lecture', 'danse classique indienne', 'cuisine fusion', 'bénévolat'],
      profession: 'Avocate en droit international',
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Thomas Mercier',
    age: 35,
    gender: 'M',
    city: 'Nantes',
    country: 'France',
    values: ['stabilité', 'confort', 'routine'],
    nonNegotiables: ['tranquillité'],
    emotionalNeeds: ['calme', 'prévisibilité'],
    redFlags: ['drama', 'instabilité', 'trop d\'émotion'],
    relationshipGoal: 'relation tranquille et stable',
    cultureOpenness: ['culture française uniquement'],
    familySituation: 'divorcé avec un enfant',
    communicationStyle: 'réservé, évite les conflits',
    rawProfile: {
      bio: 'Homme calme cherchant une vie stable sans complications. Je préfère la routine et la tranquillité.',
      interests: ['football à la TV', 'bricolage', 'jardinage'],
      profession: 'Comptable',
    },
  },
];

/**
 * Fonction principale de seed
 */
async function main() {
  console.log('🌱 Démarrage du seed de la base de données...\n');

  // Nettoyage optionnel (commentez ces lignes si vous voulez conserver les données existantes)
  console.log('🗑️  Nettoyage des données existantes...');
  await prisma.matchLog.deleteMany({});
  await prisma.agentSummary.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✓ Nettoyage terminé\n');

  // Création des utilisateurs
  console.log('👥 Création des utilisateurs de test...');
  for (const userData of testUsers) {
    const user = await prisma.user.create({
      data: userData,
    });
    console.log(`  ✓ ${user.name} (${user.id})`);
  }

  console.log('\n✨ Seed terminé avec succès!\n');
  console.log('📊 Résumé :');
  console.log(`  • ${testUsers.length} utilisateurs créés`);
  console.log('\n💡 Suggestions de tests :');
  console.log('\n1. Matching MVP compatible (Sophie x Ravi) :');
  console.log('   POST /match/mvp');
  console.log('   {');
  console.log('     "userAId": "550e8400-e29b-41d4-a716-446655440001",');
  console.log('     "userBId": "550e8400-e29b-41d4-a716-446655440002"');
  console.log('   }\n');
  console.log('2. Matching MVP à explorer (Sophie x Marie) :');
  console.log('   POST /match/mvp');
  console.log('   {');
  console.log('     "userAId": "550e8400-e29b-41d4-a716-446655440001",');
  console.log('     "userBId": "550e8400-e29b-41d4-a716-446655440003"');
  console.log('   }\n');
  console.log('3. Matching Agents (Priya x Ravi) :');
  console.log('   POST /match/agents');
  console.log('   {');
  console.log('     "userAId": "550e8400-e29b-41d4-a716-446655440004",');
  console.log('     "userBId": "550e8400-e29b-41d4-a716-446655440002"');
  console.log('   }\n');
  console.log('4. Matching peu compatible (Sophie x Thomas) :');
  console.log('   POST /match/mvp');
  console.log('   {');
  console.log('     "userAId": "550e8400-e29b-41d4-a716-446655440001",');
  console.log('     "userBId": "550e8400-e29b-41d4-a716-446655440005"');
  console.log('   }\n');
}

// Exécution du seed
main()
  .catch((error) => {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
