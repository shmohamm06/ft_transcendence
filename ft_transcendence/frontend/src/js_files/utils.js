
console.log('🚀 Utils module loaded - Version: 2025-06-23-v2');

class App {
    constructor() {
        this.currentUser = null;
        this.socket = null;
        this.gameState = null;
        this.gameCanvas = null;
        this.gameContext = null;
        this.isGameRunning = false;
        this.isPlayer = false;

        
        this.authManager = new AuthManager(this);
        this.gameManager = new GameManager(this);
        this.websocketManager = new WebSocketManager(this);
        this.settingsManager = new SettingsManager(this);
        this.uiManager = new UIManager(this);

        this.init();
    }

    init() {
        this.uiManager.setupNavigation();
        this.settingsManager.setupEventListeners();
        this.authManager.loadUserFromStorage();
        this.uiManager.updateUI();

        
        this.uiManager.ensureGamePageHidden();
    }

    
    handleLogin(event) {
        return this.authManager.handleLogin(event);
    }

    handleRegister(event) {
        return this.authManager.handleRegister(event);
    }

    logout() {
        return this.authManager.logout();
    }

    saveSettings() {
        return this.settingsManager.saveSettings();
    }

    startGame() {
        return this.gameManager.startGame();
    }

    showPage(pageName) {
        return this.uiManager.showPage(pageName);
    }

    updateUI() {
        return this.uiManager.updateUI();
    }

    render(token) {
        return this.authManager.render(token);
    }
}

    
function startGame() {
    if (window.app) {
        window.app.startGame();
    } else {
        console.error('App not initialized yet!');
        
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

    
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing app...');
        app = new App();
        window.app = app; 
    });
} else {
    
    console.log('DOM already loaded, initializing app...');
    app = new App();
    window.app = app;
}


window.App = App;
