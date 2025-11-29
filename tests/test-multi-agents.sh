#!/bin/bash

# 🧪 TESTS DE L'ARCHITECTURE MULTI-AGENTS V2
# Ce script permet de tester rapidement tous les endpoints de l'API

BASE_URL="http://localhost:3000"

# Couleurs pour le terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# IDs des utilisateurs de test
SOPHIE="550e8400-e29b-41d4-a716-446655440001"  # Sophie Dubois
RAVI="550e8400-e29b-41d4-a716-446655440002"    # Ravi Kumar
MARIE="550e8400-e29b-41d4-a716-446655440003"   # Marie Laurent
PRIYA="550e8400-e29b-41d4-a716-446655440004"   # Priya Sharma
THOMAS="550e8400-e29b-41d4-a716-446655440005"  # Thomas Mercier

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🚀 TESTS ARCHITECTURE MULTI-AGENTS V2 🚀            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Fonction pour afficher un titre de section
print_section() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  $1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Fonction pour tester un endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -e "${BLUE}🔹 Test: $name${NC}"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s "$BASE_URL$endpoint")
    else
        response=$(curl -s -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    # Vérifier si la requête a réussi
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Succès${NC}"
        echo "$response" | jq -r '.result.verdict.verdict // .verdict.verdict // "N/A"' 2>/dev/null | sed 's/^/  Verdict: /'
        echo "$response" | jq -r '.result.verdict.score_global // .verdict.score_global // "N/A"' 2>/dev/null | sed 's/^/  Score: /'
    else
        echo -e "${RED}✗ Erreur${NC}"
        echo "$response" | jq -r '.error // "Erreur inconnue"' | sed 's/^/  /'
    fi
    echo ""
}

# ═══════════════════════════════════════════════════════════
# TEST 1: Health Check
# ═══════════════════════════════════════════════════════════
print_section "1️⃣  HEALTH CHECK"

echo -e "${BLUE}🔹 Test: Health Check${NC}"
response=$(curl -s "$BASE_URL/health")
if echo "$response" | jq -e '.status == "ok"' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Serveur opérationnel${NC}"
    echo "$response" | jq .
else
    echo -e "${RED}✗ Serveur non accessible${NC}"
    exit 1
fi

# ═══════════════════════════════════════════════════════════
# TEST 2: Matching Multi-Agents V2 (NOUVEAU)
# ═══════════════════════════════════════════════════════════
print_section "2️⃣  MATCHING MULTI-AGENTS V2 (NOUVEAU)"

test_endpoint \
    "Sophie x Ravi (Multi-Agents)" \
    "POST" \
    "/match/multi-agents" \
    "{\"userAId\": \"$SOPHIE\", \"userBId\": \"$RAVI\"}"

# ═══════════════════════════════════════════════════════════
# TEST 3: Memory Layer (NOUVEAU)
# ═══════════════════════════════════════════════════════════
print_section "3️⃣  MEMORY LAYER - RÉSUMÉ PSYCHOLOGIQUE (NOUVEAU)"

echo -e "${BLUE}🔹 Test: Mise à jour mémoire Sophie${NC}"
response=$(curl -s -X POST "$BASE_URL/memory/update/$SOPHIE" \
    -H "Content-Type: application/json")

if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Succès${NC}"
    echo "$response" | jq -r '.summary.resume_psy' | sed 's/^/  Résumé: /'
    echo "$response" | jq -r '.summary.valeurs_clefs | join(", ")' | sed 's/^/  Valeurs: /'
else
    echo -e "${RED}✗ Erreur${NC}"
    echo "$response" | jq -r '.error // "Erreur inconnue"' | sed 's/^/  /'
fi
echo ""

# ═══════════════════════════════════════════════════════════
# TEST 4: Matching MVP (LEGACY)
# ═══════════════════════════════════════════════════════════
print_section "4️⃣  MATCHING MVP (LEGACY)"

test_endpoint \
    "Marie x Thomas (MVP Simple)" \
    "POST" \
    "/match/mvp" \
    "{\"userAId\": \"$MARIE\", \"userBId\": \"$THOMAS\"}"

# ═══════════════════════════════════════════════════════════
# TEST 5: Matching Agents V1 (LEGACY)
# ═══════════════════════════════════════════════════════════
print_section "5️⃣  MATCHING AGENTS V1 (LEGACY)"

test_endpoint \
    "Priya x Thomas (Conversation V1)" \
    "POST" \
    "/match/agents" \
    "{\"userAId\": \"$PRIYA\", \"userBId\": \"$THOMAS\"}"

# ═══════════════════════════════════════════════════════════
# TEST 6: Profil utilisateur
# ═══════════════════════════════════════════════════════════
print_section "6️⃣  PROFIL UTILISATEUR"

echo -e "${BLUE}🔹 Test: Récupération profil Sophie${NC}"
response=$(curl -s "$BASE_URL/profile/$SOPHIE")
if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Succès${NC}"
    echo "$response" | jq -r '.profile | "\(.name), \(.age) ans, \(.city)"'
else
    echo -e "${RED}✗ Erreur${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════
print_section "✅ TESTS TERMINÉS"

echo -e "${GREEN}Tous les tests sont terminés !${NC}"
echo ""
echo -e "${BLUE}📊 Résumé des endpoints testés :${NC}"
echo "  ✓ GET  /health"
echo "  ✓ POST /match/multi-agents    (V2 - NOUVEAU)"
echo "  ✓ POST /memory/update/:userId (V2 - NOUVEAU)"
echo "  ✓ POST /match/mvp             (V1 - LEGACY)"
echo "  ✓ POST /match/agents          (V1 - LEGACY)"
echo "  ✓ GET  /profile/:userId"
echo ""
echo -e "${YELLOW}💡 Pour tester manuellement un matching détaillé :${NC}"
echo ""
echo "curl -X POST http://localhost:3000/match/multi-agents \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"userAId\": \"$SOPHIE\","
echo "    \"userBId\": \"$RAVI\""
echo "  }' | jq ."
echo ""
