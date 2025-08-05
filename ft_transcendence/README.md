# 🎮 ft_transcendence

A modern Pong game with JWT authentication, real-time gameplay, and game statistics tracking.

## ✨ Features

- 🤖 **AI Mode**: Play against smart AI opponent
- 👥 **PvP Mode**: Local multiplayer (W/S vs Arrow keys)
- 🏆 **Tournament Mode**: Bracket-style tournaments
- 📊 **Game Statistics**: Track wins, losses, and win rates
- 👤 **User Profiles**: Authentication with game history
- ⚙️ **Custom Settings**: Adjustable ball and paddle speed
- 📱 **Real-time Updates**: WebSocket-powered gameplay

## 🏗️ Architecture

**3 Microservices:**

- **Frontend** (React + Vite) → `localhost:3000`
- **Auth Service** (Node.js + Fastify + SQLite) → `localhost:3001`
- **Game Service** (Node.js + WebSocket) → `localhost:8080`

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm

### Get Started

```bash
# 1. Install dependencies
make install

# 2. Start all services
make start

# 3. Open your browser
open http://localhost:3000
```

That's it! 🎉

## 📋 Commands

### Main Commands

```bash
make start    # 🚀 Start all services
make restart  # 🔄 Restart all services
make stop     # 🛑 Stop all services
```

### Setup Commands

```bash
make install  # 📦 Install dependencies
make clean    # 🧹 Clean everything
make help     # 📋 Show help
```

## 🎯 How to Play

1. **Register/Login** at `http://localhost:3000`
2. **Choose Game Mode:**
   - **🤖 AI Mode**: Practice against computer
   - **👥 PvP Mode**: Play with a friend locally
   - **🏆 Tournament**: Create tournaments with multiple players
3. **Controls:**
   - **Player 1**: W (up) / S (down)
   - **Player 2**: ↑ (up) / ↓ (down)
4. **View Stats**: Check your profile for game statistics

## 🔧 Game Settings

Customize your gameplay experience:

- **Ball Speed**: 1-10 (affects game pace)
- **Paddle Speed**: 1-10 (affects responsiveness)

Settings are saved to your profile automatically.

## 📊 Statistics Tracking

- **Overall Stats**: Total games, wins, losses, win rate
- **Game-Specific**: Separate stats for Pong and Tic-Tac-Toe
- **AI Games Only**: Only games against AI are recorded
- **Real-time Updates**: Stats update immediately after games

## 🔄 Development Workflow

### Making Changes

```bash
# Stop services
make stop

# Make your code changes...

# Restart to see changes
make start
```

### Viewing Logs

```bash
# View logs from all services
tail -f logs/*.log

# View specific service
tail -f logs/auth.log
tail -f logs/game.log
tail -f logs/frontend.log
```

### Troubleshooting

**Port conflicts?**

```bash
make stop  # Force kills processes on ports 3000, 3001, 8080
make start
```

**Something broken?**

```bash
make clean    # Nuclear reset
make install  # Reinstall everything
make start    # Fresh start
```

## 📁 Project Structure

```
ft_transcendence/
├── Makefile                    # 🛠️ Simple build commands
├── README.md                   # 📖 This file
├── logs/                       # 📋 Service logs
├── ft_transcendence/
│   ├── backend/
│   │   ├── auth-service/       # 🔐 JWT auth + SQLite
│   │   └── game-service/       # 🎮 WebSocket game engine
│   └── frontend/               # ⚛️ React + TypeScript
└── package.json
```

## 🔐 Authentication Flow

1. **Register** with username/email/password
2. **Login** to receive JWT token
3. **Token stored** in localStorage
4. **Auto-login** on page refresh
5. **Protected routes** redirect to login if needed

## 🎮 Game Engine

- **Real-time WebSocket** communication
- **60 FPS** smooth gameplay
- **Smart AI opponent** with adjustable difficulty
- **Collision detection** with precise physics
- **Score tracking** with win conditions
- **Tournament bracket** management

## 🗄️ Data Storage

- **User accounts**: SQLite database
- **Game statistics**: SQLite with real-time updates
- **Game settings**: LocalStorage + database sync
- **Session data**: JWT tokens in localStorage

## 🚀 Production Notes

This is a development setup. For production:

- Use environment variables for secrets
- Set up proper database (PostgreSQL)
- Configure reverse proxy (Nginx)
- Enable HTTPS
- Set up proper logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test with `make restart`
5. Submit a pull request

## 📝 License

MIT License

---

**Need help?** Run `make help` or check the logs in `logs/` directory.






