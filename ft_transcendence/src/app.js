// Клиентское приложение ft_transcendence
console.log('🚀 App.js loaded - Version: 2025-06-23-v2');

class App {
    constructor() {
        this.currentUser = null;
        this.socket = null;
        this.gameState = null;
        this.gameCanvas = null;
        this.gameContext = null;
        this.isGameRunning = false;
        this.isPlayer = false;

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.loadUserFromStorage();
        this.updateUI();

        // Принудительно скрываем игровую страницу при инициализации
        this.ensureGamePageHidden();
    }

    ensureGamePageHidden() {
        const gamePage = document.getElementById('game-page');
        if (gamePage) {
            gamePage.classList.remove('active');
            console.log('Game page initialised as hidden');
        }
    }

    createGamePage() {
        console.log('⚠️ WARNING: createGamePage called - this should not happen if game page exists in HTML!');
        console.log('Creating game page HTML...');
        // Создаем игровую страницу динамически
        const gamePageHTML = `
        <div id="game-page" class="page">
            <div class="game-container">
                <div class="game-header">
                    <button class="btn btn-back" onclick="app.showPage('home')">← Back to Home</button>
                    <div class="score-display">
                        <span>Player 1: <span id="player1-score">0</span></span>
                        <span class="score-separator">|</span>
                        <span>AI: <span id="player2-score">0</span></span>
                    </div>
                    <div class="game-controls">
                        <div class="connection-status">Status: <span id="connection-status">Connecting...</span></div>
                    </div>
                </div>
                <canvas id="game-canvas" class="game-canvas"></canvas>
            </div>
        </div>`;

        // Добавляем в конец body
        document.body.insertAdjacentHTML('beforeend', gamePageHTML);
        console.log('Game page HTML inserted into DOM');

        // Проверяем, что элементы действительно созданы
        const gamePage = document.getElementById('game-page');
        const gameCanvas = document.getElementById('game-canvas');
        console.log('Game page element:', gamePage);
        console.log('Game canvas element:', gameCanvas);
        console.log('All elements with id game-canvas:', document.querySelectorAll('#game-canvas'));
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });
    }

    setupEventListeners() {
        // Настройки
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

        // Обработка клавиш для игры
        document.addEventListener('keydown', (e) => {
            console.log('Key pressed:', e.key, 'Socket state:', this.socket?.readyState);
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                let direction = null;
                if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                    direction = 'up';
                } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
                    direction = 'down';
                }

                if (direction) {
                    console.log('Sending direction:', direction);
                    this.socket.send(JSON.stringify({
                        type: 'move',
                        direction: direction
                    }));
                }
            } else {
                console.log('Socket not ready. State:', this.socket?.readyState);
            }
        });

        // Обработка кликов по canvas (для кнопки "Play Again")
        const gameCanvas = document.getElementById('game-canvas');
        if (gameCanvas) {
            gameCanvas.addEventListener('click', (e) => {
                // Обработка кликов по кнопкам Game Over
                if (this.gameOverButtons) {
                    const rect = gameCanvas.getBoundingClientRect();

                    // Учитываем масштабирование canvas
                    const scaleX = gameCanvas.width / rect.width;
                    const scaleY = gameCanvas.height / rect.height;

                    const x = (e.clientX - rect.left) * scaleX;
                    const y = (e.clientY - rect.top) * scaleY;

                    console.log('Canvas click:', { x, y });
                    console.log('Canvas rect:', rect);
                    console.log('Canvas scale:', { scaleX, scaleY });
                    console.log('Game over buttons:', this.gameOverButtons);

                    // Проверяем клик по кнопке Restart Game
                    if (x >= this.gameOverButtons.restart.x &&
                        x <= this.gameOverButtons.restart.x + this.gameOverButtons.restart.width &&
                        y >= this.gameOverButtons.restart.y &&
                        y <= this.gameOverButtons.restart.y + this.gameOverButtons.restart.height) {

                        console.log('Restart Game button clicked');
                        this.restartGame();
                    }
                    // Проверяем клик по кнопке Home
                    else if (x >= this.gameOverButtons.home.x &&
                             x <= this.gameOverButtons.home.x + this.gameOverButtons.home.width &&
                             y >= this.gameOverButtons.home.y &&
                             y <= this.gameOverButtons.home.y + this.gameOverButtons.home.height) {

                        console.log('Home button clicked');
                        this.showPage('home');
                    } else {
                        console.log('Click outside buttons');
                    }
                }
            });
        }
    }

    showPage(pageName) {
        // Скрыть все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Удалить игровую страницу если переходим не на игру
        const gamePage = document.getElementById('game-page');
        if (pageName !== 'game' && gamePage) {
            gamePage.classList.remove('active');
            console.log('Game page hidden on page switch');
            this.stopGame();
        }

                // Специальная обработка игровой страницы
        if (pageName === 'game') {
            console.log('Switching to game page...');
            // Всегда используем существующую страницу из HTML
            let targetPage = document.getElementById('game-page');
            console.log('Game page from HTML:', targetPage);

            if (targetPage) {
                targetPage.classList.add('active');
                console.log('Game page shown and activated');
                console.log('Game page classes:', targetPage.className);
                console.log('Game page display style:', window.getComputedStyle(targetPage).display);

                // Проверяем canvas сразу
                const canvasCheck = document.getElementById('game-canvas');
                console.log('Canvas immediate check:', canvasCheck);

                // Даем время DOM обновиться после добавления класса active
                requestAnimationFrame(() => {
                    console.log('RAF: Checking canvas after DOM update...');
                    const canvas = document.getElementById('game-canvas');
                    console.log('RAF: Canvas found:', canvas);
                    if (canvas) {
                        this.initGame();
                    } else {
                        console.error('RAF: Canvas still not found!');
                        // Последняя попытка
                        setTimeout(() => this.initGame(), 100);
                    }
                });
            } else {
                console.error('CRITICAL: Game page not found in HTML!');
                console.log('All elements with class "page":', document.querySelectorAll('.page'));
                console.log('Body innerHTML length:', document.body.innerHTML.length);
            }
        } else {
            // Обработка всех остальных страниц
            const targetPage = document.getElementById(`${pageName}-page`);
            if (targetPage) {
                targetPage.classList.add('active');
            }
        }

        // Обновить активную ссылку в навигации
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Добавляем класс к body для специального стиля
        if (pageName === 'game') {
            document.body.classList.add('game-active');
            // Логика перенесена выше в обработку game страницы
        } else {
            document.body.classList.remove('game-active');
            this.stopGame();
        }
    }

    async handleLogin(event) {
        event.preventDefault();

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            // Здесь должна быть реальная аутентификация
            // Пока используем мок
            this.currentUser = { username, id: Date.now() };
            this.saveUserToStorage();
            this.updateUI();
            this.showPage('home');

            // Очистить форму
            event.target.reset();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async handleRegister(event) {
        event.preventDefault();

        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            // Здесь должна быть реальная регистрация
            // Пока используем мок
            this.currentUser = { username, email, id: Date.now() };
            this.saveUserToStorage();
            this.updateUI();
            this.showPage('home');

            // Очистить форму
            event.target.reset();
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    }

    logout() {
        this.currentUser = null;
        this.removeUserFromStorage();
        this.updateUI();
        this.showPage('login');
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

        // Обновляем отображение значений
        document.getElementById('paddle-speed-value').textContent = paddleSpeed;
        document.getElementById('ball-speed-value').textContent = ballSpeed;

        // Отправляем настройки на сервер если есть соединение
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.sendSettings();
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

    startGame() {
        this.showPage('game');
    }

    initGame() {
        console.log('🎮 INIT GAME CALLED! Stack trace:');
        console.trace();
        console.log('Initializing game...');

        // Дополнительная отладка
        console.log('Document ready state:', document.readyState);
        console.log('All canvas elements:', document.querySelectorAll('canvas'));
        console.log('Game page element:', document.getElementById('game-page'));
        console.log('Game page visibility:', document.getElementById('game-page')?.style.display);
        console.log('Game page classes:', document.getElementById('game-page')?.className);

        this.gameCanvas = document.getElementById('game-canvas');
        if (!this.gameCanvas) {
            console.error("❌ Game canvas not found! Retrying in 100ms...");
            console.log('Trying querySelector:', document.querySelector('#game-canvas'));
            console.log('Game page HTML:', document.getElementById('game-page')?.innerHTML);
            setTimeout(() => {
                console.log('🔄 Retrying initGame from setTimeout...');
                this.initGame();
            }, 100);
            return;
        }
        console.log('Game canvas found:', this.gameCanvas);
        this.gameContext = this.gameCanvas.getContext('2d');

        // CSS handles game page positioning now

        // Установить размер canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Создаём новое соединение только если его нет
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.log('Creating new WebSocket connection...');
            this.connectWebSocket();
        } else {
            console.log('WebSocket already connected, starting new match...');
            // Если соединение уже есть, просто начинаем новый матч
            setTimeout(() => {
                this.socket.send(JSON.stringify({ type: 'startNewMatch' }));
            }, 100);
        }

        // Запустить игровой цикл
        this.isGameRunning = true;
        this.gameLoop();
    }

    stopGame() {
        this.isGameRunning = false;
        // Закрываем WebSocket соединение
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        // Сбрасываем состояние игры
        this.gameState = null;
        this.gameOverButtons = null;
        // Очищаем canvas
        if (this.gameCanvas && this.gameContext) {
            this.gameContext.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        }
        console.log('Game stopped and cleaned up');
    }

    resizeCanvas() {
        if (this.gameCanvas) {
            this.gameCanvas.width = this.gameCanvas.offsetWidth;
            this.gameCanvas.height = this.gameCanvas.offsetHeight;
        }
    }

    connectWebSocket() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/game`;

        console.log('Attempting to connect to WebSocket:', wsUrl);
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            this.updateConnectionStatus('Connected');
            console.log('WebSocket connected');

            // Отправляем сохраненные настройки
            setTimeout(() => {
                this.sendSettings();
            }, 100);

            // Начинаем новый матч при подключении
            setTimeout(() => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send(JSON.stringify({ type: 'startNewMatch' }));
                }
            }, 200);
        };

        this.socket.onclose = () => {
            console.log('WebSocket connection closed');
            this.updateConnectionStatus('Disconnected');
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateConnectionStatus('Connection Error');
        };

        this.socket.onmessage = (event) => {
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
                    this.gameState = data;
                    this.updateGameDisplay(this.gameState);
                }

                this.updateScore();
            } catch (error) {
                console.error('Failed to parse game state:', error);
            }
        };
    }

    // Отправка настроек на сервер
    sendSettings() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const ballSpeed = document.getElementById('ball-speed')?.value || 5;
            const paddleSpeed = document.getElementById('paddle-speed')?.value || 5;

            const settings = {
                type: 'settings',
                ballSpeed: parseInt(ballSpeed),
                paddleSpeed: parseInt(paddleSpeed)
            };
            console.log('Sending settings:', settings);
            this.socket.send(JSON.stringify(settings));
        }
    }

    // Отправка команды начала нового матча
    sendStartNewMatch() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'startNewMatch' }));
        }
    }

    restartGame() {
        console.log('Restarting game...');
        // Закрываем текущее соединение
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        // Сбрасываем состояние игры
        this.gameState = null;
        this.gameOverButtons = null;
        // Создаём новое соединение
        this.connectWebSocket();
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    updateScore() {
        if (this.gameState && this.gameState.score) {
            const player1Score = document.getElementById('player1-score');
            const player2Score = document.getElementById('player2-score');

            if (player1Score) player1Score.textContent = this.gameState.score.player1 || 0;
            if (player2Score) player2Score.textContent = this.gameState.score.player2 || 0;
        }
    }

    updateGameDisplay(gameState) {
        // Обновляем состояние игры
        this.gameState = gameState;

        // Обновляем счёт
        this.updateScore();

        // Если игра в состоянии countdown, показываем обратный отсчёт
        if (gameState.gameStatus === 'countdown' && gameState.countdown !== undefined) {
            this.updateConnectionStatus(`Game starting in ${gameState.countdown}...`);
        } else if (gameState.gameStatus === 'playing') {
            this.updateConnectionStatus('Game in progress');
        } else if (gameState.gameStatus === 'gameOver') {
            this.updateConnectionStatus('Game Finished');
        }
    }

    gameLoop() {
        if (!this.isGameRunning) return;

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

        if (!this.gameContext || !this.gameCanvas) return;

        const ctx = this.gameContext;
        const canvas = this.gameCanvas;

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

        if (!this.gameState) {
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
        if (this.gameState.gameStatus === 'gameOver' && this.gameState.winner) {
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
            const winnerText = this.gameState.winner === 'player1' ? 'Player 1 Wins!' : 'AI Wins!';
            const winnerColor = this.gameState.winner === 'player1' ? '#4ecdc4' : '#45b7d1';

            ctx.shadowColor = winnerColor;
            ctx.shadowBlur = 15;
            ctx.fillStyle = winnerColor;
            ctx.font = 'bold 48px Arial';
            ctx.fillText(winnerText, canvas.width / 2, canvas.height / 2 - 60);
            ctx.shadowBlur = 0;

            // Финальный счёт с красивым стилем
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Arial';
            ctx.fillText(`Final Score: ${this.gameState.score.player1} - ${this.gameState.score.player2}`, canvas.width / 2, canvas.height / 2);

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
        if (this.gameState.gameStatus === 'countdown' && this.gameState.countdown > 0) {
            // Добавляем анимацию пульсации
            const pulse = Math.sin(Date.now() / 200) * 0.2 + 1;
            const fontSize = 72 * pulse;

            // Рисуем тень
            ctx.shadowColor = '#4ecdc4';
            ctx.shadowBlur = 30;
            ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(this.gameState.countdown.toString(), canvas.width / 2 + 3, canvas.height / 2 + 3);

            // Основной текст
            ctx.shadowColor = '#4ecdc4';
            ctx.shadowBlur = 20;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 + pulse * 0.1})`;
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillText(this.gameState.countdown.toString(), canvas.width / 2, canvas.height / 2);

            // Сбрасываем тень
            ctx.shadowBlur = 0;
        }

        // Нарисовать мяч с тенью (теперь используем правильные координаты)
        if (this.gameState.ball) {
            const ballX = this.gameState.ball.x;
            const ballY = this.gameState.ball.y;

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
        if (this.gameState.player1) {
            const paddle1Y = this.gameState.player1.y;
            drawPaddle(0, paddle1Y, '#3b82f6', true);
        }

        // Ракетка игрока 2 (правая) - теперь используем правильные координаты
        if (this.gameState.player2) {
            const paddle2Y = this.gameState.player2.y;
            drawPaddle(GAME_WIDTH - PADDLE_WIDTH, paddle2Y, '#ef4444', false);
        }

        // Нарисовать счёт в углах
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';

        // Счёт игрока 1 (левый верхний угол)
        const player1Score = this.gameState.score?.player1 || 0;
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.fillText(player1Score.toString(), 50, 50);
        ctx.shadowBlur = 0;

        // Счёт игрока 2 (правый верхний угол)
        const player2Score = this.gameState.score?.player2 || 0;
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

    saveUserToStorage() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    loadUserFromStorage() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    removeUserFromStorage() {
        localStorage.removeItem('currentUser');
    }

    updateUI() {
        // Обновить приветствие на главной странице
        const welcomeElement = document.querySelector('#home-page h1');
        if (welcomeElement && this.currentUser) {
            welcomeElement.textContent = `Welcome, ${this.currentUser.username}!`;
        } else if (welcomeElement) {
            welcomeElement.textContent = 'Welcome to ft_transcendence!';
        }

        // Показать/скрыть кнопки в зависимости от статуса аутентификации
        const logoutBtn = document.querySelector('#home-page .btn-danger');
        if (logoutBtn) {
            logoutBtn.style.display = this.currentUser ? 'inline-block' : 'none';
        }

        // Загрузить настройки
        this.loadSettings();
    }

    render(token) {
        this.isLoggedIn = !!token;
    }
}

