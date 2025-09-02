#!/bin/bash
echo "Cleaning up and starting fresh..."
echo "----------------------------------"

# Base directory
BASE_DIR="/Users/montysoraiya/Desktop/Hytrade 4"

# Kill any existing Node.js processes
echo "[1/4] Stopping any running services..."
pkill -f "node" || echo "No running Node.js processes found"

# Clean up temporary files
echo "[2/4] Cleaning up temporary files..."
find "$BASE_DIR" -name "node_modules" -type d -prune -exec rm -rf {} + || echo "No node_modules to clean"
find "$BASE_DIR" -name ".next" -type d -prune -exec rm -rf {} + || echo "No .next to clean"

# Install dependencies
echo "[3/4] Installing dependencies..."
cd "$BASE_DIR/backend" && npm install
cd "$BASE_DIR/frontend" && npm install
cd "$BASE_DIR/dashboard" && npm install

# Start services
echo "[4/4] Starting services..."
cd "$BASE_DIR"
./start-all.sh
