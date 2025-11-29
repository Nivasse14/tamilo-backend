# ⚡ QUICK START - Architecture Multi-Agents V2

## 🚀 Démarrage en 3 minutes

### Étape 1 : Vérifier que le serveur tourne
```bash
curl http://localhost:3000/health | jq .
```

**Résultat attendu :**
```json
{
  "status": "ok",
  "database": "connected",
  "openai": "configured"
}
```

---

### Étape 2 : Récupérer les IDs utilisateurs
```bash
curl http://localhost:3000/profile/550e8400-e29b-41d4-a716-446655440001 | jq -r '.profile.name'
# Résultat : Sophie Dubois
```

**IDs disponibles (seed data) :**
- `550e8400-e29b-41d4-a716-446655440001` - Sophie Dubois
- `550e8400-e29b-41d4-a716-446655440002` - Ravi Kumar
- `550e8400-e29b-41d4-a716-446655440003` - Marie Laurent
- `550e8400-e29b-41d4-a716-446655440004` - Priya Sharma
- `550e8400-e29b-41d4-a716-446655440005` - Thomas Mercier

---

### Étape 3 : Lancer un matching multi-agents
```bash
curl -X POST http://localhost:3000/match/multi-agents \
  -H "Content-Type: application/json" \
  -d '{
    "userAId": "550e8400-e29b-41d4-a716-446655440001",
    "userBId": "550e8400-e29b-41d4-a716-446655440002"
  }' | jq .
```

**Temps d'attente :** ~12-15 secondes

**Résultat :**
```json
{
  "success": true,
  "result": {
    "verdict": {
      "verdict": "MATCH",
      "score_global": 76.5,
      "resume_executif": "...",
      "forces_majeures": [...],
      "defis_principaux": [...],
      "recommandation": "..."
    },
    "agents": {
      "profil": { "score_profil": 78, ... },
      "valeurs": { "score_valeurs": 78, ... },
      "projection": { "score_projection": 75, ... },
      "risques": { "score_risques": 75, ... }
    }
  }
}
```

---

## 📊 Commandes utiles

### Voir uniquement le verdict
```bash
curl -s -X POST http://localhost:3000/match/multi-agents \
  -H "Content-Type: application/json" \
  -d '{
    "userAId": "550e8400-e29b-41d4-a716-446655440001",
    "userBId": "550e8400-e29b-41d4-a716-446655440002"
  }' | jq -r '.result.verdict.verdict'
```

### Voir le score global
```bash
curl -s -X POST http://localhost:3000/match/multi-agents \
  -H "Content-Type: application/json" \
  -d '{
    "userAId": "550e8400-e29b-41d4-a716-446655440001",
    "userBId": "550e8400-e29b-41d4-a716-446655440002"
  }' | jq -r '.result.verdict.score_global'
```

### Voir tous les scores
```bash
curl -s -X POST http://localhost:3000/match/multi-agents \
  -H "Content-Type: application/json" \
  -d '{
    "userAId": "550e8400-e29b-41d4-a716-446655440001",
    "userBId": "550e8400-e29b-41d4-a716-446655440002"
  }' | jq '{
    profil: .result.agents.profil.score_profil,
    valeurs: .result.agents.valeurs.score_valeurs,
    projection: .result.agents.projection.score_projection,
    risques: .result.agents.risques.score_risques,
    global: .result.verdict.score_global
  }'
```

### Voir le résumé exécutif
```bash
curl -s -X POST http://localhost:3000/match/multi-agents \
  -H "Content-Type: application/json" \
  -d '{
    "userAId": "550e8400-e29b-41d4-a716-446655440001",
    "userBId": "550e8400-e29b-41d4-a716-446655440002"
  }' | jq -r '.result.verdict.resume_executif'
```

---

## 🧠 Memory Layer - Résumé psychologique

### Générer le résumé d'un utilisateur
```bash
curl -X POST http://localhost:3000/memory/update/550e8400-e29b-41d4-a716-446655440001 | jq .
```

**Résultat :**
```json
{
  "success": true,
  "summary": {
    "resume_psy": "Sophie est une femme...",
    "valeurs_clefs": ["Famille", "Respect", "Ambition"],
    "risques_relationnels": ["..."],
    "dealbreakers_probables": ["Manque de respect", "Mensonge"],
    "type_de_partenaire_recommande": "Un partenaire mature..."
  }
}
```

---

## 🧪 Tests automatisés

### Script complet
```bash
./tests/test-multi-agents.sh
```

**Ce script teste :**
- ✅ Health check
- ✅ Matching multi-agents V2
- ✅ Memory layer
- ✅ Matching MVP (legacy)
- ✅ Matching agents V1 (legacy)
- ✅ Récupération de profil

---

## 📱 Intégration frontend

### JavaScript/TypeScript
```typescript
async function matchUsers(userAId: string, userBId: string) {
  const response = await fetch('http://localhost:3000/match/multi-agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAId, userBId })
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error);
  }
  
  return data.result;
}

// Usage
const result = await matchUsers(
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002'
);

console.log(`Verdict: ${result.verdict.verdict}`);
console.log(`Score: ${result.verdict.score_global}/100`);
```

