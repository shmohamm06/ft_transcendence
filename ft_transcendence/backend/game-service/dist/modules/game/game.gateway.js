"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const game_engine_1 = require("./game.engine");
const ai_opponent_1 = require("./ai.opponent");
class GameGateway {
    constructor() {
        this.clients = new Map();
        console.log('GameGateway initialized');
    }
    handleConnection(client, connectionInfo) {
        const clientId = connectionInfo.url || Math.random().toString(36);
        console.log(`Client ${clientId} connected to game service`);
        // Determine game mode from URL parameters
        const url = new URL(connectionInfo.url, 'http://localhost');
        const gameMode = url.searchParams.get('mode') === 'pvp' ? 'pvp' : 'ai';
        console.log(`Game mode: ${gameMode}`);
        const gameEngine = new game_engine_1.GameEngine();
        const aiOpponent = new ai_opponent_1.AIOpponent();
        // Try to load user settings from query parameters or headers
        this.loadUserSettings(connectionInfo).then(settings => {
            if (settings.ballSpeed !== undefined) {
                (0, game_engine_1.setGlobalBallSpeedMultiplier)(settings.ballSpeed / 6); // 6 - базовая скорость мяча
                console.log(`Applied ball speed multiplier: ${settings.ballSpeed / 6}`);
            }
            if (settings.paddleSpeed !== undefined) {
                (0, game_engine_1.setGlobalPaddleSpeedMultiplier)(settings.paddleSpeed / 8); // 8 - базовая скорость ракетки
                console.log(`Applied paddle speed multiplier: ${settings.paddleSpeed / 8}`);
            }
        }).catch(err => {
            console.log('Could not load user settings:', err.message);
        });
        // Start game loop
        const gameLoop = setInterval(() => {
            gameEngine.update();
            const gameState = gameEngine.getGameState();
            if (gameState.gameStatus === 'playing' && gameMode === 'ai') {
                const aiMove = aiOpponent.getMove(gameState);
                if (aiMove) {
                    gameEngine.moveAIPaddle(aiMove);
                }
            }
            // Send game state to client
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(JSON.stringify({ type: 'gameState', data: gameState }));
            }
        }, 1000 / 60); // 60 FPS
        // Store client data
        this.clients.set(clientId, {
            socket: client,
            gameEngine,
            aiOpponent,
            gameLoop,
            gameMode
        });
        client.on('message', (data) => {
            this.handleMessage(clientId, data);
        });
        client.on('close', () => {
            console.log(`Client ${clientId} disconnected from game service`);
            const clientData = this.clients.get(clientId);
            if (clientData) {
                clearInterval(clientData.gameLoop);
                this.clients.delete(clientId);
            }
        });
        client.on('error', (error) => {
            console.error(`WebSocket error for client ${clientId}:`, error);
            const clientData = this.clients.get(clientId);
            if (clientData) {
                clearInterval(clientData.gameLoop);
                this.clients.delete(clientId);
            }
        });
        // Start a new match immediately
        gameEngine.startNewMatch();
    }
    async loadUserSettings(connectionInfo) {
        try {
            // Try to extract token from URL parameters
            const url = new URL(connectionInfo.url, 'http://localhost');
            const token = url.searchParams.get('token') || connectionInfo.headers?.authorization?.replace('Bearer ', '');
            if (!token) {
                throw new Error('No token provided');
            }
            console.log('Attempting to load user settings with token:', token.substring(0, 20) + '...');
            // Make request to auth service to get user settings
            const response = await fetch('http://localhost:3001/api/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`Auth service responded with ${response.status}`);
            }
            const settings = await response.json();
            const result = {};
            settings.forEach((setting) => {
                if (setting.key === 'ballSpeed') {
                    result.ballSpeed = parseInt(setting.value);
                }
                else if (setting.key === 'paddleSpeed') {
                    result.paddleSpeed = parseInt(setting.value);
                }
            });
            console.log('Loaded user settings:', result);
            return result;
        }
        catch (error) {
            console.log('Failed to load user settings:', error);
            throw error;
        }
    }
    handleMessage(clientId, data) {
        try {
            const message = JSON.parse(data.toString());
            const clientData = this.clients.get(clientId);
            if (!clientData) {
                console.error(`Client ${clientId} not found`);
                return;
            }
            const { gameEngine, gameMode } = clientData;
            // Handle both 'action' and 'type' formats for compatibility
            const actionType = message.action || message.type;
            switch (actionType) {
                case 'move':
                    if (message.direction) {
                        if (gameMode === 'pvp' && message.player) {
                            // PvP mode: handle specific player moves
                            gameEngine.movePaddle(message.player, message.direction);
                            console.log(`PvP move: ${message.player} ${message.direction}`);
                        }
                        else {
                            // AI mode: always move player1
                            gameEngine.movePaddle('player1', message.direction);
                            console.log(`AI mode move: player1 ${message.direction}`);
                        }
                    }
                    break;
                case 'settings':
                    if (message.ballSpeed !== undefined) {
                        // Преобразуем значение от 1-10 в множитель
                        const ballMultiplier = message.ballSpeed / 6; // 6 - базовая скорость
                        (0, game_engine_1.setGlobalBallSpeedMultiplier)(ballMultiplier);
                        // Применяем настройки ко всем активным играм
                        this.clients.forEach((clientData, id) => {
                            if (message.ballSpeed !== undefined) {
                                clientData.gameEngine.setBallSpeed(message.ballSpeed);
                            }
                        });
                        console.log(`Updated ball speed to: ${message.ballSpeed} (multiplier: ${ballMultiplier}) for all active games`);
                    }
                    if (message.paddleSpeed !== undefined) {
                        // Преобразуем значение от 1-10 в множитель
                        const paddleMultiplier = message.paddleSpeed / 8; // 8 - базовая скорость
                        (0, game_engine_1.setGlobalPaddleSpeedMultiplier)(paddleMultiplier);
                        // Применяем настройки ко всем активным играм
                        this.clients.forEach((clientData, id) => {
                            if (message.paddleSpeed !== undefined) {
                                clientData.gameEngine.setPaddleSpeed(message.paddleSpeed);
                            }
                        });
                        console.log(`Updated paddle speed to: ${message.paddleSpeed} (multiplier: ${paddleMultiplier}) for all active games`);
                    }
                    break;
                case 'startNewMatch':
                    gameEngine.startNewMatch();
                    console.log('Started new match');
                    break;
                case 'startGame':
                    gameEngine.startCountdown();
                    console.log('Started countdown');
                    break;
            }
        }
        catch (error) {
            console.error('Error parsing message:', error);
        }
    }
    handleDisconnect(client) {
        // This method is called when a client disconnects
        console.log('Client disconnected from game service');
    }
}
exports.GameGateway = GameGateway;
