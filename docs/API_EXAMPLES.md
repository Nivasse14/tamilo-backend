# EXEMPLES DE RÉPONSES API

Ce document montre des exemples concrets de réponses que vous obtiendrez de l'API.

---

## 1. Health Check

**Requête :**
```bash
GET http://localhost:3000/health
```

**Réponse (200 OK) :**
```json
{
  "status": "ok",
  "timestamp": "2025-11-29T10:30:45.123Z",
  "database": "connected",
  "openai": "configured"
}
```

**Réponse si problème (503) :**
```json
{
  "status": "error",
  "timestamp": "2025-11-29T10:30:45.123Z",
  "database": "disconnected",
  "error": "Connection refused"
}
```

---

## 2. Matching MVP - Compatible

**Requête :**
```bash
POST http://localhost:3000/match/mvp
Content-Type: application/json

{
  "userAId": "550e8400-e29b-41d4-a716-446655440001",
  "userBId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Réponse (200 OK) :**
```json
{
  "success": true,
  "result": {
    "mode": "MVP",
    "userA": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Sophie Dubois"
    },
    "userB": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Ravi Kumar"
    },
    "analysis": "Verdict : Compatible\n\nRésumé (3 lignes max) :\n- Alignement fort sur les valeurs fondamentales : respect, famille, ambition\n- Excellent potentiel d'harmonie culturelle avec ouverture mutuelle à la culture tamoule et française\n- Intelligence émotionnelle et communication compatibles, avec styles complémentaires\n\nPoints forts :\n- Respect absolu et loyauté prioritaires pour les deux\n- Ambition claire et projets de vie alignés (mariage, famille)\n- Grande ouverture culturelle de part et d'autre\n- Intelligence émotionnelle et maturité émotionnelle présentes\n- Valeurs familiales très fortes et partagées\n- Communication douce et respectueuse dans les deux profils\n\nPoints faibles :\n- Aucun point faible majeur détecté\n- Légère différence d'âge (2 ans) mais non significative\n- Nécessité de clarifier les détails pratiques : où vivre, timing enfants\n\nScore global : 88/100",
    "timestamp": "2025-11-29T10:35:22.456Z"
  }
}
```

---

## 3. Matching MVP - À Explorer

**Requête :**
```bash
POST http://localhost:3000/match/mvp
Content-Type: application/json

{
  "userAId": "550e8400-e29b-41d4-a716-446655440001",
  "userBId": "550e8400-e29b-41d4-a716-446655440003"
}
```

**Réponse (200 OK) :**
```json
{
  "success": true,
  "result": {
    "mode": "MVP",
    "userA": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Sophie Dubois"
    },
    "userB": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Marie Laurent"
    },
    "analysis": "Verdict : À explorer\n\nRésumé (3 lignes max) :\n- Différences notables dans les priorités : Sophie cherche stabilité et engagement fort, Marie valorise liberté et indépendance\n- Respect mutuel présent mais visions relationnelles divergentes\n- Communication compatible mais objectifs de vie à clarifier impérativement\n\nPoints forts :\n- Respect personnel important pour les deux\n- Communication directe et honnête\n- Ouverture d'esprit et absence de jugement\n- Maturité émotionnelle\n\nPoints faibles :\n- Vision de la relation très différente (engagement vs liberté)\n- Besoins émotionnels potentiellement contradictoires (sécurité vs indépendance)\n- Sophie veut des enfants, Marie n'a pas de projet immédiat\n- Risque que Sophie se sente délaissée, Marie se sente étouffée\n- Valeurs familiales centrales pour Sophie, secondaires pour Marie\n\nScore global : 62/100",
    "timestamp": "2025-11-29T10:40:15.789Z"
  }
}
```

---

## 4. Matching MVP - Pas Compatible

**Requête :**
```bash
POST http://localhost:3000/match/mvp
Content-Type: application/json

