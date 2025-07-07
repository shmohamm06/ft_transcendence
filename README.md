# ft_transcendence

A modern Pong game implementation with microservices architecture using React, TypeScript, Node.js, and WebSocket.

## 🏗️ Architecture

The project consists of three main services:

- **Frontend (React + TypeScript + Vite)** - Game UI and client-side logic
- **Auth Service (Node.js + Fastify)** - User authentication and settings management
- **Game Service (Node.js + WebSocket)** - Real-time game engine and multiplayer logic

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker & Docker Compose
- Make (for using Makefile commands)

### Development Setup

1. **Clone and install dependencies:**

   ```bash
   make install
   ```

2. **Start all services in development mode:**

   ```bash
   make dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Auth Service: http://localhost:3001
   - Game Service: http://localhost:3002

### Production Setup

1. **Deploy to production:**

   ```bash
   make production
   ```

2. **Access the application:**
   - Frontend: http://localhost:8081
   - Auth Service: http://localhost:3001
   - Game Service: http://localhost:3002

## 📋 Available Commands

Run `make help` to see all available commands with descriptions.

### Essential Commands

| Command        | Description                           |
| -------------- | ------------------------------------- |
| `make help`    | Show all available commands           |
| `make install` | Install dependencies for all services |
| `make build`   | Build all services                    |
| `make dev`     | Start development servers             |
| `make up`      | Start production with Docker          |
| `make down`    | Stop Docker containers                |
| `make logs`    | Show logs from all containers         |
| `make clean`   | Clean build artifacts                 |

### Development Commands

| Command            | Description                           |
| ------------------ | ------------------------------------- |
| `make quick-start` | Install dependencies + start dev mode |
| `make dev-stop`    | Stop all development servers          |
| `make test`        | Run tests for all services            |
| `make reset`       | Full reset (clean + install + build)  |

### Production Commands

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `make production` | Full production deployment   |
| `make restart`    | Restart all Docker services  |
| `make status`     | Show Docker container status |
| `make logs-auth`  | Show auth-service logs only  |
| `make logs-game`  | Show game-service logs only  |
| `make logs-nginx` | Show nginx logs only         |

### Cleanup Commands

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `make clean`        | Remove build artifacts and node_modules |
| `make clean-docker` | Remove Docker images and containers     |

## 🎮 Game Features

- **Single Player**: Play against AI opponent
- **Multiplayer**: Local PvP mode (W/S vs Arrow keys)
- **Tournament Mode**: Bracket-style tournament with multiple players
- **Real-time gameplay** with WebSocket communication
- **Customizable settings**: Ball speed, paddle speed
- **Responsive design** with modern UI

## 🛠️ Development Workflow

### Starting Development

```bash
# Install dependencies and start dev servers
make quick-start

# Or step by step:
make install
make build
make dev
```

### Making Changes

1. Edit code in any service
2. Changes auto-reload in development mode
3. Test your changes
4. Build and test production deployment:
   ```bash
   make production
   ```

### Debugging

```bash
# View logs from specific service
make logs-auth
make logs-game
make logs-nginx

# View all logs
make logs

# Check container status
make status
```

### Cleanup

```bash
# Clean build artifacts
make clean

# Full cleanup including Docker
make clean-docker

# Reset everything
make reset
```

## 🐳 Docker Services

The application runs in Docker containers with the following configuration:

- **auth-service**: Port 3001 → Container Port 3000
- **game-service**: Port 3002 → Container Port 8080
- **nginx (frontend)**: Port 8081 → Container Port 80

## 📁 Project Structure

```
.
├── Makefile                     # Project build automation
├── README.md                    # This file
├── elk-stack/                   # ELK stack configuration
│   └── logstash/
├── ft_transcendence/           # Main application
│   ├── backend/
│   │   ├── auth-service/       # Authentication microservice
│   │   └── game-service/       # Game engine microservice
│   ├── docker/
│   │   └── docker-compose.yml  # Production deployment
│   └── frontend/               # React frontend application
└── package.json                # Root package configuration
```

## 🔧 Configuration

### Environment Variables

Development and production configurations are handled automatically by the Makefile and Docker Compose.

### Game Settings

Settings are managed through the frontend settings page and persisted via:

- LocalStorage (frontend)
- SQLite database (auth-service)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `make test`
5. Build production with `make production`
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Port Conflicts

If you get port conflicts, ensure no other services are running on:

- 3000 (Frontend dev)
- 3001 (Auth service)
- 3002 (Game service)
- 8081 (Production frontend)

### Docker Issues

```bash
# Clean Docker completely and restart
make clean-docker
make production
```

### Development Server Issues

```bash
# Stop all dev servers and restart
make dev-stop
make dev
```

### Full Reset

```bash
# Nuclear option - reset everything
make reset
make quick-start
```

---

For more detailed information about each service, check the README files in their respective directories.
