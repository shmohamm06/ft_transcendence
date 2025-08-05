// UI module for ft_transcendence
console.log('🎨 UI module loaded');

class UIManager {
    constructor(app) {
        this.app = app;
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.app.showPage(page);
            });
        });
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
        // Create game page dynamically
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

        // Add to end of body
        document.body.insertAdjacentHTML('beforeend', gamePageHTML);
        console.log('Game page HTML inserted into DOM');

        // Check that elements are actually created
        const gamePage = document.getElementById('game-page');
        const gameCanvas = document.getElementById('game-canvas');
        console.log('Game page element:', gamePage);
        console.log('Game canvas element:', gameCanvas);
        console.log('All elements with id game-canvas:', document.querySelectorAll('#game-canvas'));
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Remove game page if not switching to game
        const gamePage = document.getElementById('game-page');
        if (pageName !== 'game' && gamePage) {
            gamePage.classList.remove('active');
            console.log('Game page hidden on page switch');
            this.app.gameManager.stopGame();
        }

        // Special handling for game page
        if (pageName === 'game') {
            console.log('Switching to game page...');
            // Always use existing page from HTML
            let targetPage = document.getElementById('game-page');
            console.log('Game page from HTML:', targetPage);

            if (targetPage) {
                targetPage.classList.add('active');
                console.log('Game page shown and activated');
                console.log('Game page classes:', targetPage.className);
                console.log('Game page display style:', window.getComputedStyle(targetPage).display);

                // Check canvas immediately
                const canvasCheck = document.getElementById('game-canvas');
                console.log('Canvas immediate check:', canvasCheck);

                // Give time for DOM to update after adding active class
                requestAnimationFrame(() => {
                    console.log('RAF: Checking canvas after DOM update...');
                    const canvas = document.getElementById('game-canvas');
                    console.log('RAF: Canvas found:', canvas);
                    if (canvas) {
                        this.app.gameManager.initGame();
                    } else {
                        console.error('RAF: Canvas still not found!');
                        // Last attempt
                        setTimeout(() => this.app.gameManager.initGame(), 100);
                    }
                });
            } else {
                console.error('CRITICAL: Game page not found in HTML!');
                console.log('All elements with class "page":', document.querySelectorAll('.page'));
                console.log('Body innerHTML length:', document.body.innerHTML.length);
            }
        } else {
            // Handle all other pages
            const targetPage = document.getElementById(`${pageName}-page`);
            if (targetPage) {
                targetPage.classList.add('active');
            }
        }

        // Update active link in navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Add class to body for special styling
        if (pageName === 'game') {
            document.body.classList.add('game-active');
            // Logic moved above to game page handling
        } else {
            document.body.classList.remove('game-active');
            this.app.gameManager.stopGame();
        }
    }

    updateScore() {
        if (this.app.gameState && this.app.gameState.score) {
            const player1Score = document.getElementById('player1-score');
            const player2Score = document.getElementById('player2-score');

            if (player1Score) player1Score.textContent = this.app.gameState.score.player1 || 0;
            if (player2Score) player2Score.textContent = this.app.gameState.score.player2 || 0;
        }
    }

    updateUI() {
        // Update greeting on main page
        const welcomeElement = document.querySelector('#home-page h1');
        if (welcomeElement && this.app.currentUser) {
            welcomeElement.textContent = `Welcome, ${this.app.currentUser.username}!`;
        } else if (welcomeElement) {
            welcomeElement.textContent = 'Welcome to ft_transcendence!';
        }

        // Show/hide buttons depending on authentication status
        const logoutBtn = document.querySelector('#home-page .btn-danger');
        if (logoutBtn) {
            logoutBtn.style.display = this.app.currentUser ? 'inline-block' : 'none';
        }

        // Load settings
        this.app.settingsManager.loadSettings();
    }
}

// Export for global access
window.UIManager = UIManager;
