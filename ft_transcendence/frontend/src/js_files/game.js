// Game module for ft_transcendence
console.log('🎮 Game module loaded');

class GameManager {
    constructor(app) {
        this.app = app;
        this.gameOverButtons = null;
    }

    startGame() {
        this.app.showPage('game');
    }

    initGame() {
        console.log('🎮 INIT GAME CALLED! Stack trace:');
        console.trace();
        console.log('Initializing game...');

        // Additional debugging
        console.log('Document ready state:', document.readyState);
        console.log('All canvas elements:', document.querySelectorAll('canvas'));
        console.log('Game page element:', document.getElementById('game-page'));
        console.log('Game page visibility:', document.getElementById('game-page')?.style.display);
        console.log('Game page classes:', document.getElementById('game-page')?.className);

        this.app.gameCanvas = document.getElementById('game-canvas');
        if (!this.app.gameCanvas) {
            console.error("❌ Game canvas not found! Retrying in 100ms...");
            console.log('Trying querySelector:', document.querySelector('#game-canvas'));
            console.log('Game page HTML:', document.getElementById('game-page')?.innerHTML);
            setTimeout(() => {
                console.log('🔄 Retrying initGame from setTimeout...');
                this.initGame();
            }, 100);
            return;
        }
        console.log('Game canvas found:', this.app.gameCanvas);
        this.app.gameContext = this.app.gameCanvas.getContext('2d');

        // CSS handles game page positioning now

        // Установить размер canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Создаём новое соединение только если его нет
        if (!this.app.socket || this.app.socket.readyState !== WebSocket.OPEN) {
            console.log('Creating new WebSocket connection...');
            this.app.websocketManager.connectWebSocket();
        } else {
            console.log('WebSocket already connected, starting new match...');
            // Если соединение уже есть, просто начинаем новый матч
            setTimeout(() => {
                this.app.socket.send(JSON.stringify({ type: 'startNewMatch' }));
            }, 100);
        }

        // Запустить игровой цикл
        this.app.isGameRunning = true;
        this.gameLoop();
    }

    stopGame() {
        this.app.isGameRunning = false;
        // Закрываем WebSocket соединение
        if (this.app.socket) {
            this.app.socket.close();
            this.app.socket = null;
        }
        // Сбрасываем состояние игры
        this.app.gameState = null;
        this.gameOverButtons = null;
        // Очищаем canvas
        if (this.app.gameCanvas && this.app.gameContext) {
            this.app.gameContext.clearRect(0, 0, this.app.gameCanvas.width, this.app.gameCanvas.height);
        }
        console.log('Game stopped and cleaned up');
    }

    resizeCanvas() {
        if (this.app.gameCanvas) {
            this.app.gameCanvas.width = this.app.gameCanvas.offsetWidth;
            this.app.gameCanvas.height = this.app.gameCanvas.offsetHeight;
        }
    }

    restartGame() {
        console.log('Restarting game...');
        // Закрываем текущее соединение
        if (this.app.socket) {
            this.app.socket.close();
            this.app.socket = null;
        }
        // Сбрасываем состояние игры
        this.app.gameState = null;
        this.gameOverButtons = null;
        // Создаём новое соединение
        this.app.websocketManager.connectWebSocket();
    }

    gameLoop() {
        if (!this.app.isGameRunning) return;

        this.renderGame();
        requestAnimationFrame(() => this.gameLoop());
    }

    renderGame() {
        // Проверяем, что игра действительно должна рендериться
        const gamePage = document.getElementById('game-page');
        if (!gamePage || !gamePage.classList.contains('active')) {
            console.log('Game rendering stopped - page not visible');
            return;
        }

        if (!this.app.gameContext || !this.app.gameCanvas) return;

        const ctx = this.app.gameContext;
        const canvas = this.app.gameCanvas;

        // Устанавливаем правильные размеры канваса
        canvas.width = 960;
        canvas.height = 540;

        // Очистить canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Добавляем градиентный фон
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!this.app.gameState) {
            // Показать сообщение о подключении
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Connecting to game server...', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Игровые константы (16:9 соотношение)
        const GAME_WIDTH = 960;
        const GAME_HEIGHT = 540;
        const PADDLE_WIDTH = 20;
        const PADDLE_HEIGHT = 120;
        const BALL_SIZE = 12;

        // Нарисовать центральную линию с улучшенным стилем (только внутри поля)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(GAME_WIDTH / 2, 10);  // Начинаем с отступом от верхней границы
        ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT - 10);  // Заканчиваем с отступом от нижней границы
        ctx.stroke();
        ctx.setLineDash([]);

