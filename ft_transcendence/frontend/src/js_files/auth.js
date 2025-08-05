
console.log('🔐 Auth module loaded');

class AuthManager {
    constructor(app) {
        this.app = app;
    }

    async handleLogin(event) {
        event.preventDefault();

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            
            
            this.app.currentUser = { username, id: Date.now() };
            this.saveUserToStorage();
            this.app.updateUI();
            this.app.showPage('home');

            
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
            
            
            this.app.currentUser = { username, email, id: Date.now() };
            this.saveUserToStorage();
            this.app.updateUI();
            this.app.showPage('home');

            
            event.target.reset();
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    }

    logout() {
        this.app.currentUser = null;
        this.removeUserFromStorage();
        this.app.updateUI();
        this.app.showPage('login');
    }

    saveUserToStorage() {
        if (this.app.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.app.currentUser));
        }
    }

    loadUserFromStorage() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.app.currentUser = JSON.parse(userData);
        }
    }

    removeUserFromStorage() {
        localStorage.removeItem('currentUser');
    }

    render(token) {
        this.app.isLoggedIn = !!token;
    }
}


window.AuthManager = AuthManager;