// Глобальные функции для доступа из HTML
function startGame() {
    if (window.app) {
        window.app.startGame();
    } else {
        console.error('App not initialized yet!');
        // Попробуем еще раз через небольшую задержку
        setTimeout(() => {
            if (window.app) {
                window.app.startGame();
            }
        }, 100);
    }
}

function showPage(pageName) {
    if (window.app) {
        window.app.showPage(pageName);
    } else {
        console.error('App not initialized yet!');
    }
}

function handleLogin(event) {
    if (window.app) {
        window.app.handleLogin(event);
    } else {
        console.error('App not initialized yet!');
    }
}

function handleRegister(event) {
    if (window.app) {
        window.app.handleRegister(event);
    } else {
        console.error('App not initialized yet!');
    }
}

function logout() {
    if (window.app) {
        window.app.logout();
    } else {
        console.error('App not initialized yet!');
    }
}

function saveSettings() {
    if (window.app) {
        window.app.saveSettings();
    } else {
        console.error('App not initialized yet!');
    }
}

// Инициализация приложения после загрузки DOM
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing app...');
        app = new App();
        window.app = app; // Делаем доступным глобально для onclick в HTML
    });
} else {
    // DOM уже загружен
    console.log('DOM already loaded, initializing app...');
    app = new App();
    window.app = app;
}
