"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const game_engine_1 = require("./game.engine");
const ai_opponent_1 = require("./ai.opponent");
class GameGateway {
    constructor() {
        this.clients = new Map();
        this.performanceStats = {
            totalClients: 0,
            activeClients: 0,
            lastCleanup: Date.now()
        };
        console.log('GameGateway initialized');
        setInterval(() => {
            this.cleanupStaleConnections();
        }, 30000);
    }
    cleanupStaleConnections() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [clientId, clientData] of this.clients.entries()) {
            if (clientData.socket.readyState !== 1) {
                console.log(`Cleaning up stale connection: ${clientId}`);
                this.cleanupClient(clientId);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} stale connections`);
        }
        this.performanceStats.activeClients = this.clients.size;
        this.performanceStats.lastCleanup = now;
    }
    cleanupClient(clientId) {
        const clientData = this.clients.get(clientId);
        if (clientData) {
            try {
                clearInterval(clientData.gameLoop);
                console.log(`Cleaned up game loop for client ${clientId}`);
            }
            catch (error) {
                console.error(`Error cleaning up client ${clientId}:`, error);
            }
            this.clients.delete(clientId);
        }
    }
    handleConnection(client, connectionInfo) {
        const clientId = connectionInfo.url || Math.random().toString(36);
        console.log(`Client ${clientId} connected to game service`);
        const url = new URL(connectionInfo.url, 'http://localhost');
        const gameMode = url.searchParams.get('mode') === 'pvp' ? 'pvp' : 'ai';
        console.log(`Game mode: ${gameMode}`);
        const gameEngine = new game_engine_1.GameEngine();
        const aiOpponent = new ai_opponent_1.AIOpponent();
        this.loadUserSettings(connectionInfo).then(settings => {
            if (settings.ballSpeed !== undefined) {
                (0, game_engine_1.setGlobalBallSpeedMultiplier)(settings.ballSpeed / 6); // 6 - base ball speed
                console.log(`Applied ball speed multiplier: ${settings.ballSpeed / 6}`);
            }
            if (settings.paddleSpeed !== undefined) {
                (0, game_engine_1.setGlobalPaddleSpeedMultiplier)(settings.paddleSpeed / 8); // 8 - base paddle speed
                console.log(`Applied paddle speed multiplier: ${settings.paddleSpeed / 8}`);
            }
        }).catch(err => {
            console.log('Could not load user settings:', err.message);
        });
        let lastSendTime = 0;
        const minSendInterval = 16;
        const gameLoop = setInterval(() => {
            try {
                gameEngine.update();
                const gameState = gameEngine.getGameState();
                if (gameState.gameStatus === 'playing' && gameMode === 'ai') {
                    const aiMove = aiOpponent.getMove(gameState);
                    if (aiMove) {
                        gameEngine.moveAIPaddle(aiMove);
                    }
                }
                const now = Date.now();
                if (client.readyState === 1 && (now - lastSendTime >= minSendInterval)) {
                    try {
                        const message = JSON.stringify({ type: 'gameState', data: gameState });
                        if (client.bufferedAmount < 1024 * 1024) {
                            client.send(message);
                            lastSendTime = now;
                        }
                        else {
                            console.warn(`WebSocket buffer overflow for client ${clientId}, skipping send`);
                        }
                    }
                    catch (sendError) {
                        console.error(`Error sending game state to client ${clientId}:`, sendError);
                    }
                }
            }
            catch (error) {
                console.error(`Error in game loop for client ${clientId}:`, error);
            }
        }, 1000 / 60);
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
            this.cleanupClient(clientId);
        });
        client.on('error', (error) => {
            console.error(`WebSocket error for client ${clientId}:`, error);
            this.cleanupClient(clientId);
        });
        gameEngine.startNewMatch();
    }
    async loadUserSettings(connectionInfo) {
        try {
            const url = new URL(connectionInfo.url, 'http://localhost');
            const token = url.searchParams.get('token') || connectionInfo.headers?.authorization?.replace('Bearer ', '');
            if (!token) {
                throw new Error('No token provided');
            }
            console.log('Attempting to load user settings with token:', token.substring(0, 20) + '...');
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
            const actionType = message.action || message.type;
            switch (actionType) {
                case 'move':
                    if (message.direction) {
                        if (gameMode === 'pvp' && message.player) {
                            gameEngine.movePaddle(message.player, message.direction);
                            console.log(`PvP move: ${message.player} ${message.direction}`);
                        }
                        else {
                            gameEngine.movePaddle('player1', message.direction);
                            console.log(`AI mode move: player1 ${message.direction}`);
                        }
                    }
                    break;
                case 'settings':
                    if (message.ballSpeed !== undefined) {
                        const ballMultiplier = message.ballSpeed / 6;
                        (0, game_engine_1.setGlobalBallSpeedMultiplier)(ballMultiplier);
                        this.clients.forEach((clientData, id) => {
                            if (message.ballSpeed !== undefined) {
                                clientData.gameEngine.setBallSpeed(message.ballSpeed);
                            }
                        });
                        console.log(`Updated ball speed to: ${message.ballSpeed} (multiplier: ${ballMultiplier}) for all active games`);
                    }
                    if (message.paddleSpeed !== undefined) {
                        const paddleMultiplier = message.paddleSpeed / 8;
                        (0, game_engine_1.setGlobalPaddleSpeedMultiplier)(paddleMultiplier);
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
