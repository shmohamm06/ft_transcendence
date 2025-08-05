
console.log('⚙️ Settings module loaded');

class SettingsManager {
    constructor(app) {
        this.app = app;
    }

    setupEventListeners() {
        
        const paddleSpeed = document.getElementById('paddle-speed');
        const ballSpeed = document.getElementById('ball-speed');

        if (paddleSpeed) {
            paddleSpeed.addEventListener('input', (e) => {
                document.getElementById('paddle-speed-value').textContent = e.target.value;
            });
        }

        if (ballSpeed) {
            ballSpeed.addEventListener('input', (e) => {
                document.getElementById('ball-speed-value').textContent = e.target.value;
            });
        }

        
        document.addEventListener('keydown', (e) => {
            console.log('Key pressed:', e.key, 'Socket state:', this.app.socket?.readyState);
            if (this.app.socket && this.app.socket.readyState === WebSocket.OPEN) {
                let direction = null;
                if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                    direction = 'up';
                } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
                    direction = 'down';
                }

                if (direction) {
                    console.log('Sending direction:', direction);
                    this.app.socket.send(JSON.stringify({
                        type: 'move',
                        direction: direction
                    }));
                }
            } else {
                console.log('Socket not ready. State:', this.app.socket?.readyState);
            }
        });

        
        const gameCanvas = document.getElementById('game-canvas');
        if (gameCanvas) {
            gameCanvas.addEventListener('click', (e) => {
                
                if (this.app.gameManager.gameOverButtons) {
                    const rect = gameCanvas.getBoundingClientRect();

                    
                    const scaleX = gameCanvas.width / rect.width;
                    const scaleY = gameCanvas.height / rect.height;

                    const x = (e.clientX - rect.left) * scaleX;
                    const y = (e.clientY - rect.top) * scaleY;

                    console.log('Canvas click:', { x, y });
                    console.log('Canvas rect:', rect);
                    console.log('Canvas scale:', { scaleX, scaleY });
                    console.log('Game over buttons:', this.app.gameManager.gameOverButtons);

                    
                    if (x >= this.app.gameManager.gameOverButtons.restart.x &&
                        x <= this.app.gameManager.gameOverButtons.restart.x + this.app.gameManager.gameOverButtons.restart.width &&
                        y >= this.app.gameManager.gameOverButtons.restart.y &&
                        y <= this.app.gameManager.gameOverButtons.restart.y + this.app.gameManager.gameOverButtons.restart.height) {

                        console.log('Restart Game button clicked');
                        this.app.gameManager.restartGame();
                    }
                    
                    else if (x >= this.app.gameManager.gameOverButtons.home.x &&
                             x <= this.app.gameManager.gameOverButtons.home.x + this.app.gameManager.gameOverButtons.home.width &&
                             y >= this.app.gameManager.gameOverButtons.home.y &&
                             y <= this.app.gameManager.gameOverButtons.home.y + this.app.gameManager.gameOverButtons.home.height) {

                        console.log('Home button clicked');
                        this.app.showPage('home');
                    } else {
                        console.log('Click outside buttons');
                    }
                }
            });
        }
    }

    saveSettings() {
        const paddleSpeed = document.getElementById('paddle-speed').value;
        const ballSpeed = document.getElementById('ball-speed').value;
        const aiDifficulty = document.getElementById('ai-difficulty').value;

        const settings = {
            paddleSpeed: paddleSpeed,
            ballSpeed: ballSpeed,
            aiDifficulty: aiDifficulty
        };

        localStorage.setItem('gameSettings', JSON.stringify(settings));

        
        document.getElementById('paddle-speed-value').textContent = paddleSpeed;
        document.getElementById('ball-speed-value').textContent = ballSpeed;

        
        if (this.app.socket && this.app.socket.readyState === WebSocket.OPEN) {
            this.app.websocketManager.sendSettings();
            alert('Settings saved and applied to current game!');
        } else {
            alert('Settings saved! They will be applied when you start a new game.');
        }
    }

    loadSettings() {
        const settings = localStorage.getItem('gameSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            document.getElementById('paddle-speed').value = parsed.paddleSpeed;
            document.getElementById('ball-speed').value = parsed.ballSpeed;
            document.getElementById('ai-difficulty').value = parsed.aiDifficulty;

            document.getElementById('paddle-speed-value').textContent = parsed.paddleSpeed;
            document.getElementById('ball-speed-value').textContent = parsed.ballSpeed;
        }
    }
}


window.SettingsManager = SettingsManager;
