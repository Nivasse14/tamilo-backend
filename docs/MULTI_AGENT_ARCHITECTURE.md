# 🚀 ARCHITECTURE MULTI-AGENTS V2

## Vue d'ensemble

Le système de matching utilise maintenant une **architecture multi-agents** avec 4 agents spécialisés coordonnés par un orchestrateur central.

### Principe de fonctionnement

```
┌─────────────────────────────────────────────────────┐
│         REQUEST : POST /match/multi-agents          │
│         Body: { userAId, userBId }                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  ORCHESTRATOR   │ ← Coordonne les 4 agents
         └────────┬────────┘
                  │
       ┌──────────┴──────────┐
       │  Promise.all()      │ ← Exécution PARALLÈLE
       └──────────┬──────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┐
    ▼             ▼             ▼             ▼
┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐
│ PROFIL  │ │ VALEURS │ │PROJECTION│ │ RISQUES │
│  Agent  │ │  Agent  │ │  Agent   │ │  Agent  │
└────┬────┘ └────┬────┘ └────┬─────┘ └────┬────┘
     │           │            │            │
     │ score +   │ score +    │ score +    │ score +
     │ analyse   │ analyse    │ analyse    │ analyse
     │           │            │            │
     └───────────┴────────────┴────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  FINAL VERDICT  │ ← Synthèse intelligente
         │  (GPT-4)        │
         └────────┬────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │  STRUCTURED RESULT  │
       │  • verdict          │
       │  • score_global     │
       │  • resume_executif  │
       │  • forces_majeures  │
       │  • defis_principaux │
       │  • recommandation   │
       └─────────────────────┘
```

---

## 🎯 Les 4 Agents Spécialisés

### 1. **Agent Profil** (`agentProfil.js`)
**Spécialité :** Psychologie relationnelle et compatibilité émotionnelle

**Analyse :**
- Personnalité et tempérament
- Style d'attachement (sécure, anxieux, évitant)
- Traits émotionnels et maturité
- Style d'interaction et de communication
- Dynamique relationnelle potentielle

**Retour structuré :**
```json
{
  "score_profil": 78,
  "resume": "Résumé de la compatibilité psychologique...",
  "points_forts": ["Force 1", "Force 2", ...],
  "points_de_vigilance": ["Point à surveiller 1", ...]
}
```

---

### 2. **Agent Valeurs** (`agentValeurs.js`)
**Spécialité :** Compatibilité des valeurs et modes de vie

**Analyse :**
- Valeurs centrales et principes de vie
- Religion et spiritualité
- Importance de la famille
- Style de vie et priorités quotidiennes
- Vision du monde et convictions

**Retour structuré :**
```json
{
  "score_valeurs": 78,
  "compatibilites_clefs": ["Valeur partagée 1", "Valeur partagée 2", ...],
  "conflits_potentiels": ["Divergence possible 1", ...]
}
```

---

### 3. **Agent Projection** (`agentProjection.js`)
**Spécialité :** Projets de vie à long terme

**Analyse :**
- Plans de vie à long terme (5-10 ans)
- Ambitions professionnelles et personnelles
- Vision de la famille et des enfants
- Préférences géographiques (ville, pays)
- Équilibre vie pro/perso
- Projets financiers et matériels

**Retour structuré :**
```json
{
  "score_projection": 75,
  "vision_commune": ["Projet partagé 1", "Projet partagé 2", ...],
  "risques_long_terme": ["Divergence future possible 1", ...]
}
```

---

### 4. **Agent Risques** (`agentRisques.js`)
**Spécialité :** Détection de red flags et risques relationnels

**Analyse :**
- Red flags comportementaux ou émotionnels
- Patterns toxiques ou destructeurs
- Dealbreakers absolus
- Risques émotionnels (attachement, dépendance, etc.)
- Risques pratiques (incompatibilités majeures)

**Critères prioritaires :**
- Manque de respect (ton, comportement, politesse)
- Mensonge ou zones floues
- Manque d'ambition ou de vision
- Instabilité émotionnelle
- Irrespect culturel
- Violence verbale ou physique

