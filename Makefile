# ft_transcendence - Simple Project Management
# Main commands: start, restart, stop

.PHONY: help start restart stop install clean

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
	@echo "  $(BLUE)make start$(NC)   - 🚀 Start all services (auth, game, frontend)"
	@echo "  $(BLUE)make restart$(NC) - 🔄 Restart all services"
	@echo "  $(BLUE)make stop$(NC)    - 🛑 Stop all services"
	@echo ""
	@echo "$(YELLOW)Setup Commands:$(NC)"
	@echo "  $(BLUE)make install$(NC) - 📦 Install dependencies"
	@echo "  $(BLUE)make clean$(NC)   - 🧹 Clean everything"
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

## start: 🚀 Start all services
start:
	@echo "$(GREEN)🚀 Starting ft_transcendence services...$(NC)"
	@echo "$(YELLOW)  ➤ Starting auth-service (port 3001)...$(NC)"
	@cd $(AUTH_SERVICE_DIR) && npm run dev > ../../../logs/auth.log 2>&1 &
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

## restart: 🔄 Restart all services
restart: stop start
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
