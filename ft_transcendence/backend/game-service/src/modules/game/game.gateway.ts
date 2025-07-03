import { GameEngine, setGlobalBallSpeedMultiplier, setGlobalPaddleSpeedMultiplier } from './game.engine';
import { AIOpponent } from './ai.opponent';

export interface GameMessage {
    action?: 'move' | 'settings';
    type?: 'move' | 'settings' | 'startNewMatch' | 'startGame';
    direction?: 'up' | 'down';
    ballSpeed?: number;
    paddleSpeed?: number;
}

export class GameGateway {
    private clients: Map<string, {
        socket: any;
        gameEngine: GameEngine;
        aiOpponent: AIOpponent;
        gameLoop: NodeJS.Timeout;
    }> = new Map();

    constructor() {
        console.log('GameGateway initialized');
    }

    public handleConnection(client: any, connectionInfo: any) {
        const clientId = connectionInfo.url || Math.random().toString(36);
        console.log(`Client ${clientId} connected to game service`);

        const gameEngine = new GameEngine();
        const aiOpponent = new AIOpponent();

        // Try to load user settings from query parameters or headers
        this.loadUserSettings(connectionInfo).then(settings => {
            if (settings.ballSpeed !== undefined) {
                setGlobalBallSpeedMultiplier(settings.ballSpeed / 6); // 6 - базовая скорость мяча
                console.log(`Applied ball speed multiplier: ${settings.ballSpeed / 6}`);
            }
            if (settings.paddleSpeed !== undefined) {
                setGlobalPaddleSpeedMultiplier(settings.paddleSpeed / 8); // 8 - базовая скорость ракетки
                console.log(`Applied paddle speed multiplier: ${settings.paddleSpeed / 8}`);
            }
        }).catch(err => {
            console.log('Could not load user settings:', err.message);
        });

        // Start game loop
        const gameLoop = setInterval(() => {
            gameEngine.update();
            const gameState = gameEngine.getGameState();

            if (gameState.gameStatus === 'playing') {
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
            gameLoop
        });

        client.on('message', (data: Buffer) => {
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

        client.on('error', (error: Error) => {
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

    private async loadUserSettings(connectionInfo: any): Promise<{ballSpeed?: number, paddleSpeed?: number}> {
        try {
            // Try to extract token from URL parameters
            const url = new URL(connectionInfo.url, 'http://localhost');
            const token = url.searchParams.get('token') || connectionInfo.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                throw new Error('No token provided');
            }

            console.log('Attempting to load user settings with token:', token.substring(0, 20) + '...');

            // Make request to auth service to get user settings
            const response = await fetch('http://auth-service:3001/api/settings', {
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

            const { gameEngine } = clientData;

            // Handle both 'action' and 'type' formats for compatibility
            const actionType = message.action || message.type;

            switch (actionType) {
                case 'move':
                    if (message.direction) {
                        gameEngine.movePaddle('player1', message.direction);
                    }
                    break;
                case 'settings':
                    if (message.ballSpeed !== undefined) {
                        // Преобразуем значение от 1-10 в множитель
                        const ballMultiplier = message.ballSpeed / 6; // 6 - базовая скорость
                        setGlobalBallSpeedMultiplier(ballMultiplier);

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
                        setGlobalPaddleSpeedMultiplier(paddleMultiplier);

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
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }

    public handleDisconnect(client: any) {
        // This method is called by NestJS decorators, but we handle disconnection in the connection handler
    }
}
