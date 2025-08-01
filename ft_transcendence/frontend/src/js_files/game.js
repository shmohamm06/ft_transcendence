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

        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Create new connection only if it doesn't exist
        if (!this.app.socket || this.app.socket.readyState !== WebSocket.OPEN) {
            console.log('Creating new WebSocket connection...');
            this.app.websocketManager.connectWebSocket();
        } else {
            console.log('WebSocket already connected, starting new match...');
            // If connection already exists, just start a new match
            setTimeout(() => {
                this.app.socket.send(JSON.stringify({ type: 'startNewMatch' }));
            }, 100);
        }

        // Start game loop
        this.app.isGameRunning = true;
        this.gameLoop();
    }

    stopGame() {
        this.app.isGameRunning = false;
        // Close WebSocket connection
        if (this.app.socket) {
            this.app.socket.close();
            this.app.socket = null;
        }
        // Reset game state
        this.app.gameState = null;
        this.gameOverButtons = null;
        // Clear canvas
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
        // Close current connection
        if (this.app.socket) {
            this.app.socket.close();
            this.app.socket = null;
        }
        // Reset game state
        this.app.gameState = null;
        this.gameOverButtons = null;
        // Create new connection
        this.app.websocketManager.connectWebSocket();
    }

    gameLoop() {
        if (!this.app.isGameRunning) return;

        this.renderGame();
        requestAnimationFrame(() => this.gameLoop());
    }

    renderGame() {
        // Check that the game should actually render
        const gamePage = document.getElementById('game-page');
        if (!gamePage || !gamePage.classList.contains('active')) {
            console.log('Game rendering stopped - page not visible');
            return;
        }

        if (!this.app.gameContext || !this.app.gameCanvas) return;

        const ctx = this.app.gameContext;
        const canvas = this.app.gameCanvas;

        // Set correct canvas dimensions
        canvas.width = 960;
        canvas.height = 540;

        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!this.app.gameState) {
            // Show connection message
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Connecting to game server...', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Game constants (16:9 ratio)
        const GAME_WIDTH = 960;
        const GAME_HEIGHT = 540;
        const PADDLE_WIDTH = 20;
        const PADDLE_HEIGHT = 120;
        const BALL_SIZE = 12;

        // Draw center line with improved style (only inside the field)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(GAME_WIDTH / 2, 10);  // Start with offset from top border
        ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT - 10);  // End with offset from bottom border
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw outer borders with gradient
        const borderGradient = ctx.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
        borderGradient.addColorStop(0, '#4ecdc4');
        borderGradient.addColorStop(1, '#45b7d1');
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, GAME_WIDTH - 4, GAME_HEIGHT - 4);

        // Display winner
        if (this.app.gameState.gameStatus === 'gameOver' && this.app.gameState.winner) {
            // Semi-transparent background with blur
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add gradient overlay
            const overlayGradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width / 2
            );
            overlayGradient.addColorStop(0, 'rgba(255, 107, 107, 0.1)');
            overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
            ctx.fillStyle = overlayGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Game Over title with glow effect
            ctx.shadowColor = '#ff6b6b';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ff6b6b';
            ctx.font = 'bold 72px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 120);
            ctx.shadowBlur = 0;

            // Winner with animation
            const winnerText = this.app.gameState.winner === 'player1' ? 'Player 1 Wins!' : 'AI Wins!';
            const winnerColor = this.app.gameState.winner === 'player1' ? '#4ecdc4' : '#45b7d1';

            ctx.shadowColor = winnerColor;
            ctx.shadowBlur = 15;
            ctx.fillStyle = winnerColor;
            ctx.font = 'bold 48px Arial';
            ctx.fillText(winnerText, canvas.width / 2, canvas.height / 2 - 60);
            ctx.shadowBlur = 0;

            // Final score with beautiful style
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Arial';
            ctx.fillText(`Final Score: ${this.app.gameState.score.player1} - ${this.app.gameState.score.player2}`, canvas.width / 2, canvas.height / 2);

            // Buttons with improved design
            const buttonWidth = 180;
            const buttonHeight = 50;
            const buttonSpacing = 20;
            const totalWidth = buttonWidth * 2 + buttonSpacing;
            const startX = canvas.width / 2 - totalWidth / 2;

            // Restart Game button
            const restartX = startX;
            const restartY = canvas.height / 2 + 60;

            // Draw Restart Game button with gradient
            const restartGradient = ctx.createLinearGradient(restartX, restartY, restartX, restartY + buttonHeight);
            restartGradient.addColorStop(0, '#4ecdc4');
            restartGradient.addColorStop(1, '#44a08d');
            ctx.fillStyle = restartGradient;
            ctx.fillRect(restartX, restartY, buttonWidth, buttonHeight);

            // Add highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(restartX, restartY, buttonWidth, buttonHeight / 2);

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(restartX, restartY, buttonWidth, buttonHeight);

            // Restart Game button text
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('Restart Game', restartX + buttonWidth / 2, restartY + 32);

            // Home button
            const homeX = startX + buttonWidth + buttonSpacing;
            const homeY = canvas.height / 2 + 60;

            // Draw Home button with gradient
            const homeGradient = ctx.createLinearGradient(homeX, homeY, homeX, homeY + buttonHeight);
            homeGradient.addColorStop(0, '#45b7d1');
            homeGradient.addColorStop(1, '#3a8bb8');
            ctx.fillStyle = homeGradient;
            ctx.fillRect(homeX, homeY, buttonWidth, buttonHeight);

            // Add highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(homeX, homeY, buttonWidth, buttonHeight / 2);

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(homeX, homeY, buttonWidth, buttonHeight);

            // Home button text
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('Home', homeX + buttonWidth / 2, homeY + 32);

            // Save button coordinates for click handling
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
            // Remove buttons if game is not finished
            this.gameOverButtons = null;
        }

        // Display countdown
        if (this.app.gameState.gameStatus === 'countdown' && this.app.gameState.countdown > 0) {
            // Add pulse animation
            const pulse = Math.sin(Date.now() / 200) * 0.2 + 1;
            const fontSize = 72 * pulse;

            // Draw shadow
            ctx.shadowColor = '#4ecdc4';
            ctx.shadowBlur = 30;
            ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(this.app.gameState.countdown.toString(), canvas.width / 2 + 3, canvas.height / 2 + 3);

            // Main text
            ctx.shadowColor = '#4ecdc4';
            ctx.shadowBlur = 20;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 + pulse * 0.1})`;
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillText(this.app.gameState.countdown.toString(), canvas.width / 2, canvas.height / 2);

            // Reset shadow
            ctx.shadowBlur = 0;
        }

        // Draw ball with shadow (now using correct coordinates)
        if (this.app.gameState.ball) {
            const ballX = this.app.gameState.ball.x;
            const ballY = this.app.gameState.ball.y;

            // Ball shadow
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(ballX + 3, ballY + 3, BALL_SIZE, 0, Math.PI * 2);
            ctx.fill();

            // Gradient for ball
            const ballGradient = ctx.createRadialGradient(
                ballX - 3, ballY - 3, 0,
                ballX, ballY, BALL_SIZE
            );
            ballGradient.addColorStop(0, '#fff');
            ballGradient.addColorStop(0.7, '#4ecdc4');
            ballGradient.addColorStop(1, '#45b7d1');

            // Ball
            ctx.fillStyle = ballGradient;
            ctx.beginPath();
            ctx.arc(ballX, ballY, BALL_SIZE, 0, Math.PI * 2);
            ctx.fill();

            // Highlights on ball
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(ballX - 3, ballY - 3, 4, 0, Math.PI * 2);
            ctx.fill();

            // Additional highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(ballX - 1, ballY - 1, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Function for smooth paddle movement
        const drawPaddle = (x, y, color, isLeft) => {
            // Constrain paddle to field boundaries
            const minY = 0;
            const maxY = GAME_HEIGHT - PADDLE_HEIGHT;
            const clampedY = Math.max(minY, Math.min(maxY, y));

            // Paddle shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(x + 3, clampedY + 3, PADDLE_WIDTH, PADDLE_HEIGHT);

            // Gradient for paddle
            const gradient = ctx.createLinearGradient(x, clampedY, x + PADDLE_WIDTH, clampedY + PADDLE_HEIGHT);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, this.adjustBrightness(color, 20));
            gradient.addColorStop(1, this.adjustBrightness(color, -20));
            ctx.fillStyle = gradient;
            ctx.fillRect(x, clampedY, PADDLE_WIDTH, PADDLE_HEIGHT);

            // Paddle outline
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, clampedY, PADDLE_WIDTH, PADDLE_HEIGHT);

            // Highlights on paddle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(x + 2, clampedY + 2, PADDLE_WIDTH - 4, 15);

            // Additional highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x + 2, clampedY + PADDLE_HEIGHT - 15, PADDLE_WIDTH - 4, 10);
        };

        // Player 1 paddle (left) - now using correct coordinates
        if (this.app.gameState.player1) {
            const paddle1Y = this.app.gameState.player1.y;
            drawPaddle(0, paddle1Y, '#3b82f6', true);
        }

        // Player 2 paddle (right) - now using correct coordinates
        if (this.app.gameState.player2) {
            const paddle2Y = this.app.gameState.player2.y;
            drawPaddle(GAME_WIDTH - PADDLE_WIDTH, paddle2Y, '#ef4444', false);
        }

        // Draw score in corners
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';

        // Player 1 score (top left corner)
        const player1Score = this.app.gameState.score?.player1 || 0;
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.fillText(player1Score.toString(), 50, 50);
        ctx.shadowBlur = 0;

        // Player 2 score (top right corner)
        const player2Score = this.app.gameState.score?.player2 || 0;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillText(player2Score.toString(), GAME_WIDTH - 50, 50);
        ctx.shadowBlur = 0;

        // Show game objective (first to 3 points)
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowColor = '#4ecdc4';
        ctx.shadowBlur = 5;
        ctx.fillText('First to 3 wins', canvas.width / 2, 30);
        ctx.shadowBlur = 0;
    }

    // Helper function for changing color brightness
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
