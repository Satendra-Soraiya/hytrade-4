#!/bin/bash

# Hytrade 4 - Setup and Run Script
# This script will set up and run all required services for the Hytrade 4 platform

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Hytrade 4 - Setup and Run Script ===${NC}"

# Check if running on Windows (Git Bash)
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo -e "${YELLOW}Detected Windows system${NC}"
    IS_WINDOWS=true
else
    IS_WINDOWS=false
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to kill process on a specific port
kill_port() {
    local port=$1
    if [ "$IS_WINDOWS" = true ]; then
        # Windows command to find and kill process using the port
        for pid in $(netstat -ano | findstr ":$port" | findstr "LISTENING" | awk '{print $5}'); do
            echo -e "${YELLOW}Killing process $pid using port $port${NC}"
            taskkill /F /PID $pid
        done
    else
        # Unix/Linux/Mac command to find and kill process using the port
        local pid=$(lsof -ti :$port)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}Killing process $pid using port $port${NC}"
            kill -9 $pid
        fi
    fi
}

# Function to check if a port is in use
is_port_in_use() {
    if [ "$IS_WINDOWS" = true ]; then
        netstat -ano | findstr ":$1" | findstr "LISTENING"
    else
        lsof -i ":$1" | grep LISTEN
    fi
    return $?
}

# Check for required software
echo -e "${GREEN}=== Checking required software ===${NC}"

# Check Node.js and npm
if ! command_exists node || ! command_exists npm; then
    echo -e "${RED}Error: Node.js and npm are required. Please install them first.${NC}"
    echo "Download Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node -v)"
echo "✓ npm $(npm -v)"

# Check MongoDB
if ! command_exists mongod; then
    echo -e "${YELLOW}Warning: MongoDB is not installed. The app will run but database operations will fail.${NC}"
    echo "Download MongoDB from: https://www.mongodb.com/try/download/community"
    read -p "Do you want to continue without MongoDB? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ MongoDB $(mongod --version | head -n 1)"
fi

# Kill processes on required ports
echo -e "\n${GREEN}=== Freeing up required ports ===${NC}"

PORTS=(3000 3001 3002)  # Frontend, Dashboard, Backend
for port in "${PORTS[@]}"; do
    if is_port_in_use "$port"; then
        echo -e "${YELLOW}Port $port is in use${NC}"
        kill_port "$port"
    else
        echo -e "Port $port is available"
    fi
done

# Install dependencies
echo -e "\n${GREEN}=== Installing dependencies ===${NC}"

# Function to install dependencies in a directory
install_deps() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir" ]; then
        echo -e "\n${GREEN}Installing $name dependencies...${NC}"
        cd "$dir"
        if [ -f "package-lock.json" ]; then
            rm -f package-lock.json
        fi
        if [ -d "node_modules" ]; then
            echo "Removing existing node_modules..."
            rm -rf node_modules
        fi
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}Error installing $name dependencies${NC}"
            return 1
        fi
        cd ..
        echo -e "${GREEN}✓ $name dependencies installed${NC}"
    else
        echo -e "${RED}Error: $name directory not found at $dir${NC}"
        return 1
    fi
}

# Install dependencies for each service
install_deps "frontend" "Frontend" || exit 1
install_deps "dashboard" "Dashboard" || exit 1
install_deps "backend" "Backend" || exit 1

# Create .env files if they don't exist
echo -e "\n${GREEN}=== Setting up environment variables ===${NC}"

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env file..."
    cat > backend/.env <<EOL
PORT=3002
MONGODB_URI=mongodb://localhost:27017/hytrade
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
EOL
    echo -e "${GREEN}✓ Created backend/.env${NC}"
else
    echo -e "✓ backend/.env already exists"
fi

# Start services
echo -e "\n${GREEN}=== Starting services ===${NC}"

# Function to start a service in a new terminal window
start_service() {
    local dir=$1
    local cmd=$2
    local name=$3
    local port=$4
    
    echo -e "Starting $name..."
    
    if [ "$IS_WINDOWS" = true ]; then
        # Windows command to start in new window
        start "$name" cmd /k "cd $dir && $cmd"
    else
        # Unix/Linux/Mac command to start in new tab
        osascript -e "tell application \"Terminal\" to do script \"cd '$dir' && $cmd\""
    fi
    
    # Wait for service to start
    echo -n "Waiting for $name to start on port $port"
    for i in {1..30}; do
        if is_port_in_use "$port"; then
            echo -e "\n${GREEN}✓ $name is running on port $port${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
    done
    
    echo -e "\n${RED}Failed to start $name on port $port${NC}"
    return 1
}

# Start MongoDB if available
if command_exists mongod; then
    echo -e "Starting MongoDB..."
    if [ "$IS_WINDOWS" = true ]; then
        start "MongoDB" cmd /k "mongod"
    else
        mongod --config /usr/local/etc/mongod.conf --fork
    fi
    sleep 2
fi

# Start services in separate terminals
start_service "backend" "npm start" "Backend" 3002
sleep 5  # Give backend time to start

start_service "dashboard" "npm start" "Dashboard" 3001
start_service "frontend" "npm start" "Frontend" 3000

# Print completion message
echo -e "\n${GREEN}=== Setup Complete! ===${NC}"
echo "The following services are now running:"
echo "- Frontend:    http://localhost:3000"
echo "- Dashboard:   http://localhost:3001"
echo "- Backend API: http://localhost:3002"

if [ "$IS_WINDOWS" = false ]; then
    # Open the frontend in default browser
    sleep 2
    if command_exists xdg-open; then
        xdg-open "http://localhost:3000"
    elif command_exists open; then
        open "http://localhost:3000"
    fi
fi

echo -e "\n${GREEN}Hytrade 4 is now running!${NC}"
