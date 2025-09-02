#!/bin/bash
echo "Starting Hytrade 4 - Trading Platform"
echo "----------------------------------"

# Base directory
BASE_DIR="/Users/montysoraiya/Desktop/Hytrade 4"

# Function to handle Ctrl+C
cleanup() {
  echo "\nShutting down all services..."
  pkill -f "nodemon index.js"
  pkill -f "react-scripts start"
  exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Start backend
echo "[1/3] Starting Backend (Port 3002)..."
cd "$BASE_DIR/backend"
npm start &
BACKEND_PID=$!

# Wait for backend to start
echo "   - Waiting for backend to initialize..."
until curl -s http://localhost:3002/health >/dev/null; do
  echo "   - Backend not ready yet, waiting..."
  sleep 2
done
echo "   - Backend is up and running!"

# Start frontend
echo "[2/3] Starting Frontend (Port 3000)..."
cd "$BASE_DIR/frontend"
npm start &
FRONTEND_PID=$!

# Start dashboard
echo "[3/3] Starting Dashboard (Port 4000)..."
cd "$BASE_DIR/dashboard"
PORT=4000 npm start &
DASHBOARD_PID=$!

echo "\nAll services started successfully!"
echo "----------------------------------"
echo "Frontend:  http://localhost:3000"
echo "Dashboard: http://localhost:4000"
echo "Backend:   http://localhost:3002"
echo "----------------------------------"
echo "\nPress Ctrl+C to stop all services"

# Keep the script running
wait $BACKEND_PID $FRONTEND_PID $DASHBOARD_PID
