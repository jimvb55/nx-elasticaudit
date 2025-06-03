#!/bin/bash

# Start development environment for Nuxeo Audit Visualization

# Set colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Nuxeo Audit Visualization Development Environment...${NC}"

# Create necessary directories if they don't exist
mkdir -p logs

# Start backend in the background
echo -e "${YELLOW}Starting backend server...${NC}"
cd backend
npm install
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}Backend started with PID ${BACKEND_PID}${NC}"
echo -e "${YELLOW}Backend logs: tail -f logs/backend.log${NC}"

# Start frontend in the background
echo -e "${YELLOW}Starting frontend server...${NC}"
cd frontend
npm install
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}Frontend started with PID ${FRONTEND_PID}${NC}"
echo -e "${YELLOW}Frontend logs: tail -f logs/frontend.log${NC}"

echo -e "${GREEN}Development environment started successfully!${NC}"
echo -e "${YELLOW}Frontend:${NC} http://localhost:8080"
echo -e "${YELLOW}Backend:${NC} http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Function to handle exit and kill background processes
function cleanup {
  echo -e "${YELLOW}Stopping servers...${NC}"
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  echo -e "${GREEN}All servers stopped${NC}"
  exit 0
}

# Trap Ctrl+C to properly shut down
trap cleanup SIGINT

# Keep script running until Ctrl+C
while true; do
  sleep 1
done
