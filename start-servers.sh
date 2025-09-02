#!/bin/bash

# Kill any existing Node.js processes
echo "Stopping any existing Node.js processes..."
pkill -f "node" || true

# Start Backend Server (Port 3002)
echo "Starting Backend Server on port 3002..."
cd /Users/montysoraiya/Desktop/Hytrade\ 4/backend
PORT=3002 nohup npm start > backend.log 2>&1 &

# Start Frontend (Port 3000)
echo "Starting Frontend on port 3000..."
cd /Users/montysoraiya/Desktop/Hytrade\ 4/frontend
PORT=3000 nohup npm start > frontend.log 2>&1 &

# Start Dashboard (Port 3001)
echo "Starting Dashboard on port 3001..."
cd /Users/montysoraiya/Desktop/Hytrade\ 4/dashboard
PORT=3001 nohup npm start > dashboard.log 2>&1 &

echo "All servers started!"
echo "- Frontend:   http://localhost:3000"
echo "- Dashboard:  http://localhost:3001"
echo "- Backend:    http://localhost:3002"

echo "\nUse 'tail -f *.log' to monitor logs"
