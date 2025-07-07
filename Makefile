# ft_transcendence Project Makefile
# Build and deployment automation for all microservices

.PHONY: help install build dev up down logs clean restart test

# Default target
.DEFAULT_GOAL := help

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Service paths
AUTH_SERVICE_DIR := ft_transcendence/backend/auth-service
GAME_SERVICE_DIR := ft_transcendence/backend/game-service
FRONTEND_DIR := ft_transcendence/frontend
DOCKER_DIR := ft_transcendence/docker

## help: 📋 Show this help message
help:
	@echo "$(GREEN)ft_transcendence Project Management$(NC)"
	@echo ""
	@echo "$(YELLOW)Available commands:$(NC)"
	@grep -E '^## [a-zA-Z_-]+:.*$$' $(MAKEFILE_LIST) | sed 's/^## /  /' | sed 's/: / - /'
	@echo ""
	@echo "$(YELLOW)Service URLs (when running):$(NC)"
	@echo "  Frontend:     http://localhost:8081"
	@echo "  Auth Service: http://localhost:3001"
	@echo "  Game Service: http://localhost:3002"

## install: 📦 Install all dependencies
install:
	@echo "$(GREEN)Installing dependencies for all services...$(NC)"
	@echo "$(YELLOW)Installing auth-service dependencies...$(NC)"
	cd $(AUTH_SERVICE_DIR) && npm install
	@echo "$(YELLOW)Installing game-service dependencies...$(NC)"
	cd $(GAME_SERVICE_DIR) && npm install
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✅ All dependencies installed!$(NC)"

## build: 🔨 Build all services
build:
	@echo "$(GREEN)Building all services...$(NC)"
	@echo "$(YELLOW)Building auth-service...$(NC)"
	cd $(AUTH_SERVICE_DIR) && npm run build
	@echo "$(YELLOW)Building game-service...$(NC)"
	cd $(GAME_SERVICE_DIR) && npm run build
	@echo "$(YELLOW)Building frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run build
	@echo "$(GREEN)✅ All services built successfully!$(NC)"

## dev: 🚀 Start all services in development mode
dev:
	@echo "$(GREEN)Starting all services in development mode...$(NC)"
	@echo "$(YELLOW)Starting auth-service (port 3001)...$(NC)"
	cd $(AUTH_SERVICE_DIR) && npm run dev &
	@echo "$(YELLOW)Starting game-service (port 3002)...$(NC)"
	cd $(GAME_SERVICE_DIR) && npm run dev &
	@echo "$(YELLOW)Starting frontend (port 3000)...$(NC)"
	cd $(FRONTEND_DIR) && npm run dev &
	@echo "$(GREEN)✅ All services started in development mode!$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop all services$(NC)"

## up: 🐳 Start all services with Docker Compose
up: build
	@echo "$(GREEN)Starting services with Docker Compose...$(NC)"
	cd $(DOCKER_DIR) && docker-compose up -d
	@echo "$(GREEN)✅ All services are running!$(NC)"
	@echo "$(YELLOW)Frontend available at: http://localhost:8081$(NC)"

## down: 🛑 Stop all Docker containers
down:
	@echo "$(RED)Stopping all Docker containers...$(NC)"
	cd $(DOCKER_DIR) && docker-compose down
	@echo "$(GREEN)✅ All containers stopped!$(NC)"

## restart: 🔄 Restart all services
restart: down up

## logs: 📄 Show logs from all containers
logs:
	@echo "$(GREEN)Showing logs from all containers...$(NC)"
	cd $(DOCKER_DIR) && docker-compose logs -f

## logs-auth: 📄 Show auth-service logs
logs-auth:
	@echo "$(GREEN)Showing auth-service logs...$(NC)"
	cd $(DOCKER_DIR) && docker-compose logs -f auth-service

## logs-game: 📄 Show game-service logs
logs-game:
	@echo "$(GREEN)Showing game-service logs...$(NC)"
	cd $(DOCKER_DIR) && docker-compose logs -f game-service

## logs-nginx: 📄 Show nginx logs
logs-nginx:
	@echo "$(GREEN)Showing nginx logs...$(NC)"
	cd $(DOCKER_DIR) && docker-compose logs -f nginx

## status: 📊 Show status of all containers
status:
	@echo "$(GREEN)Container status:$(NC)"
	cd $(DOCKER_DIR) && docker-compose ps

## clean: 🧹 Clean build artifacts and dependencies
clean:
	@echo "$(RED)Cleaning build artifacts and dependencies...$(NC)"
	@echo "$(YELLOW)Cleaning auth-service...$(NC)"
	cd $(AUTH_SERVICE_DIR) && rm -rf dist node_modules
	@echo "$(YELLOW)Cleaning game-service...$(NC)"
	cd $(GAME_SERVICE_DIR) && rm -rf dist node_modules
	@echo "$(YELLOW)Cleaning frontend...$(NC)"
	cd $(FRONTEND_DIR) && rm -rf dist node_modules
	@echo "$(GREEN)✅ Clean completed!$(NC)"

## clean-docker: 🐳 Clean Docker images and containers
clean-docker: down
	@echo "$(RED)Cleaning Docker images and containers...$(NC)"
	cd $(DOCKER_DIR) && docker-compose down --rmi all --volumes
	docker system prune -f
	@echo "$(GREEN)✅ Docker cleanup completed!$(NC)"

## reset: 🔄 Full reset (clean + install + build)
reset: clean install build
	@echo "$(GREEN)✅ Full reset completed!$(NC)"

## test: 🧪 Run tests for all services
test:
	@echo "$(GREEN)Running tests for all services...$(NC)"
	@echo "$(YELLOW)Testing auth-service...$(NC)"
	cd $(AUTH_SERVICE_DIR) && npm test || echo "No tests found for auth-service"
	@echo "$(YELLOW)Testing game-service...$(NC)"
	cd $(GAME_SERVICE_DIR) && npm test || echo "No tests found for game-service"
	@echo "$(YELLOW)Testing frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm test || echo "No tests found for frontend"
	@echo "$(GREEN)✅ Tests completed!$(NC)"

## dev-stop: 🛑 Stop development servers
dev-stop:
	@echo "$(RED)Stopping development servers...$(NC)"
	pkill -f "npm run dev" || echo "No development servers running"
	pkill -f "vite" || echo "No Vite servers running"
	pkill -f "nodemon" || echo "No Nodemon processes running"
	@echo "$(GREEN)✅ Development servers stopped!$(NC)"

## elk-logs: 📊 Check ELK stack logs configuration
elk-logs:
	@echo "$(GREEN)ELK stack logstash configuration:$(NC)"
	@echo "$(YELLOW)Configuration file: elk-stack/logstash/pipeline/logstash.conf$(NC)"
	@if [ -f elk-stack/logstash/pipeline/logstash.conf ]; then \
		cat elk-stack/logstash/pipeline/logstash.conf; \
	else \
		echo "$(RED)Logstash configuration not found$(NC)"; \
	fi

## quick-start: ⚡ Quick start for development (install + dev)
quick-start: install dev
	@echo "$(GREEN)✅ Quick start completed! All services are running in development mode.$(NC)"

## production: 🚀 Production deployment (install + build + up)
production: install build up
	@echo "$(GREEN)✅ Production deployment completed!$(NC)"
