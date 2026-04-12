#!/bin/bash
# ============================================================
# release.sh — Crear tag + GitHub Release para luxora-compartido
#
# Uso:
#   ./release.sh 3.1.0 "Descripcion de los cambios"
#
# Ejemplo:
#   ./release.sh 3.1.0 "Anadidos 20 typos nuevos detectados en abril"
#
# Requisitos:
#   - KeePassXC CLI instalado
#   - monpatec-cc.kdbx accesible
#   - .keepass-dpapi configurado
#   - Python 3 en PATH
#   - Cambios ya commiteados y pusheados a main
# ============================================================

set -euo pipefail

VERSION="${1:-}"
DESCRIPTION="${2:-}"

if [ -z "$VERSION" ] || [ -z "$DESCRIPTION" ]; then
  echo "Uso: ./release.sh <version> <descripcion>"
  echo "Ejemplo: ./release.sh 3.1.0 \"Anadidos 20 typos nuevos\""
  exit 1
fi

TAG="v${VERSION}"
REPO="pat3csh0/luxora-compartido"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ── Obtener token de KeePass ─────────────────────────────────
echo "Obteniendo token de GitHub..."
KPASS=$(powershell -Command "Add-Type -AssemblyName System.Security; [System.Text.Encoding]::UTF8.GetString([System.Security.Cryptography.ProtectedData]::Unprotect([System.IO.File]::ReadAllBytes('p:/Antigravity-Claude/.keepass-dpapi'), \$null, 'CurrentUser'))")
KCLI="/c/Program Files/KeePassXC/keepassxc-cli.exe"
DB="p:/Antigravity-Claude/monpatec-cc.kdbx"
KF="C:/cc/keepass-llave.keyx"
GH_TOKEN=$(echo "$KPASS" | "$KCLI" show "$DB" -k "$KF" "GitHub/PAT (pat3csh0)" -sa password -q)

if [ -z "$GH_TOKEN" ]; then
  echo "ERROR: no se pudo obtener el token de GitHub"
  exit 1
fi

# ── Verificar que no hay cambios sin commitear ────────────────
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: hay cambios sin commitear. Haz commit y push antes de crear la release."
  git status --short
  exit 1
fi

# ── Verificar que el tag no existe ya ─────────────────────────
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "ERROR: el tag $TAG ya existe. Usa una version nueva."
  exit 1
fi

# ── Verificar que estamos sincronizados con remote ────────────
echo "Verificando sincronizacion con remote..."
git remote set-url origin "https://${GH_TOKEN}@github.com/${REPO}.git"

git fetch -q origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "ERROR: HEAD local ($LOCAL) no coincide con origin/main ($REMOTE)."
  echo "Haz push o pull antes de crear la release."
  git remote set-url origin "https://github.com/${REPO}.git"
  exit 1
fi

# ── Validar JS ────────────────────────────────────────────────
echo "Validando archivos JS..."
node --check verificador-email/email-typo-checker-light.js
node --check verificador-email/email-typo-checker-dark.js
echo "  JS valido."

# ── Crear tag ─────────────────────────────────────────────────
echo "Creando tag $TAG..."
git -c user.name="JLM" -c user.email="jlm@local" tag -a "$TAG" -m "${TAG} — ${DESCRIPTION}"
git push -q origin "$TAG"
echo "  Tag $TAG pusheado."

# ── Crear release en GitHub ───────────────────────────────────
echo "Creando GitHub Release..."

TMPDIR=$(mktemp -d 2>/dev/null || echo "$SCRIPT_DIR/.tmp-release")
mkdir -p "$TMPDIR"

# URLs CDN
LIGHT_CDN="https://cdn.jsdelivr.net/gh/${REPO}@${TAG}/verificador-email/email-typo-checker-light.js"
DARK_CDN="https://cdn.jsdelivr.net/gh/${REPO}@${TAG}/verificador-email/email-typo-checker-dark.js"

cat > "$TMPDIR/notes.md" <<NOTES_EOF
## ${TAG} — ${DESCRIPTION}