        // Нарисовать внешние границы с градиентом
        const borderGradient = ctx.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
        borderGradient.addColorStop(0, '#4ecdc4');
        borderGradient.addColorStop(1, '#45b7d1');
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, GAME_WIDTH - 4, GAME_HEIGHT - 4);

        // Отображение победителя
        if (this.app.gameState.gameStatus === 'gameOver' && this.app.gameState.winner) {
            // Полупрозрачный фон с размытием
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Добавляем градиентный оверлей
            const overlayGradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width / 2
            );
            overlayGradient.addColorStop(0, 'rgba(255, 107, 107, 0.1)');
            overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
            ctx.fillStyle = overlayGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Заголовок Game Over с эффектом свечения
            ctx.shadowColor = '#ff6b6b';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ff6b6b';
            ctx.font = 'bold 72px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 120);
            ctx.shadowBlur = 0;

            // Победитель с анимацией
            const winnerText = this.app.gameState.winner === 'player1' ? 'Player 1 Wins!' : 'AI Wins!';
            const winnerColor = this.app.gameState.winner === 'player1' ? '#4ecdc4' : '#45b7d1';

            ctx.shadowColor = winnerColor;
            ctx.shadowBlur = 15;
            ctx.fillStyle = winnerColor;
            ctx.font = 'bold 48px Arial';
            ctx.fillText(winnerText, canvas.width / 2, canvas.height / 2 - 60);
            ctx.shadowBlur = 0;

            // Финальный счёт с красивым стилем
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Arial';
            ctx.fillText(`Final Score: ${this.app.gameState.score.player1} - ${this.app.gameState.score.player2}`, canvas.width / 2, canvas.height / 2);

            // Кнопки с улучшенным дизайном
            const buttonWidth = 180;
            const buttonHeight = 50;
            const buttonSpacing = 20;
            const totalWidth = buttonWidth * 2 + buttonSpacing;
            const startX = canvas.width / 2 - totalWidth / 2;

            // Кнопка Restart Game
            const restartX = startX;
            const restartY = canvas.height / 2 + 60;

            // Рисуем кнопку Restart Game с градиентом
            const restartGradient = ctx.createLinearGradient(restartX, restartY, restartX, restartY + buttonHeight);
            restartGradient.addColorStop(0, '#4ecdc4');
            restartGradient.addColorStop(1, '#44a08d');
            ctx.fillStyle = restartGradient;
            ctx.fillRect(restartX, restartY, buttonWidth, buttonHeight);

            // Добавляем блик
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(restartX, restartY, buttonWidth, buttonHeight / 2);

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(restartX, restartY, buttonWidth, buttonHeight);

            // Текст кнопки Restart Game
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('Restart Game', restartX + buttonWidth / 2, restartY + 32);

            // Кнопка Home
            const homeX = startX + buttonWidth + buttonSpacing;
            const homeY = canvas.height / 2 + 60;

            // Рисуем кнопку Home с градиентом
            const homeGradient = ctx.createLinearGradient(homeX, homeY, homeX, homeY + buttonHeight);
            homeGradient.addColorStop(0, '#45b7d1');
            homeGradient.addColorStop(1, '#3a8bb8');
            ctx.fillStyle = homeGradient;
            ctx.fillRect(homeX, homeY, buttonWidth, buttonHeight);

            // Добавляем блик
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(homeX, homeY, buttonWidth, buttonHeight / 2);

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(homeX, homeY, buttonWidth, buttonHeight);

            // Текст кнопки Home
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('Home', homeX + buttonWidth / 2, homeY + 32);

            // Сохраняем координаты кнопок для обработки кликов
            this.gameOverButtons = {
                restart: {
                    x: restartX,
                    y: restartY,
                    width: buttonWidth,
                    height: buttonHeight
                },
                home: {
                    x: homeX,
                    y: homeY,
                    width: buttonWidth,
                    height: buttonHeight
                }
            };

            console.log('Game over buttons created:', this.gameOverButtons);
            return;
        } else {
            // Убираем кнопки, если игра не закончена
            this.gameOverButtons = null;
        }

        // Отображение обратного отсчёта
        if (this.app.gameState.gameStatus === 'countdown' && this.app.gameState.countdown > 0) {
            // Добавляем анимацию пульсации
            const pulse = Math.sin(Date.now() / 200) * 0.2 + 1;
            const fontSize = 72 * pulse;

            // Рисуем тень
            ctx.shadowColor = '#4ecdc4';
            ctx.shadowBlur = 30;
            ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(this.app.gameState.countdown.toString(), canvas.width / 2 + 3, canvas.height / 2 + 3);

            // Основной текст
            ctx.shadowColor = '#4ecdc4';
            ctx.shadowBlur = 20;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 + pulse * 0.1})`;
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillText(this.app.gameState.countdown.toString(), canvas.width / 2, canvas.height / 2);

            // Сбрасываем тень
            ctx.shadowBlur = 0;
        }

        // Нарисовать мяч с тенью (теперь используем правильные координаты)
        if (this.app.gameState.ball) {
            const ballX = this.app.gameState.ball.x;
            const ballY = this.app.gameState.ball.y;

            // Тень мяча
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(ballX + 3, ballY + 3, BALL_SIZE, 0, Math.PI * 2);
            ctx.fill();

            // Градиент для мяча
            const ballGradient = ctx.createRadialGradient(
                ballX - 3, ballY - 3, 0,
                ballX, ballY, BALL_SIZE
            );
            ballGradient.addColorStop(0, '#fff');
            ballGradient.addColorStop(0.7, '#4ecdc4');
            ballGradient.addColorStop(1, '#45b7d1');

            // Мяч
            ctx.fillStyle = ballGradient;
            ctx.beginPath();
            ctx.arc(ballX, ballY, BALL_SIZE, 0, Math.PI * 2);
            ctx.fill();

            // Блики на мяче
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(ballX - 3, ballY - 3, 4, 0, Math.PI * 2);
            ctx.fill();

            // Дополнительный блик
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(ballX - 1, ballY - 1, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Функция для плавного движения ракетки
        const drawPaddle = (x, y, color, isLeft) => {
            // Ограничить ракетку границами поля
            const minY = 0;
            const maxY = GAME_HEIGHT - PADDLE_HEIGHT;
            const clampedY = Math.max(minY, Math.min(maxY, y));

            // Тень ракетки
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(x + 3, clampedY + 3, PADDLE_WIDTH, PADDLE_HEIGHT);

            // Градиент для ракетки
            const gradient = ctx.createLinearGradient(x, clampedY, x + PADDLE_WIDTH, clampedY + PADDLE_HEIGHT);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, this.adjustBrightness(color, 20));
            gradient.addColorStop(1, this.adjustBrightness(color, -20));
            ctx.fillStyle = gradient;
            ctx.fillRect(x, clampedY, PADDLE_WIDTH, PADDLE_HEIGHT);

            // Обводка ракетки
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, clampedY, PADDLE_WIDTH, PADDLE_HEIGHT);

            // Блики на ракетке
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(x + 2, clampedY + 2, PADDLE_WIDTH - 4, 15);

            // Дополнительный блик
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x + 2, clampedY + PADDLE_HEIGHT - 15, PADDLE_WIDTH - 4, 10);
        };

        // Ракетка игрока 1 (левая) - теперь используем правильные координаты
        if (this.app.gameState.player1) {
            const paddle1Y = this.app.gameState.player1.y;
            drawPaddle(0, paddle1Y, '#3b82f6', true);
        }

        // Ракетка игрока 2 (правая) - теперь используем правильные координаты
        if (this.app.gameState.player2) {
            const paddle2Y = this.app.gameState.player2.y;
            drawPaddle(GAME_WIDTH - PADDLE_WIDTH, paddle2Y, '#ef4444', false);
        }

        // Нарисовать счёт в углах
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';

        // Счёт игрока 1 (левый верхний угол)
        const player1Score = this.app.gameState.score?.player1 || 0;
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.fillText(player1Score.toString(), 50, 50);
        ctx.shadowBlur = 0;

        // Счёт игрока 2 (правый верхний угол)
        const player2Score = this.app.gameState.score?.player2 || 0;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillText(player2Score.toString(), GAME_WIDTH - 50, 50);
        ctx.shadowBlur = 0;

        // Показать цель игры (до 3 очков)
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowColor = '#4ecdc4';
        ctx.shadowBlur = 5;
        ctx.fillText('First to 3 wins', canvas.width / 2, 30);
        ctx.shadowBlur = 0;
    }

    // Вспомогательная функция для изменения яркости цвета
    adjustBrightness(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
}

// Export for global access
window.GameManager = GameManager;
