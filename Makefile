# ft_transcendence - Simple Project Management
# Main commands: start, restart, stop

.PHONY: help start restart stop force-stop install clean build

# Default target
.DEFAULT_GOAL := help

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Service paths
AUTH_SERVICE_DIR := ft_transcendence/backend/auth-service
GAME_SERVICE_DIR := ft_transcendence/backend/game-service
FRONTEND_DIR := ft_transcendence/frontend

## help: 📋 Show available commands
help:
	@echo "$(GREEN)🎮 ft_transcendence Project$(NC)"
	@echo ""
	@echo "$(YELLOW)Main Commands:$(NC)"
	@echo "  $(BLUE)make start$(NC)      - 🚀 Start all services (with force cleanup)"
	@echo "  $(BLUE)make restart$(NC)    - 🔄 Restart all services (with force cleanup)"
	@echo "  $(BLUE)make stop$(NC)       - 🛑 Stop all services"
	@echo "  $(BLUE)make force-stop$(NC) - 💀 Force kill all processes and free ports"
	@echo ""
	@echo "$(YELLOW)Setup Commands:$(NC)"
	@echo "  $(BLUE)make install$(NC) - 📦 Install dependencies"
	@echo "  $(BLUE)make build$(NC)   - 🔨 Build all services"
	@echo "  $(BLUE)make clean$(NC)   - 🧹 Clean everything"
	@echo ""
	@echo "$(YELLOW)Individual Services:$(NC)"
	@echo "  $(BLUE)make auth-start$(NC)  - 🔐 Start only auth service"
	@echo "  $(BLUE)make auth-stop$(NC)   - 🔐 Stop only auth service"
	@echo ""
	@echo "$(YELLOW)Service URLs:$(NC)"
	@echo "  Frontend:     http://localhost:3000"
	@echo "  Auth Service: http://localhost:3001"
	@echo "  Game Service: http://localhost:8080"

## install: 📦 Install all dependencies
install:
	@echo "$(GREEN)📦 Installing dependencies...$(NC)"
	@echo "$(YELLOW)  ➤ Auth service...$(NC)"
	@cd $(AUTH_SERVICE_DIR) && npm install
	@echo "$(YELLOW)  ➤ Game service...$(NC)"
	@cd $(GAME_SERVICE_DIR) && npm install
	@echo "$(YELLOW)  ➤ Frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✅ All dependencies installed!$(NC)"

## build: 🔨 Build all services
build: install
	@echo "$(GREEN)🔨 Building services...$(NC)"
	@echo "$(YELLOW)  ➤ Building auth service...$(NC)"
	@cd $(AUTH_SERVICE_DIR) && npm run build
	@echo "$(YELLOW)  ➤ Building game service...$(NC)"
	@cd $(GAME_SERVICE_DIR) && npm run build
	@echo "$(GREEN)✅ All services built!$(NC)"

## start: 🚀 Start all services
start: force-stop install logs build
	@echo "$(GREEN)🚀 Starting ft_transcendence services...$(NC)"
	@echo "$(YELLOW)  ➤ Starting auth-service (port 3001)...$(NC)"
	@cd $(AUTH_SERVICE_DIR) && node dist/app.js > ../../../logs/auth.log 2>&1 &
	@sleep 2
	@echo "$(YELLOW)  ➤ Starting game-service (port 8080)...$(NC)"
	@cd $(GAME_SERVICE_DIR) && npm run dev > ../../../logs/game.log 2>&1 &
	@sleep 2
	@echo "$(YELLOW)  ➤ Starting frontend (port 3000)...$(NC)"
	@cd $(FRONTEND_DIR) && npm run dev > ../../logs/frontend.log 2>&1 &
	@sleep 3
	@echo "$(GREEN)✅ All services started!$(NC)"
	@echo ""
	@echo "$(BLUE)🌐 Open: http://localhost:3000$(NC)"
	@echo "$(YELLOW)📋 Logs: tail -f logs/*.log$(NC)"
	@echo "$(RED)🛑 Stop: make stop$(NC)"

