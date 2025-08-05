.PHONY: help start restart stop force-stop install clean build start-safe docker-start docker-stop docker-restart

.DEFAULT_GOAL := help

GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
BLUE := \033[0;34m
NC := \033[0m

AUTH_SERVICE_DIR := ft_transcendence/backend/auth-service
GAME_SERVICE_DIR := ft_transcendence/backend/game-service
FRONTEND_DIR := ft_transcendence/frontend
DOCKER_DIR := ft_transcendence/docker

help:
	@echo "$(GREEN)🎮 ft_transcendence Project$(NC)"
	@echo ""
	@echo "$(YELLOW)Main Commands:$(NC)"
	@echo "  $(BLUE)make start$(NC)      - 🚀 Start all services with Docker"
	@echo "  $(BLUE)make restart$(NC)    - 🔄 Restart all services with Docker"
	@echo "  $(BLUE)make stop$(NC)       - 🛑 Stop all services with Docker"
	@echo "  $(BLUE)make force-stop$(NC) - 💀 Force kill all processes and free ports"
	@echo "  $(BLUE)make start-safe$(NC) - 🚀 Start all services safely (without force-stop)"
	@echo ""
	@echo "$(YELLOW)Docker Commands:$(NC)"
	@echo "  $(BLUE)make docker-start$(NC)   - 🐳 Start Docker containers"
	@echo "  $(BLUE)make docker-stop$(NC)    - 🐳 Stop Docker containers"
	@echo "  $(BLUE)make docker-restart$(NC) - 🐳 Restart Docker containers"
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
	@echo "  Game Service: http://localhost:3002"

install:
	@echo "$(GREEN)📦 Installing dependencies...$(NC)"
	@echo "$(YELLOW)  ➤ Auth service...$(NC)"
	@cd $(AUTH_SERVICE_DIR) && npm install
	@echo "$(YELLOW)  ➤ Game service...$(NC)"
	@cd $(GAME_SERVICE_DIR) && npm install
	@echo "$(YELLOW)  ➤ Frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✅ All dependencies installed!$(NC)"

build: install
	@echo "$(GREEN)🔨 Building services...$(NC)"
	@echo "$(YELLOW)  ➤ Building auth service...$(NC)"
	@cd $(AUTH_SERVICE_DIR) && npm run build
	@echo "$(YELLOW)  ➤ Building game service...$(NC)"
	@cd $(GAME_SERVICE_DIR) && npm run build
	@echo "$(GREEN)✅ All services built!$(NC)"

docker-start:
	@echo "$(GREEN)🐳 Starting Docker containers...$(NC)"
	@cd $(DOCKER_DIR) && docker-compose up -d
	@sleep 5
	@echo "$(GREEN)✅ Docker containers started!$(NC)"
	@echo ""
	@echo "$(BLUE)🌐 Open: http://localhost:3000$(NC)"
	@echo "$(YELLOW)📊 Status: make docker-status$(NC)"
	@echo "$(RED)🛑 Stop: make docker-stop$(NC)"

docker-stop:
	@echo "$(RED)🐳 Stopping Docker containers...$(NC)"
	@cd $(DOCKER_DIR) && docker-compose down
	@echo "$(GREEN)✅ Docker containers stopped!$(NC)"

docker-restart:
	@echo "$(YELLOW)🔄 Restarting Docker containers...$(NC)"
	@cd $(DOCKER_DIR) && docker-compose down
	@cd $(DOCKER_DIR) && docker-compose up -d
	@sleep 5
	@echo "$(GREEN)✅ Docker containers restarted!$(NC)"
	@echo ""
	@echo "$(BLUE)🌐 Open: http://localhost:3000$(NC)"

start: logs docker-start
	@echo "$(GREEN)✅ All services started with Docker!$(NC)"

restart: docker-restart
	@echo "$(GREEN)✅ All services restarted with Docker!$(NC)"

stop: docker-stop
	@echo "$(GREEN)✅ All services stopped with Docker!$(NC)"

auth-start: logs
	@echo "$(GREEN)🔐 Starting auth service...$(NC)"
	@cd $(AUTH_SERVICE_DIR) && npm run build > /dev/null 2>&1
	@cd $(AUTH_SERVICE_DIR) && node dist/app.js > ../../../logs/auth.log 2>&1 &
	@sleep 2
	@echo "$(GREEN)✅ Auth service started on port 3001$(NC)"

auth-stop:
	@echo "$(RED)🔐 Stopping auth service...$(NC)"
	@lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "  ➤ Port 3001 is free"
	@echo "$(GREEN)✅ Auth service stopped!$(NC)"

force-stop:
	@echo "$(RED)💀 Force stopping all processes...$(NC)"
	@mkdir -p logs
	@echo "$(YELLOW)  ➤ Killing all Node.js processes...$(NC)"
	@pkill -f "node.*app.js" 2>/dev/null || echo "  ➤ No app.js processes"
	@pkill -f "ts-node" 2>/dev/null || echo "  ➤ No ts-node processes"
	@pkill -f "nodemon" 2>/dev/null || echo "  ➤ No nodemon processes"
	@pkill -f "npm run dev" 2>/dev/null || echo "  ➤ No npm dev processes"
	@pkill -f "vite" 2>/dev/null || echo "  ➤ No vite processes"
	@echo "$(YELLOW)  ➤ Killing remaining ft_transcendence processes...$(NC)"
	@pkill -f "ft_transcendence" 2>/dev/null || echo "  ➤ No ft_transcendence processes"
	@sleep 2
	@echo "$(GREEN)✅ All processes forcefully stopped!$(NC)"

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

start-safe: install logs build
	@echo "$(GREEN)🚀 Starting ft_transcendence services safely...$(NC)"
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
	@echo "$(YELLOW)📊 Logs: tail -f logs/*.log$(NC)"
	@echo "$(RED)🛑 Stop: make stop$(NC)"

logs:
	@mkdir -p logs
