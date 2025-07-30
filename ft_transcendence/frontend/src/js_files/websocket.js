// WebSocket module for ft_transcendence
console.log('🔌 WebSocket module loaded');

class WebSocketManager {
    constructor(app) {
        this.app = app;
    }

    connectWebSocket() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/game`;

        console.log('Attempting to connect to WebSocket:', wsUrl);
        this.app.socket = new WebSocket(wsUrl);

        this.app.socket.onopen = () => {
            this.updateConnectionStatus('Connected');
            console.log('WebSocket connected');

            // Отправляем сохраненные настройки
            setTimeout(() => {
                this.sendSettings();
            }, 100);

            // Начинаем новый матч при подключении
            setTimeout(() => {
                if (this.app.socket && this.app.socket.readyState === WebSocket.OPEN) {
                    this.app.socket.send(JSON.stringify({ type: 'startNewMatch' }));
                }
            }, 200);
        };

        this.app.socket.onclose = () => {
            console.log('WebSocket connection closed');
            this.updateConnectionStatus('Disconnected');
        };

        this.app.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateConnectionStatus('Connection Error');
        };

        this.app.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received game state:', data);

                // Обрабатываем новый формат сообщений
                if (data.type === 'gameState') {
                    const gameState = data.data;
                    console.log('Received game state:', gameState);

                    // Отладочная информация для Game Over
                    if (gameState.gameStatus === 'gameOver') {
                        console.log('GAME OVER DETECTED! Winner:', gameState.winner);
                        console.log('Final score:', gameState.score);
                    }

                    this.updateGameDisplay(gameState);

                    // Если игра закончилась (кто-то достиг 3 очков), показываем экран Game Over
                    if (gameState.gameStatus === 'gameOver') {
                        console.log('Game over! Winner:', gameState.winner);
                        this.updateConnectionStatus('Game Finished');
                    }
                } else {
                    // Обратная совместимость со старым форматом
                    this.app.gameState = data;
                    this.updateGameDisplay(this.app.gameState);
                }

                this.app.uiManager.updateScore();
            } catch (error) {
                console.error('Failed to parse game state:', error);
            }
        };
    }

    // Отправка настроек на сервер
    sendSettings() {
        if (this.app.socket && this.app.socket.readyState === WebSocket.OPEN) {
            const ballSpeed = document.getElementById('ball-speed')?.value || 5;
            const paddleSpeed = document.getElementById('paddle-speed')?.value || 5;

            const settings = {
                type: 'settings',
                ballSpeed: parseInt(ballSpeed),
                paddleSpeed: parseInt(paddleSpeed)
            };
            console.log('Sending settings:', settings);
            this.app.socket.send(JSON.stringify(settings));
        }
    }

    // Отправка команды начала нового матча
    sendStartNewMatch() {
        if (this.app.socket && this.app.socket.readyState === WebSocket.OPEN) {
            this.app.socket.send(JSON.stringify({ type: 'startNewMatch' }));
        }
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    updateGameDisplay(gameState) {
        // Обновляем состояние игры
        this.app.gameState = gameState;

        // Обновляем счёт
        this.app.uiManager.updateScore();

        // Если игра в состоянии countdown, показываем обратный отсчёт
        if (gameState.gameStatus === 'countdown' && gameState.countdown !== undefined) {
            this.updateConnectionStatus(`Game starting in ${gameState.countdown}...`);
        } else if (gameState.gameStatus === 'playing') {
            this.updateConnectionStatus('Game in progress');
        } else if (gameState.gameStatus === 'gameOver') {
            this.updateConnectionStatus('Game Finished');
        }
    }
}

// Export for global access
window.WebSocketManager = WebSocketManager;
