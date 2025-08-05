# Docker Setup for ft_transcendence

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Navigate to the docker directory:**

   ```bash
   cd ft_transcendence/docker
   ```

2. **Set up environment variables (optional):**
   Create a `.env` file in the docker directory with:

   ```
   CLIENT_ID=your_42_oauth_client_id
   CLIENT_SECRET=your_42_oauth_client_secret
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Build and start all services:**

   ```bash
   docker-compose up -d --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Auth Service: http://localhost:3001
   - Game Service: http://localhost:3002

## Commands

### Start services

```bash
docker-compose up -d
```

### Stop services

```bash
docker-compose down
```

### View logs

```bash
docker-compose logs -f
```

### Rebuild and restart

```bash
docker-compose up -d --build
```

### View running containers

```bash
docker-compose ps
```

## Services

- **auth-service**: Authentication and user management (port 3001)
- **game-service**: Game logic and WebSocket connections (port 3002)
- **nginx**: Frontend server (port 3000)

## Volumes

- `auth_data`: Persistent storage for SQLite database

## Troubleshooting

### If auth-service fails to start:

1. Check if sqlite3 is properly rebuilt:

   ```bash
   docker-compose logs auth-service
   ```

2. Rebuild the auth-service container:
   ```bash
   docker-compose build auth-service
   docker-compose up -d auth-service
   ```

### If ports are already in use:

1. Stop local services:

   ```bash
   make stop
   ```

2. Or change ports in docker-compose.yml

## Development

For development, you can use the Makefile commands:

- `make start` - Run without Docker
- `make docker-start` - Run with Docker Compose
