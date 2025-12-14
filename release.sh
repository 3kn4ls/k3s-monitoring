#!/bin/bash

# Script de release con versionado para ArgoCD
# Uso: ./release.sh [patch|minor|major] "mensaje del commit"

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Variables
IMAGE_NAME="localhost:5000/k3s-admin"
DEPLOYMENT_FILE="k8s/deployment.yaml"
VERSION_FILE="VERSION"

# Leer versión actual
if [ ! -f "$VERSION_FILE" ]; then
    echo "1.0.0" > "$VERSION_FILE"
fi

CURRENT_VERSION=$(cat "$VERSION_FILE")
print_info "Versión actual: $CURRENT_VERSION"

# Función para incrementar versión
increment_version() {
    local version=$1
    local type=$2

    IFS='.' read -r -a parts <<< "$version"
    local major="${parts[0]}"
    local minor="${parts[1]}"
    local patch="${parts[2]}"

    case "$type" in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
        *)
            print_error "Tipo de versión inválido: $type"
            exit 1
            ;;
    esac

    echo "${major}.${minor}.${patch}"
}

# Verificar argumentos
VERSION_TYPE=${1:-patch}
COMMIT_MESSAGE=${2:-"Release"}

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    print_error "Tipo de versión debe ser: patch, minor o major"
    echo ""
    echo "Uso: $0 [patch|minor|major] \"mensaje del commit\""
    echo ""
    echo "Versionado semántico (MAJOR.MINOR.PATCH):"
    echo "  patch  - Correcciones de bugs (1.0.0 -> 1.0.1)"
    echo "  minor  - Nueva funcionalidad compatible (1.0.0 -> 1.1.0)"
    echo "  major  - Cambios incompatibles (1.0.0 -> 2.0.0)"
    echo ""
    echo "Ejemplos:"
    echo "  $0 patch \"Fix button alignment\""
    echo "  $0 minor \"Add dark mode feature\""
    echo "  $0 major \"Complete redesign\""
    exit 1
fi

# Calcular nueva versión
NEW_VERSION=$(increment_version "$CURRENT_VERSION" "$VERSION_TYPE")
print_info "Nueva versión: $NEW_VERSION"

# Verificar que no haya cambios sin commit
if ! git diff-index --quiet HEAD --; then
    print_warning "Tienes cambios sin commit. Asegúrate de que sean solo los cambios de esta release."
    read -p "¿Continuar? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Operación cancelada"
        exit 1
    fi
fi

# 1. Construir imagen Docker con la nueva versión
print_info "Paso 1/5: Construyendo imagen Docker ${IMAGE_NAME}:v${NEW_VERSION}..."
docker build \
    --platform linux/arm64 \
    -t ${IMAGE_NAME}:v${NEW_VERSION} \
    -t ${IMAGE_NAME}:latest \
    .

if [ $? -ne 0 ]; then
    print_error "Error al construir la imagen"
    exit 1
fi

# 2. Push a registry local
print_info "Paso 2/5: Subiendo imágenes al registry local..."
docker push ${IMAGE_NAME}:v${NEW_VERSION}
docker push ${IMAGE_NAME}:latest

# 3. Actualizar VERSION file
print_info "Paso 3/5: Actualizando archivo VERSION..."
echo "$NEW_VERSION" > "$VERSION_FILE"

# 4. Actualizar deployment.yaml
print_info "Paso 4/5: Actualizando deployment.yaml..."
sed -i "s|image: ${IMAGE_NAME}:v.*|image: ${IMAGE_NAME}:v${NEW_VERSION}|g" "$DEPLOYMENT_FILE"
sed -i "s|image: ${IMAGE_NAME}:latest|image: ${IMAGE_NAME}:v${NEW_VERSION}|g" "$DEPLOYMENT_FILE"
sed -i "s|imagePullPolicy: Always|imagePullPolicy: IfNotPresent|g" "$DEPLOYMENT_FILE"

# Verificar el cambio
if grep -q "image: ${IMAGE_NAME}:v${NEW_VERSION}" "$DEPLOYMENT_FILE"; then
    print_info "✓ Deployment actualizado a v${NEW_VERSION}"
else
    print_error "Error al actualizar deployment.yaml"
    exit 1
fi

# 5. Commit y push a Git
print_info "Paso 5/5: Haciendo commit y push..."

git add "$VERSION_FILE" "$DEPLOYMENT_FILE"
git commit -m "release: v${NEW_VERSION} - ${COMMIT_MESSAGE}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin claude/setup-project-011CUqWkYYH8tDDwQ5uLepUf

if [ $? -eq 0 ]; then
    print_info ""
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_info "✅ Release v${NEW_VERSION} completado!"
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_info ""
    print_info "📦 Imagen: ${IMAGE_NAME}:v${NEW_VERSION}"
    print_info "🔄 Commit: $(git rev-parse --short HEAD)"
    print_info "📝 Mensaje: ${COMMIT_MESSAGE}"
    print_info ""
    print_warning "ArgoCD sincronizará automáticamente en ~3 minutos"
    print_warning "O puedes forzar sync desde: https://northr3nd.duckdns.org/argocd"
    print_info ""
    print_info "Para ver el estado:"
    print_info "  kubectl get pods -l app=index-app"
    print_info "  kubectl describe deployment index-app"
else
    print_error "Error al hacer push a Git"
    exit 1
fi
