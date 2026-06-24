#!/bin/bash
# ============================================================
#  Booklo — Deploy script
#  Servidor: 186.158.13.61
#  Repo: https://github.com/framallo90/booklo
# ============================================================
set -e

# ---------- CONFIGURACIÓN — editá estos valores ----------
DB_USER="booklo_user"
DB_PASS="Booklo2024!"          # contraseña para el usuario MySQL de la app
DB_NAME="booklo_db"
JWT_SECRET="$(openssl rand -hex 32)"
API_PORT=3000
SERVER_IP="186.158.13.61"
APP_DIR="/var/www/booklo"
# ----------------------------------------------------------

echo ""
echo "======================================"
echo "  BOOKLO DEPLOY"
echo "======================================"
echo ""

# ── 0. Instalar dependencias del sistema ─────────────────────
echo "[0/6] Instalando dependencias del sistema..."

# nvm + Node 18
if ! command -v node &>/dev/null; then
  echo "     Instalando Node.js 18 via nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"
  nvm install 18
  nvm use 18
  nvm alias default 18
else
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
  echo "     Node ya instalado: $(node -v)"
fi

# PM2
if ! command -v pm2 &>/dev/null; then
  echo "     Instalando PM2..."
  npm install -g pm2
fi

# MySQL 8
if ! command -v mysql &>/dev/null; then
  echo "     Instalando MySQL 8..."
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server
  sudo systemctl start mysql
  sudo systemctl enable mysql
fi

# Nginx
if ! command -v nginx &>/dev/null; then
  echo "     Instalando Nginx..."
  sudo apt-get install -y nginx
  sudo systemctl enable nginx
fi

# Git
if ! command -v git &>/dev/null; then
  sudo apt-get install -y git
fi

echo "     Dependencias listas."
echo ""

# ── 1. Clonar repo ──────────────────────────────────────────
echo "[1/6] Clonando repositorio..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
sudo mkdir -p /var/www
sudo chown "$USER":"$USER" /var/www

if [ -d "$APP_DIR" ]; then
  echo "     Directorio ya existe, haciendo git pull..."
  cd "$APP_DIR" && git pull
else
  git clone https://github.com/framallo90/booklo.git "$APP_DIR"
fi
cd "$APP_DIR"

# ── 2. MySQL — crear DB y usuario ───────────────────────────
echo ""
echo "[2/6] Configurando MySQL..."
sudo mysql -u root << SQL
CREATE DATABASE IF NOT EXISTS $DB_NAME
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS '$DB_USER'@'localhost'
  IDENTIFIED BY '$DB_PASS';

GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
SQL

echo "     Corriendo migraciones..."
sudo mysql -u root "$DB_NAME" < booklo-api/src/database/init.sql
sudo mysql -u root "$DB_NAME" < booklo-api/src/database/seeds.sql
echo "     DB lista. Usuario admin: admin@booklo.com / password"

# ── 3. API — instalar, configurar y buildear ────────────────
echo ""
echo "[3/6] Configurando API..."
cd "$APP_DIR/booklo-api"

cat > .env << ENV
PORT=$API_PORT

DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_NAME=$DB_NAME

JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
ENV

echo "     Instalando dependencias..."
npm install

echo "     Compilando TypeScript..."
npm run build

echo "     Lanzando con PM2..."
pm2 delete booklo-api 2>/dev/null || true
pm2 start dist/server.js --name booklo-api
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | bash 2>/dev/null || true

# ── 4. Frontend — actualizar env y buildear ─────────────────
echo ""
echo "[4/6] Buildeando frontend Angular..."
cd "$APP_DIR/booklo-web"

# Actualizar environment.ts para producción
cat > src/environments/environment.ts << ENV
export const environment = {
  production: true,
  apiUrl: 'http://$SERVER_IP/api'
};
ENV

echo "     Instalando dependencias..."
npm install

echo "     Building (puede tardar 2-3 minutos)..."
npx ng build --configuration production

# ── 5. Nginx ─────────────────────────────────────────────────
echo ""
echo "[5/6] Configurando Nginx..."

DIST_PATH="$APP_DIR/booklo-web/dist/booklo/browser"

sudo tee /etc/nginx/sites-available/booklo > /dev/null << NGINX
server {
    listen 80;
    server_name $SERVER_IP;

    # Frontend Angular
    root $DIST_PATH;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy a la API — /api/auth → localhost:3000/auth
    location /api/ {
        proxy_pass http://localhost:$API_PORT/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

# Activar el site
sudo ln -sf /etc/nginx/sites-available/booklo /etc/nginx/sites-enabled/booklo

# Desactivar el default si existe
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx

# ── 6. Verificación ──────────────────────────────────────────
echo ""
echo "[6/6] Verificando..."
sleep 2

API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$API_PORT/health)
if [ "$API_STATUS" = "200" ]; then
  echo "     ✓ API respondiendo (puerto $API_PORT)"
else
  echo "     ✗ API no responde — revisá: pm2 logs booklo-api"
fi

NGINX_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP/)
if [ "$NGINX_STATUS" = "200" ]; then
  echo "     ✓ Frontend accesible"
else
  echo "     ~ Frontend status: $NGINX_STATUS (puede ser normal si el build tardó)"
fi

echo ""
echo "======================================"
echo "  DEPLOY COMPLETADO"
echo "======================================"
echo ""
echo "  Frontend: http://$SERVER_IP"
echo "  API:      http://$SERVER_IP/api/health"
echo "  Admin:    admin@booklo.com / password"
echo ""
echo "  Comandos útiles:"
echo "    pm2 status          → ver procesos"
echo "    pm2 logs booklo-api → ver logs de la API"
echo "    pm2 restart booklo-api → reiniciar API"
echo ""