**Retour structuré :**
```json
{
  "score_risques": 75,
  "red_flags": ["Red flag 1", ...],
  "points_a_surveiller": ["Point à observer 1", ...]
}
```

---

## 🎭 L'Orchestrateur

### Rôle
L'orchestrateur (`orchestrator.js`) coordonne les 4 agents et produit le verdict final.

### Processus
1. **Récupération des profils** : Fetch des deux utilisateurs en parallèle
2. **Exécution parallèle** : `Promise.all()` pour lancer les 4 agents simultanément
3. **Synthèse finale** : Appel à GPT-4 pour analyser les 4 résultats et produire le verdict

### Critères de verdict
```javascript
MATCH         → score_global ≥ 70 ET score_risques ≥ 60
NO_MATCH      → score_global < 50 OU score_risques < 40
ATTENTION     → Tous les autres cas (potentiel mais vigilance requise)
```

### Résultat final
```json
{
  "userA": { "id": "...", "name": "Sophie Dubois" },
  "userB": { "id": "...", "name": "Ravi Kumar" },
  "timestamp": "2025-11-29T19:46:42.056Z",
  "agents": {
    "profil": { "score_profil": 78, "resume": "...", ... },
    "valeurs": { "score_valeurs": 78, ... },
    "projection": { "score_projection": 75, ... },
    "risques": { "score_risques": 75, ... }
  },
  "verdict": {
    "verdict": "MATCH",
    "score_global": 76.5,
    "resume_executif": "Sophie et Ravi présentent une forte compatibilité...",
    "forces_majeures": ["Force 1", "Force 2", ...],
    "defis_principaux": ["Défi 1", ...],
    "recommandation": "Conseil personnalisé pour ce couple..."
  },
  "meta": {
    "duration_seconds": "12.65",
    "mode": "MULTI_AGENT_V2"
  }
}
```

---

## 🛠️ Utilitaire : Structured GPT

### Fichier : `src/utils/structuredGPT.js`

**Rôle :** Garantir que chaque appel à GPT-4 retourne un JSON valide et structuré.

**Fonctionnalités :**
- ✅ Validation stricte du JSON
- ✅ Retry automatique (2 tentatives)
- ✅ Nettoyage des balises markdown (`\`\`\`json`)
- ✅ Validation du schéma attendu
- ✅ Vérification des scores (0-100)

**Exemple d'utilisation :**
```javascript
const result = await callStructuredGPT({
  systemPrompt: SYSTEM_PROMPT_PROFIL,
  userPrompt: 'Analyse ces deux profils...',
  temperature: 0.7,
  expectedSchema: {
    score_profil: 'number',
    resume: 'string',
    points_forts: 'array',
    points_de_vigilance: 'array',
  },
});
```

---

## 📡 Nouveaux Endpoints API

### 1. **POST /match/multi-agents** (NOUVEAU)
Utilise l'architecture multi-agents V2 pour un matching complet et structuré.

