#!/usr/bin/env bash
set -euo pipefail

echo "HYtrade • Local Bootstrap"
echo "This script sets up backend, landing (frontend2), and dashboard for local dev."
echo

# Check prerequisites
need_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "Error: '$1' is not installed."; exit 1; }
}

need_cmd node
need_cmd npm

# Check Node version
NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Error: Node.js >= 18 is required. Found $(node -v)."
  exit 1
fi

# Generate JWT secret
gen_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
  else
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  fi
}

# Prompt for MongoDB URI
echo ""; echo "Backend configuration"
read -r -p "Enter MongoDB URI (e.g., mongodb+srv://... or mongodb://localhost:27017/hytrade): " MONGODB_URI || true
MONGODB_URI=${MONGODB_URI:-mongodb://localhost:27017/hytrade}

JWT_SECRET=$(gen_secret)

# Write backend .env
cat > backend/.env <<EOF
PORT=3002
NODE_ENV=development
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
EOF
echo "Wrote backend/.env"

# Write frontend2 .env.local
cat > frontend2/.env.local <<EOF
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:5174
NEXT_PUBLIC_APP_URL=http://localhost:3001
EOF
echo "Wrote frontend2/.env.local"

# Write new-dashboard .env
cat > new-dashboard/.env <<EOF
VITE_API_URL=http://localhost:3002
VITE_FRONTEND_URL=http://localhost:3001
VITE_DASHBOARD_URL=http://localhost:5174
EOF
echo "Wrote new-dashboard/.env"

# Install dependencies
echo ""; echo "Installing dependencies..."
(cd backend && npm install)
(cd frontend2 && npm install)
(cd new-dashboard && npm install)
echo "Dependencies installed."

# Offer to start services
echo ""; read -r -p "Start all dev servers now? [Y/n] " START_NOW
START_NOW=${START_NOW:-Y}
if [ "$START_NOW" = "Y" ] || [ "$START_NOW" = "y" ]; then
  echo "Starting Backend (3002), Landing (3001), Dashboard (5174)..."
  # Try concurrently for nicer UX; fallback to background processes
  if npx --yes concurrently --version >/dev/null 2>&1; then
    npx --yes concurrently -n backend,landing,dashboard -c green,blue,magenta \
      "cd backend && PORT=3002 NODE_ENV=development npm start" \
      "cd frontend2 && npm run dev -- -p 3001" \
      "cd new-dashboard && npm run dev -- --port 5174"
  else
    echo "'concurrently' not available; starting processes in background."
    (cd backend && PORT=3002 NODE_ENV=development nohup npm start >/dev/null 2>&1 &)
    (cd frontend2 && nohup npm run dev -- -p 3001 >/dev/null 2>&1 &)
    (cd new-dashboard && nohup npm run dev -- --port 5174 >/dev/null 2>&1 &)
    echo "Processes started in background."
  fi
  echo ""
  echo "Open URLs:"
  echo "- Backend API:    http://localhost:3002"
  echo "- Landing (Next): http://localhost:3001"
  echo "- Dashboard:      http://localhost:5174"
else
  echo "Setup complete. You can start services manually with:"
  echo "- Backend:   (cd backend && PORT=3002 NODE_ENV=development npm start)"
  echo "- Landing:   (cd frontend2 && npm run dev -- -p 3001)"
  echo "- Dashboard: (cd new-dashboard && npm run dev -- --port 5174)"
fi

echo ""; echo "Done. Happy hacking!"