### Python
```python
import requests

def match_users(user_a_id: str, user_b_id: str):
    response = requests.post(
        'http://localhost:3000/match/multi-agents',
        json={'userAId': user_a_id, 'userBId': user_b_id}
    )
    
    data = response.json()
    
    if not data['success']:
        raise Exception(data['error'])
    
    return data['result']

# Usage
result = match_users(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002'
)

print(f"Verdict: {result['verdict']['verdict']}")
print(f"Score: {result['verdict']['score_global']}/100")
```

---

## 🔍 Debugging

### Voir les logs en temps réel
Le serveur affiche des logs détaillés :
```
[Orchestrateur] Lancement du matching multi-agents...
[Agent Profil] Score obtenu : 78/100
[Agent Valeurs] Score obtenu : 78/100
[Agent Projection] Score obtenu : 75/100
[Agent Risques] Score obtenu : 75/100
[Orchestrateur] Verdict final : MATCH (76.5/100)
```

### En cas d'erreur
```bash
# Vérifier la connexion DB
curl http://localhost:3000/health | jq -r '.database'

# Vérifier OpenAI
curl http://localhost:3000/health | jq -r '.openai'

# Vérifier qu'un utilisateur existe
curl http://localhost:3000/profile/550e8400-e29b-41d4-a716-446655440001 | jq -r '.success'
```

---

## 📚 Documentation complète

- **Architecture détaillée :** `docs/MULTI_AGENT_ARCHITECTURE.md`
- **Exemple de résultat :** `docs/EXAMPLE_RESULT.md`
- **Changelog :** `CHANGELOG_V2.md`
- **README principal :** `README.md`

---

## ⚡ Comparaison V1 vs V2

| Critère | V1 (Legacy) | V2 (Multi-Agents) |
|---------|-------------|-------------------|
| **Endpoint** | `/match/agents` | `/match/multi-agents` |
| **Temps** | ~30-40s | ~12-15s |
| **Agents** | 2 (conversation) | 4 (spécialisés) + orchestrateur |
| **JSON** | Texte libre | Strict et validé |
| **Scores** | Verdict uniquement | 4 scores + global |
| **Parallélisation** | Non | Oui (`Promise.all`) |

---

## 🎯 Cas d'usage typiques

### 1. Interface de swipe (type Tinder)
```javascript
// Calculer la compatibilité avant de proposer le profil
const compatibility = await matchUsers(currentUserId, candidateId);

if (compatibility.verdict.score_global >= 70) {
  showProfile(candidateId, compatibility);
} else {
  skipProfile(candidateId);
}
```

### 2. Dashboard de matchs
```javascript
// Afficher tous les scores pour un couple
const { agents, verdict } = await matchUsers(userA, userB);

displayScores({
  profil: agents.profil.score_profil,
  valeurs: agents.valeurs.score_valeurs,
  projection: agents.projection.score_projection,
  risques: agents.risques.score_risques,
  global: verdict.score_global
});
```

### 3. Recommandations personnalisées
```javascript
// Mise à jour du profil utilisateur
await updateUserProfile(userId, newData);

// Régénérer le résumé psychologique
await fetch(`http://localhost:3000/memory/update/${userId}`, {
  method: 'POST'
});

// Maintenant les futurs matchings utiliseront le nouveau résumé
```

---

## 🚨 Points d'attention

1. **Temps d'exécution** : 12-15 secondes par matching
   - → Afficher un loader dans l'UI
   - → Possibilité de mettre en cache les résultats

2. **Coût OpenAI** : 5 appels GPT-4 par matching
   - → Environ $0.10-0.15 par matching
   - → Optimiser en cachant les résultats

3. **Rate limiting** : Limites de l'API OpenAI
   - → Implémenter un système de queue si volume élevé
   - → Surveiller les erreurs 429 (Too Many Requests)

---

## ✅ Checklist avant production

- [ ] Variables d'environnement configurées (`.env`)
- [ ] Base de données PostgreSQL opérationnelle
- [ ] Clé OpenAI valide et avec crédit
- [ ] Tests automatisés passent (`./tests/test-multi-agents.sh`)
- [ ] Monitoring des performances en place
- [ ] Gestion des erreurs testée
- [ ] Rate limiting configuré
- [ ] Cache des résultats implémenté (optionnel)
- [ ] Documentation partagée avec l'équipe

---

## 🆘 Support

**Problème courant 1 :** "Route non trouvée"
- ✅ **Solution :** Redémarrer le serveur après modifications

**Problème courant 2 :** "User introuvable"
- ✅ **Solution :** Utiliser les UUIDs complets (pas les integers)

**Problème courant 3 :** "Timeout OpenAI"
- ✅ **Solution :** Vérifier la clé API et le crédit disponible

**Problème courant 4 :** "JSON invalide"
- ✅ **Solution :** Le système retry automatiquement (2 tentatives)

---

**Dernière mise à jour :** 2025-11-29  
**Version :** 2.0.0  
**Happy Matching! 💚**