{
  "userAId": "550e8400-e29b-41d4-a716-446655440001",
  "userBId": "550e8400-e29b-41d4-a716-446655440005"
}
```

**Réponse (200 OK) :**
```json
{
  "success": true,
  "result": {
    "mode": "MVP",
    "userA": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Sophie Dubois"
    },
    "userB": {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "name": "Thomas Mercier"
    },
    "analysis": "Verdict : Pas compatible\n\nRésumé (3 lignes max) :\n- Incompatibilité majeure sur la transparence et la communication émotionnelle (critères non-négociables pour Sophie)\n- Fermeture culturelle de Thomas contraire aux valeurs d'ouverture de Sophie\n- Manque d'ambition et de vision claire chez Thomas, essentiel pour Sophie\n\nPoints forts :\n- Recherche de stabilité présente chez les deux\n- Absence de red flags graves (violence, mensonge)\n\nPoints faibles :\n- Thomas évite les conflits au lieu de communiquer (transparence manquante)\n- Manque d'intelligence émotionnelle chez Thomas (« trop d'émotion » = red flag)\n- Aucune ouverture culturelle chez Thomas (deal breaker pour Sophie)\n- Ambition floue et manque de projets concrets chez Thomas\n- Style de communication incompatible : Sophie directe/communicative, Thomas réservé/évitant\n- Thomas divorcé avec enfant mais ne montre pas la douceur recherchée par Sophie\n- Risque élevé de frustration pour Sophie, sentiment d'étouffement pour Thomas\n\nScore global : 32/100",
    "timestamp": "2025-11-29T10:42:33.234Z"
  }
}
```

---

## 5. Matching Agents - Conversation Complète

**Requête :**
```bash
POST http://localhost:3000/match/agents
Content-Type: application/json

