#!/bin/bash

# Kill any existing processes on ports 3000, 3001, and 3002
echo "Stopping any running servers..."
lsof -ti :3000 | xargs kill -9 2>/dev/null
lsof -ti :3001 | xargs kill -9 2>/dev/null
lsof -ti :3002 | xargs kill -9 2>/dev/null

# Start the backend server
echo "Starting backend server..."
cd backend
npm install
node index.js &
BACKEND_PID=$!
cd ..

# Start the frontend
echo "Starting frontend..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!
cd ..

# Start the dashboard
echo "Starting dashboard..."
cd dashboard
npm install
PORT=3001 npm start &
DASHBOARD_PID=$!
cd ..

echo "All servers are starting up..."
echo "- Frontend: http://localhost:3000"
echo "- Dashboard: http://localhost:3001"
echo "- Backend API: http://localhost:3002"

trap "echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID $DASHBOARD_PID 2>/dev/null; exit" INT

wait
