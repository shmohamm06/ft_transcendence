import { GameEngine, setGlobalBallSpeedMultiplier, setGlobalPaddleSpeedMultiplier } from './game.engine';
import { AIOpponent } from './ai.opponent';

export interface GameMessage {
    action?: 'move' | 'settings';
    type?: 'move' | 'settings' | 'startNewMatch' | 'startGame';
    direction?: 'up' | 'down';
    player?: 'player1' | 'player2';
    ballSpeed?: number;
    paddleSpeed?: number;
}

export class GameGateway {
    private clients: Map<string, {
        socket: any;
        gameEngine: GameEngine;
        aiOpponent: AIOpponent;
        gameLoop: NodeJS.Timeout;
        gameMode: 'ai' | 'pvp';
    }> = new Map();
    private performanceStats = {
        totalClients: 0,
        activeClients: 0,
        lastCleanup: Date.now()
    };

    constructor() {
        console.log('GameGateway initialized');

        setInterval(() => {
            this.cleanupStaleConnections();
        }, 30000);
    }

    private cleanupStaleConnections() {
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

    private cleanupClient(clientId: string) {
        const clientData = this.clients.get(clientId);
        if (clientData) {
            try {
                clearInterval(clientData.gameLoop);
                console.log(`Cleaned up game loop for client ${clientId}`);
            } catch (error) {
                console.error(`Error cleaning up client ${clientId}:`, error);
            }
            this.clients.delete(clientId);
        }
    }

    public handleConnection(client: any, connectionInfo: any) {
        const clientId = connectionInfo.url || Math.random().toString(36);
        console.log(`Client ${clientId} connected to game service`);

        const url = new URL(connectionInfo.url, 'http://localhost');
        const gameMode = url.searchParams.get('mode') === 'pvp' ? 'pvp' : 'ai';
        console.log(`Game mode: ${gameMode}`);

        const gameEngine = new GameEngine();
        const aiOpponent = new AIOpponent();

        this.loadUserSettings(connectionInfo).then(settings => {
            if (settings.ballSpeed !== undefined) {
                setGlobalBallSpeedMultiplier(settings.ballSpeed / 6); 
                console.log(`Applied ball speed multiplier: ${settings.ballSpeed / 6}`);
            }
            if (settings.paddleSpeed !== undefined) {
                setGlobalPaddleSpeedMultiplier(settings.paddleSpeed / 8); 
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
                        } else {
                            console.warn(`WebSocket buffer overflow for client ${clientId}, skipping send`);
                        }
                    } catch (sendError) {
                        console.error(`Error sending game state to client ${clientId}:`, sendError);
                    }
                }
            } catch (error) {
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

        client.on('message', (data: Buffer) => {
            this.handleMessage(clientId, data);
        });

        client.on('close', () => {
            console.log(`Client ${clientId} disconnected from game service`);
            this.cleanupClient(clientId);
        });

        client.on('error', (error: Error) => {
            console.error(`WebSocket error for client ${clientId}:`, error);
            this.cleanupClient(clientId);
        });

        gameEngine.startNewMatch();
    }

    private async loadUserSettings(connectionInfo: any): Promise<{ballSpeed?: number, paddleSpeed?: number}> {
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
            const result: {ballSpeed?: number, paddleSpeed?: number} = {};

            settings.forEach((setting: {key: string, value: string}) => {
                if (setting.key === 'ballSpeed') {
                    result.ballSpeed = parseInt(setting.value);
                } else if (setting.key === 'paddleSpeed') {
                    result.paddleSpeed = parseInt(setting.value);
                }
            });

            console.log('Loaded user settings:', result);
            return result;
        } catch (error) {
            console.log('Failed to load user settings:', error);
            throw error;
        }
    }

    private handleMessage(clientId: string, data: Buffer) {
        try {
            const message: GameMessage = JSON.parse(data.toString());
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
                        } else {
                            gameEngine.movePaddle('player1', message.direction);
                            console.log(`AI mode move: player1 ${message.direction}`);
                        }
                    }
                    break;
                case 'settings':
                    if (message.ballSpeed !== undefined) {
                        const ballMultiplier = message.ballSpeed / 6;
                        setGlobalBallSpeedMultiplier(ballMultiplier);

                        this.clients.forEach((clientData, id) => {
                            if (message.ballSpeed !== undefined) {
                                clientData.gameEngine.setBallSpeed(message.ballSpeed);
                            }
                        });

                        console.log(`Updated ball speed to: ${message.ballSpeed} (multiplier: ${ballMultiplier}) for all active games`);
                    }
                    if (message.paddleSpeed !== undefined) {
                        const paddleMultiplier = message.paddleSpeed / 8;
                        setGlobalPaddleSpeedMultiplier(paddleMultiplier);

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
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }

    public handleDisconnect(client: any) {
        
        console.log('Client disconnected from game service');
    }
}