{
  "userAId": "550e8400-e29b-41d4-a716-446655440004",
  "userBId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Réponse (200 OK) :**
```json
{
  "success": true,
  "verdict": "Verdict : Compatible\n\nRésumé (3 lignes max) :\n- Alignement exceptionnel sur tous les critères non-négociables (respect, loyauté, ambition, intelligence émotionnelle)\n- Compatibilité culturelle parfaite avec compréhension profonde de la double culture tamoule-française\n- Projets de vie et valeurs familiales en parfaite harmonie\n\nPoints forts :\n- Respect absolu et profond des deux côtés\n- Intelligence émotionnelle et maturité remarquables\n- Culture tamoule au cœur de leurs identités\n- Ambition claire et projets alignés\n- Communication douce, authentique et mature\n- Valeurs familiales très fortes\n\nPoints faibles :\n- Aucun point faible majeur\n- Attentes élevées des deux côtés (peut créer pression)\n- Nécessité de gérer les attentes familiales respectives\n\nScore global : 92/100",
  "rawConversation": "[Agent_A]\nEn analysant le profil de B pour A (Priya), je constate une compatibilité très prometteuse :\n\n**Compatibilité de valeurs :**\nB (Ravi) partage les valeurs centrales de A : respect absolu, famille, tradition et progression personnelle. L'importance donnée au respect de la culture est un point d'alignement majeur, étant donné que A valorise profondément sa double culture franco-tamoule. Les deux placent la famille au cœur de leurs priorités.\n\n**Compatibilité émotionnelle :**\nLes besoins émotionnels de A (sécurité, transparence totale, communication authentique) semblent bien correspondre au style de communication de B décrit comme « calme et réfléchi, préfère discuter calmement ». La loyauté et la douceur figurent dans les non-négociables de B, ce qui répond directement aux attentes de A.\n\n**Risques et red flags :**\nAucun red flag majeur détecté. Les red flags de A (violence verbale, mensonge, manque de respect pour la famille) ne semblent pas présents dans le profil de B. Au contraire, B valorise le respect culturel et familial.\n\n**Zones de vigilance :**\n- Vérifier que l'ambition de B (progression personnelle) est aussi claire et forte que celle de A, qui est avocate avec de hautes exigences professionnelles\n- S'assurer que la « communication calme » de B n'est pas un évitement des sujets difficiles, car A attend une transparence totale\n- Harmoniser les attentes familiales respectives (notamment sur les traditions)\n\n**Conclusion pour A :** B semble être un excellent match pour A, avec un alignement fort sur la culture, les valeurs familiales et le respect. La compatibilité culturelle est exceptionnelle.\n\n[Agent_B]\nEn analysant le profil de A pour B (Ravi), voici mon évaluation :\n\n**Compatibilité de valeurs :**\nA (Priya) partage pleinement les valeurs essentielles de B : respect, famille, culture tamoule. Le fait qu'elle soit biculturelle et valorise ses deux identités est un atout majeur pour B qui recherche une partenaire respectueuse de ses racines. L'ambition claire de A (avocate) correspond au besoin de B d'avoir une partenaire avec des projets de vie définis.\n\n**Compatibilité émotionnelle :**\nLe style de communication de A (« douce mais ferme, valorise l'honnêteté ») semble parfaitement complémentaire avec celui de B (calme et réfléchi). Les deux privilégient une communication respectueuse et authentique. Les besoins émotionnels de A (sécurité, transparence) correspondent aux valeurs de loyauté et de douceur de B.\n\n**Risques et red flags :**\nAucun red flag identifié dans le profil de A par rapport aux attentes de B. A n'affiche aucun signe d'irrespect culturel, d'instabilité émotionnelle ou de manque d'ambition - qui sont les red flags de B.\n\n**Zones de vigilance :**\n- Le niveau d'exigence professionnel de A (avocate en droit international) pourrait créer des défis d'équilibre vie pro/perso\n- S'assurer que les attentes familiales respectives sont alignées (mariage traditionnel vs moderne)\n- Vérifier que la fermeté de A dans la communication ne soit pas perçue comme de la dureté par B\n- Clarifier les attentes concernant les traditions culturelles spécifiques\n\n**Conclusion pour B :** A représente un match exceptionnel pour B, avec une compréhension profonde de la culture tamoule, une ambition claire et des valeurs familiales très fortes.\n\n[Synthese]\n**Points d'alignement majeurs :**\n1. Culture tamoule au cœur de leurs identités respectives\n2. Valeurs familiales et respect absolu partagés\n3. Ambition claire et projets de vie définis (mariage, enfants)\n4. Intelligence émotionnelle et maturité présentes des deux côtés\n5. Communication authentique et respectueuse valorisée\n6. Loyauté et transparence prioritaires\n\n**Tensions potentielles :**\n1. Niveau d'exigence élevé des deux côtés (perfectionnisme possible)\n2. Gestion des attentes familiales culturelles (peut créer pression)\n3. Équilibre entre carrières ambitieuses et vie de couple\n4. Définition du \"mariage traditionnel\" à clarifier (quelles traditions exactement)\n\n**Risques majeurs :**\nAucun risque majeur identifié. Les profils sont remarquablement compatibles.\n\n**Intuition globale de compatibilité :**\nCe match présente un potentiel exceptionnel. Les deux personnes partagent des valeurs fondamentales identiques, une compréhension culturelle profonde et des projets de vie alignés. La compatibilité culturelle est rare et précieuse. Les zones de vigilance identifiées sont mineures et gérables avec une communication ouverte - que les deux valorisent. La probabilité d'une relation harmonieuse et durable est très élevée.",
  "fullResult": {
    "mode": "AGENT_V2",
    "userA": {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "name": "Priya Sharma"
    },
    "userB": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Ravi Kumar"
    },
    "conversation": "[Agent_A]\n...",
    "verdict": "Verdict : Compatible\n...",
    "timestamp": "2025-11-29T10:50:12.567Z"
  }
}
```

---

## 6. Récupération de Profil

**Requête :**
```bash
GET http://localhost:3000/profile/550e8400-e29b-41d4-a716-446655440001
```

**Réponse (200 OK) :**
```json
{
  "success": true,
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Sophie Dubois",
    "age": 28,
    "gender": "F",
    "city": "Paris",
    "country": "France",
    "values": ["respect", "famille", "ambition", "honnêteté"],
    "nonNegotiables": ["respect absolu", "loyauté", "stabilité émotionnelle", "transparence"],
    "emotionalNeeds": ["sécurité affective", "communication ouverte", "soutien mutuel"],
    "redFlags": ["violence (verbale ou physique)", "mensonges répétés", "manque de respect"],
    "relationshipGoal": "relation sérieuse menant au mariage",
    "cultureOpenness": ["culture française", "culture tamoule", "ouverture interculturelle"],
    "familySituation": "sans enfant, souhaite en avoir",
    "communicationStyle": "directe mais douce, préfère parler des problèmes",
    "rawProfile": {
      "bio": "Professionnelle ambitieuse cherchant une relation stable et respectueuse. J'accorde une grande importance aux valeurs familiales et à l'intelligence émotionnelle.",
      "interests": ["lecture", "cuisine", "voyages", "yoga"],
      "profession": "Chef de projet marketing"
    }
  }
}
```

---

## 7. Régénération d'Agent

**Requête :**
```bash
POST http://localhost:3000/agents/rebuild/550e8400-e29b-41d4-a716-446655440001
```

**Réponse (200 OK) :**
```json
{
  "success": true,
  "message": "Résumé d'agent régénéré avec succès",
  "agentSummary": {
    "id": "abc123-def456-ghi789",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "summary": {
      "core_values": ["respect", "famille", "ambition", "honnêteté", "intelligence émotionnelle"],
      "non_negotiables": ["respect absolu dans la communication", "loyauté et fidélité", "stabilité émotionnelle", "transparence totale"],
      "emotional_needs": ["sécurité affective", "communication ouverte et honnête", "soutien mutuel", "validation émotionnelle"],
      "life_goals": ["relation sérieuse menant au mariage", "fonder une famille avec enfants", "évolution professionnelle", "équilibre vie pro/perso"],
      "red_flags": ["violence verbale ou physique", "mensonges répétés ou dissimulation", "manque de respect", "instabilité émotionnelle chronique"],
      "communication_style": "directe mais douce, privilégie le dialogue pour résoudre les conflits, besoin d'exprimer et d'écouter",
      "relationship_expectations": ["engagement sérieux et stable", "respect des valeurs familiales", "ouverture culturelle", "partenaire ambitieux avec projets clairs", "intelligence émotionnelle développée"],
      "context_notes": "Femme de 28 ans, Chef de projet marketing à Paris. Recherche une relation basée sur le respect mutuel et les valeurs familiales. Très ouverte à la culture tamoule et valorise l'interculturalité. Professionnelle ambitieuse qui cherche un équilibre entre carrière et vie personnelle."
    },
    "createdAt": "2025-11-29T10:55:30.123Z",
    "updatedAt": "2025-11-29T10:55:30.123Z"
  }
}
```

---

## 8. Erreurs Courantes

### Utilisateur non trouvé (404)

**Requête :**
```bash
POST http://localhost:3000/match/mvp
{
  "userAId": "invalid-id",
  "userBId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Réponse (404 Not Found) :**
```json
{
  "error": "Utilisateur non trouvé",
  "details": "Utilisateur invalid-id introuvable"
}
```

### Paramètres manquants (400)

**Requête :**
```bash
POST http://localhost:3000/match/mvp
{
  "userAId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Réponse (400 Bad Request) :**
```json
{
  "error": "Les champs userAId et userBId sont requis"
}
```

### Même utilisateur (400)

**Requête :**
```bash
POST http://localhost:3000/match/mvp
{
  "userAId": "550e8400-e29b-41d4-a716-446655440001",
  "userBId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Réponse (400 Bad Request) :**
```json
{
  "error": "Les deux utilisateurs doivent être différents"
}
```

### Erreur OpenAI (500)

**Réponse (500 Internal Server Error) :**
```json
{
  "error": "Erreur lors du matching MVP",
  "details": "Clé API OpenAI invalide. Vérifiez votre OPENAI_API_KEY dans .env"
}
```

### Erreur base de données (503)

**Réponse (503 Service Unavailable) :**
```json
{
  "status": "error",
  "timestamp": "2025-11-29T10:30:45.123Z",
  "database": "disconnected",
  "error": "Connection to database failed"
}
```

---

## 9. Format des Logs Serveur

Lorsque vous testez l'API, vous verrez ces logs dans votre console :

```
[2025-11-29T10:35:22.123Z] POST /match/mvp
[Match Service] Récupération du profil utilisateur 550e8400-e29b-41d4-a716-446655440001...
[Match Service] Profil Sophie Dubois récupéré avec succès
[Match Service] Récupération du profil utilisateur 550e8400-e29b-41d4-a716-446655440002...
[Match Service] Profil Ravi Kumar récupéré avec succès
[Match MVP] Démarrage du matching entre 550e8400-e29b-41d4-a716-446655440001 et 550e8400-e29b-41d4-a716-446655440002...
[Match MVP] Appel à l'IA pour analyse...
[AI] Appel au modèle gpt-4-turbo-preview...
[AI] Réponse reçue (1234 caractères)
[Match MVP] Matching terminé avec succès
```

---

## 10. Temps de Réponse Typiques

| Endpoint | Mode | Appels IA | Temps Moyen |
|----------|------|-----------|-------------|
| `/health` | - | 0 | < 100ms |
| `/profile/:id` | - | 0 | < 200ms |
| `/match/mvp` | MVP | 1 | 3-8s |
| `/match/agents` | Agents (agents existants) | 2 | 8-15s |
| `/match/agents` | Agents (création + matching) | 4 | 15-25s |
| `/agents/rebuild/:id` | - | 1 | 3-6s |

**Note :** Les temps varient selon :
- La charge de l'API OpenAI
- La taille des profils
- La latence réseau
- Le modèle utilisé (GPT-4 vs GPT-3.5)

---

## 11. Conseils d'Utilisation

### Pour des tests rapides
→ Utilisez le mode MVP

### Pour une analyse approfondie
→ Utilisez le mode Agents

### Pour tester sans consommer de crédits OpenAI
→ Consultez les profils avec `/profile/:id`

### Pour optimiser les coûts
→ Réutilisez les agents (ne les régénérez pas sauf si profil modifié)

### Pour déboguer
→ Consultez les logs du serveur et `match_logs` dans la DB