## auth-start: 🔐 Start only auth service
auth-start: logs
	@echo "$(GREEN)🔐 Starting auth service...$(NC)"
	@cd $(AUTH_SERVICE_DIR) && npm run build > /dev/null 2>&1
	@cd $(AUTH_SERVICE_DIR) && node dist/app.js > ../../../logs/auth.log 2>&1 &
	@sleep 2
	@echo "$(GREEN)✅ Auth service started on port 3001$(NC)"

## auth-stop: 🔐 Stop only auth service
auth-stop:
	@echo "$(RED)🔐 Stopping auth service...$(NC)"
	@lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "  ➤ Port 3001 is free"
	@echo "$(GREEN)✅ Auth service stopped!$(NC)"

## force-stop: 💀 Aggressively stop all processes
force-stop:
	@echo "$(RED)💀 Force stopping all processes...$(NC)"
	@mkdir -p logs
	@echo "$(YELLOW)  ➤ Killing all Node.js processes...$(NC)"
	@pkill -f "node.*app.js" 2>/dev/null || echo "  ➤ No app.js processes"
	@pkill -f "ts-node" 2>/dev/null || echo "  ➤ No ts-node processes"
	@pkill -f "nodemon" 2>/dev/null || echo "  ➤ No nodemon processes"
	@pkill -f "npm run dev" 2>/dev/null || echo "  ➤ No npm dev processes"
	@pkill -f "vite" 2>/dev/null || echo "  ➤ No vite processes"
	@echo "$(YELLOW)  ➤ Killing processes by port...$(NC)"
	@lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "  ➤ Port 3001 is free"
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "  ➤ Port 3000 is free"
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || echo "  ➤ Port 8080 is free"
	@echo "$(YELLOW)  ➤ Killing remaining ft_transcendence processes...$(NC)"
	@pkill -f "ft_transcendence" 2>/dev/null || echo "  ➤ No ft_transcendence processes"
	@sleep 2
	@echo "$(YELLOW)  ➤ Final port check...$(NC)"
	@if lsof -ti:3000,3001,8080 >/dev/null 2>&1; then \
		echo "$(RED)  ⚠️  Some ports still occupied, force killing...$(NC)"; \
		lsof -ti:3000,3001,8080 | xargs kill -9 2>/dev/null || true; \
		sleep 1; \
	fi
	@echo "$(GREEN)✅ All processes forcefully stopped!$(NC)"

## restart: 🔄 Restart all services
restart: force-stop start
	@echo "$(GREEN)✅ Services restarted!$(NC)"

## stop: 🛑 Stop all services
stop:
	@echo "$(RED)🛑 Stopping all services...$(NC)"
	@mkdir -p logs
	@echo "$(YELLOW)  ➤ Stopping processes on ports 3000, 3001, 8080...$(NC)"
	@lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "  ➤ Port 3001 is free"
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "  ➤ Port 3000 is free"
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || echo "  ➤ Port 8080 is free"
	@pkill -f "npm run dev" 2>/dev/null || echo "  ➤ No npm dev processes"
	@pkill -f "nodemon" 2>/dev/null || echo "  ➤ No nodemon processes"
	@pkill -f "node dist/app.js" 2>/dev/null || echo "  ➤ No auth service processes"
	@sleep 1
	@echo "$(GREEN)✅ All services stopped!$(NC)"

## clean: 🧹 Clean everything (stop + remove dependencies)
clean: stop
	@echo "$(RED)🧹 Cleaning everything...$(NC)"
	@echo "$(YELLOW)  ➤ Removing node_modules...$(NC)"
	@rm -rf $(AUTH_SERVICE_DIR)/node_modules
	@rm -rf $(GAME_SERVICE_DIR)/node_modules
	@rm -rf $(FRONTEND_DIR)/node_modules
	@echo "$(YELLOW)  ➤ Removing build files...$(NC)"
	@rm -rf $(AUTH_SERVICE_DIR)/dist
	@rm -rf $(GAME_SERVICE_DIR)/dist
	@rm -rf $(FRONTEND_DIR)/dist
	@echo "$(YELLOW)  ➤ Removing logs...$(NC)"
	@rm -rf logs
	@echo "$(GREEN)✅ Everything cleaned!$(NC)"

# Create logs directory
logs:
	@mkdir -p logs