**Request :**
```json
{
  "userAId": "550e8400-e29b-41d4-a716-446655440001",
  "userBId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response :**
```json
{
  "success": true,
  "result": {
    "userA": { ... },
    "userB": { ... },
    "agents": { ... },
    "verdict": { ... },
    "meta": { "duration_seconds": "12.65", "mode": "MULTI_AGENT_V2" }
  }
}
```

---

### 2. **POST /memory/update/:userId** (NOUVEAU)
Génère ou met à jour le résumé psychologique structuré d'un utilisateur.

**À appeler :** Quand un utilisateur crée ou modifie son profil.

**Response :**
```json
{
  "success": true,
  "summary": {
    "resume_psy": "Analyse psychologique...",
    "valeurs_clefs": ["Valeur 1", "Valeur 2", ...],
    "risques_relationnels": ["Risque 1", ...],
    "dealbreakers_probables": ["Dealbreaker 1", ...],
    "type_de_partenaire_recommande": "Description du partenaire idéal..."
  }
}
```

---

## 🔄 Backward Compatibility

### Endpoints LEGACY (toujours disponibles)
- ✅ `POST /match/mvp` : Analyse directe simple
- ✅ `POST /match/agents` : Conversation simulée (V1)
- ✅ `POST /agents/rebuild/:userId` : Résumé d'agent V1

⚠️ Ces endpoints ajoutent un champ `_warning` dans la réponse pour encourager la migration vers V2.

---

## ⚡ Performances

### Temps d'exécution typique
- **4 agents en parallèle** : ~5-6 secondes
- **Synthèse finale** : ~7 secondes
- **Total** : **~12-13 secondes** pour un matching complet

### Optimisations
- ✅ `Promise.all()` pour parallélisation des agents
- ✅ Validation JSON stricte avec retry
- ✅ Température ajustée par agent (0.5 à 0.7)
- ✅ Logging détaillé pour debugging

---

## 🧪 Exemple de test

```bash
curl -X POST http://localhost:3000/match/multi-agents \
  -H "Content-Type: application/json" \
  -d '{
    "userAId": "550e8400-e29b-41d4-a716-446655440001",
    "userBId": "550e8400-e29b-41d4-a716-446655440002"
  }' | jq .
```

**Résultat attendu :**
```
[Orchestrateur] Lancement du matching multi-agents...
[Agent Profil] Score obtenu : 78/100
[Agent Valeurs] Score obtenu : 78/100
[Agent Projection] Score obtenu : 75/100
[Agent Risques] Score obtenu : 75/100
[Orchestrateur] 4 agents terminés en 5.21s
[Orchestrateur] Verdict final : MATCH (76.5/100)
[Orchestrateur] Matching terminé en 12.65s
```

---

## 📊 Architecture des fichiers

```
src/
├── agents/
│   ├── agentProfil.js       ← Agent psychologie
│   ├── agentValeurs.js      ← Agent valeurs
│   ├── agentProjection.js   ← Agent projets de vie
│   ├── agentRisques.js      ← Agent red flags
│   └── orchestrator.js      ← Orchestrateur central
├── utils/
│   └── structuredGPT.js     ← Wrapper JSON structuré
├── services/
│   └── matchService.js      ← Fonctions de matching (V1 + V2)
└── routes/
    └── matchRoutes.js       ← Endpoints API (V1 + V2)
```

---

## 🎓 Concepts clés

### 1. Spécialisation
Chaque agent a un domaine d'expertise précis, ce qui améliore la qualité de l'analyse.

### 2. Parallélisation
Les 4 agents s'exécutent simultanément via `Promise.all()`, divisant le temps d'exécution par 4.

### 3. Structuration
Chaque agent retourne un JSON strict validé, garantissant la cohérence des données.

### 4. Orchestration
L'orchestrateur final fait la synthèse intelligente en croisant les 4 analyses.

### 5. Memory Layer
Le résumé psychologique enrichit le contexte utilisateur pour de futurs matchings.

---

## 🔮 Évolutions futures possibles

1. **Cache intelligent** : Stocker les résultats d'agents pour éviter les recalculs
2. **Pondération dynamique** : Ajuster l'importance de chaque agent selon le contexte
3. **Agents supplémentaires** : Ajouter un agent "Chimie" ou "Lifestyle"
4. **Streaming** : Retourner les résultats d'agents au fur et à mesure (SSE)
5. **A/B Testing** : Comparer V1 vs V2 sur de vrais utilisateurs

---

## ✅ Checklist de migration V1 → V2

- [x] 4 agents spécialisés créés
- [x] Orchestrateur avec Promise.all()
- [x] Utilitaire structuredGPT avec validation
- [x] Nouveau endpoint `/match/multi-agents`
- [x] Memory layer avec `/memory/update/:userId`
- [x] Backward compatibility maintenue
- [x] Documentation complète
- [ ] Tests automatisés
- [ ] Monitoring des performances
- [ ] Migration progressive des utilisateurs

---

**Dernière mise à jour** : 2025-11-29
**Version** : 2.0.0
**Auteur** : IA Tamilo Team