### Instalacion (una sola linea)

**Para fondo OSCURO** (texto claro):

\`\`\`html
<script src="${LIGHT_CDN}"></script>
\`\`\`

**Para fondo CLARO** (texto oscuro):

\`\`\`html
<script src="${DARK_CDN}"></script>
\`\`\`

Pegar en *Settings -> Tracking Code -> Footer* de tu landing o funnel de Luxora / GHL.

### Documentacion

Lee el [README del verificador](https://github.com/${REPO}/tree/main/verificador-email) para instrucciones completas.

### Reportar typos no detectados

[Abrir issue](https://github.com/${REPO}/issues/new) con el email concreto que no se detecto.
NOTES_EOF

python -c "
import json
with open(r'${TMPDIR}/notes.md', 'r', encoding='utf-8') as f:
    body = f.read()
payload = {
    'tag_name': '${TAG}',
    'name': '${TAG} - ${DESCRIPTION}',
    'body': body,
    'draft': False,
    'prerelease': False,
    'make_latest': 'true'
}
with open(r'${TMPDIR}/payload.json', 'w', encoding='utf-8') as f:
    json.dump(payload, f, ensure_ascii=False)
"

RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-binary "@${TMPDIR}/payload.json" \
  "https://api.github.com/repos/${REPO}/releases")

RELEASE_ID=$(echo "$RESPONSE" | python -c "import json,sys; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
HTML_URL=$(echo "$RESPONSE" | python -c "import json,sys; print(json.load(sys.stdin).get('html_url',''))" 2>/dev/null)
UPLOAD_URL=$(echo "$RESPONSE" | python -c "import json,sys; print(json.load(sys.stdin).get('upload_url','').split('{')[0])" 2>/dev/null)

if [ -z "$RELEASE_ID" ]; then
  echo "ERROR creando release:"
  echo "$RESPONSE" | head -20
  rm -rf "$TMPDIR"
  git remote set-url origin "https://github.com/${REPO}.git"
  exit 1
fi

echo "  Release creada: $HTML_URL"

# ── Subir assets ──────────────────────────────────────────────
echo "Subiendo assets..."
for f in email-typo-checker-light.html email-typo-checker-dark.html email-typo-checker-light.js email-typo-checker-dark.js; do
  ext="${f##*.}"
  case "$ext" in
    html) ctype="text/html; charset=utf-8" ;;
    js)   ctype="application/javascript; charset=utf-8" ;;
  esac
  UPLOAD_RESP=$(curl -s -X POST \
    -H "Authorization: Bearer $GH_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: $ctype" \
    --data-binary "@verificador-email/$f" \
    "${UPLOAD_URL}?name=${f}")
  ASSET_OK=$(echo "$UPLOAD_RESP" | python -c "import json,sys; r=json.load(sys.stdin); print('OK' if 'id' in r else r.get('message','error'))" 2>/dev/null)
  echo "  $f -> $ASSET_OK"
done

# ── Limpiar ───────────────────────────────────────────────────
rm -rf "$TMPDIR"
git remote set-url origin "https://github.com/${REPO}.git"

# ── Verificar CDN ─────────────────────────────────────────────
echo ""
echo "Verificando CDN (jsDelivr @${TAG})..."
sleep 3
for variant in light dark; do
  url="https://cdn.jsdelivr.net/gh/${REPO}@${TAG}/verificador-email/email-typo-checker-${variant}.js"
  http=$(curl -sI "$url" | head -1 | tr -d '\r')
  echo "  $variant: $http"
done

echo ""
echo "============================================================"
echo "Release $TAG publicada con exito!"
echo ""
echo "URL:   $HTML_URL"
echo ""
echo "CDN Light: $LIGHT_CDN"
echo "CDN Dark:  $DARK_CDN"
echo ""
echo "Actualiza las URLs en tu Tracking Code de Luxora si quieres"
echo "que tus landings usen esta version."
echo "============================================================"
