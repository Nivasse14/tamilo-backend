/**
 * CONNEXION PRISMA
 * 
 * Ce module initialise et exporte le client Prisma pour l'accès à la base de données.
 * Il garantit une seule instance du client pour toute l'application.
 */

import { PrismaClient } from '@prisma/client';

// Initialisation du client Prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Gestion propre de la fermeture de la connexion
process.on('beforeExit', async () => {
  console.log('[DB] Fermeture de la connexion Prisma...');
  await prisma.$disconnect();
});

export default prisma;
