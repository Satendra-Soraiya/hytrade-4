#!/bin/bash

# Hytrade Local Development Setup
# This script starts both backend and new-dashboard for fast development

echo "🚀 Starting Hytrade Local Development Environment..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill any existing processes on our ports
echo -e "${YELLOW}🔧 Cleaning up existing processes...${NC}"
lsof -ti :3002 | xargs kill -9 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

# Start Backend
echo -e "${BLUE}🔗 Starting Backend Server (Port 3002)...${NC}"
cd backend
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️  backend/.env not found. Run ./bootstrap-local-dev.sh first or create backend/.env${NC}"
  exit 1
fi
PORT=3002 npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Dashboard
echo -e "${GREEN}📊 Starting Dashboard Development Server (Port 5173)...${NC}"
cd ../new-dashboard
npm run dev &
DASHBOARD_PID=$!

# Wait for services to start
sleep 5

echo -e "${GREEN}✅ Development Environment Ready!${NC}"
echo "=================================================="
echo -e "${BLUE}🔗 Backend API:${NC} http://localhost:3002"
echo -e "${GREEN}📊 Dashboard:${NC} http://localhost:5173"
echo "=================================================="
echo -e "${YELLOW}💡 Tips:${NC}"
echo "• Dashboard will auto-reload when you make changes"
echo "• Backend will restart automatically with nodemon"
echo "• Press Ctrl+C to stop all servers"
echo ""
echo -e "${GREEN}🎨 Ready to enhance your dashboard!${NC}"

# Wait for user to stop
wait
