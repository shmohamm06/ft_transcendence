"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = exports.GLOBAL_BALL_SPEED_MULTIPLIER = exports.GLOBAL_PADDLE_SPEED_MULTIPLIER = exports.WINNING_SCORE = exports.BASE_BALL_SPEED = exports.BASE_PADDLE_SPEED = exports.BALL_SIZE = exports.PADDLE_HEIGHT = exports.PADDLE_WIDTH = exports.GAME_HEIGHT = exports.GAME_WIDTH = void 0;
exports.setGlobalPaddleSpeedMultiplier = setGlobalPaddleSpeedMultiplier;
exports.setGlobalBallSpeedMultiplier = setGlobalBallSpeedMultiplier;
exports.GAME_WIDTH = 960;
exports.GAME_HEIGHT = 540;
exports.PADDLE_WIDTH = 20;
exports.PADDLE_HEIGHT = 120;
exports.BALL_SIZE = 12;
exports.BASE_PADDLE_SPEED = 8;
exports.BASE_BALL_SPEED = 6;
exports.WINNING_SCORE = 3;
// Global speed multipliers
exports.GLOBAL_PADDLE_SPEED_MULTIPLIER = 1;
exports.GLOBAL_BALL_SPEED_MULTIPLIER = 1;
// Functions for setting global multipliers
function setGlobalPaddleSpeedMultiplier(multiplier) {
    exports.GLOBAL_PADDLE_SPEED_MULTIPLIER = Math.max(0.1, Math.min(3.0, multiplier));
    console.log(`Global paddle speed multiplier set to: ${exports.GLOBAL_PADDLE_SPEED_MULTIPLIER}`);
}
function setGlobalBallSpeedMultiplier(multiplier) {
    exports.GLOBAL_BALL_SPEED_MULTIPLIER = Math.max(0.1, Math.min(3.0, multiplier));
    console.log(`Global ball speed multiplier set to: ${exports.GLOBAL_BALL_SPEED_MULTIPLIER}`);
}
class GameEngine {
    constructor() {
        this.gameState = this.getInitialState();
        this.progressiveSpeedMultiplier = 1.0;
        this.baseBallSpeed = exports.BASE_BALL_SPEED * exports.GLOBAL_BALL_SPEED_MULTIPLIER;
        this.ballVelocity = {
            x: this.baseBallSpeed,
            y: this.baseBallSpeed / 2
        };
        this.lastUpdate = Date.now();
        this.countdownStartTime = this.lastUpdate;
    }
    getInitialState() {
        return {
            ball: { x: exports.GAME_WIDTH / 2, y: exports.GAME_HEIGHT / 2 },
            player1: { y: exports.GAME_HEIGHT / 2 - exports.PADDLE_HEIGHT / 2, score: 0 },
            player2: { y: exports.GAME_HEIGHT / 2 - exports.PADDLE_HEIGHT / 2, score: 0 },
            gameStatus: 'countdown',
            countdown: 3,
            winner: undefined,
            score: { player1: 0, player2: 0 },
            config: {
                paddleSpeed: exports.BASE_PADDLE_SPEED * exports.GLOBAL_PADDLE_SPEED_MULTIPLIER,
                ballSpeed: exports.BASE_BALL_SPEED * exports.GLOBAL_BALL_SPEED_MULTIPLIER,
                paddleSpeedMultiplier: exports.GLOBAL_PADDLE_SPEED_MULTIPLIER,
                ballSpeedMultiplier: exports.GLOBAL_BALL_SPEED_MULTIPLIER,
            },
        };
    }
    update() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 16.67; // Normalize to 60 FPS
        this.lastUpdate = now;
        // Update configuration with current global multipliers
        const oldBallSpeed = this.gameState.config.ballSpeed;
        this.gameState.config.paddleSpeed = exports.BASE_PADDLE_SPEED * exports.GLOBAL_PADDLE_SPEED_MULTIPLIER;
        this.gameState.config.ballSpeed = exports.BASE_BALL_SPEED * exports.GLOBAL_BALL_SPEED_MULTIPLIER;
        this.gameState.config.paddleSpeedMultiplier = exports.GLOBAL_PADDLE_SPEED_MULTIPLIER;
        this.gameState.config.ballSpeedMultiplier = exports.GLOBAL_BALL_SPEED_MULTIPLIER;
        // If ball speed changed, update its velocity immediately
        if (oldBallSpeed !== this.gameState.config.ballSpeed) {
            console.log(`Ball speed changed from ${oldBallSpeed} to ${this.gameState.config.ballSpeed}, updating velocity...`);
            this.updateBallVelocity();
        }
        // Countdown logic
        if (this.gameState.gameStatus === 'countdown') {
            const elapsed = now - this.countdownStartTime;
            const newCountdown = Math.ceil(3 - elapsed / 1000);
            if (newCountdown !== this.gameState.countdown) {
                this.gameState.countdown = newCountdown;
            }
            if (this.gameState.countdown <= 0) {
                this.gameState.gameStatus = 'playing';
                // When transitioning to playing state, update ball speed
                this.updateBallVelocity();
            }
            return;
        }
        if (this.gameState.gameStatus !== 'playing') {
            return;
        }
        // Ball movement
        this.gameState.ball.x += this.ballVelocity.x * deltaTime;
        this.gameState.ball.y += this.ballVelocity.y * deltaTime;
        // Ball collision with top/bottom walls
        if (this.gameState.ball.y <= 0 || this.gameState.ball.y >= exports.GAME_HEIGHT - exports.BALL_SIZE) {
            this.ballVelocity.y *= -1;
        }
        // Ball collision with paddles
        this.handlePaddleCollision();
        // Scoring
        if (this.gameState.ball.x <= 0) {
            this.scorePoint('player2');
        }
        else if (this.gameState.ball.x >= exports.GAME_WIDTH - exports.BALL_SIZE) {
            this.scorePoint('player1');
        }
    }
    scorePoint(player) {
        this.gameState[player].score++;
        if (this.gameState[player].score >= exports.WINNING_SCORE) {
            this.gameState.winner = player;
            this.gameState.gameStatus = 'gameOver';
        }
        else {
            this.resetBall(player === 'player1' ? -1 : 1);
        }
    }
    resetBall(direction) {
        this.gameState.ball = { x: exports.GAME_WIDTH / 2, y: exports.GAME_HEIGHT / 2 };
        // Reset progressive speed when ball is reset (after scoring)
        this.progressiveSpeedMultiplier = 1.0;
        const angle = (Math.random() - 0.5) * Math.PI / 3;
        const currentSpeed = this.baseBallSpeed * this.progressiveSpeedMultiplier;
        this.ballVelocity = {
            x: currentSpeed * direction * Math.cos(angle),
            y: currentSpeed * Math.sin(angle),
        };
        this.startCountdown();
    }
    handlePaddleCollision() {
        const { ball, player1, player2 } = this.gameState;
        // Player 1 collision
        if (this.ballVelocity.x < 0 && ball.x <= exports.PADDLE_WIDTH && ball.y + exports.BALL_SIZE >= player1.y && ball.y <= player1.y + exports.PADDLE_HEIGHT) {
            const hitPoint = (ball.y - player1.y) / exports.PADDLE_HEIGHT;
            const angle = (hitPoint - 0.5) * Math.PI / 2;
            // Increase speed progressively with each paddle hit
            this.progressiveSpeedMultiplier = Math.min(2.5, this.progressiveSpeedMultiplier + 0.1);
            const currentSpeed = this.baseBallSpeed * this.progressiveSpeedMultiplier;
            this.ballVelocity.x = currentSpeed * Math.cos(angle);
            this.ballVelocity.y = currentSpeed * Math.sin(angle);
            ball.x = exports.PADDLE_WIDTH + 1;
            console.log(`Ball speed increased to ${currentSpeed.toFixed(2)} (multiplier: ${this.progressiveSpeedMultiplier.toFixed(2)})`);
        }
        // Player 2 collision
        if (this.ballVelocity.x > 0 && ball.x + exports.BALL_SIZE >= exports.GAME_WIDTH - exports.PADDLE_WIDTH && ball.y + exports.BALL_SIZE >= player2.y && ball.y <= player2.y + exports.PADDLE_HEIGHT) {
            const hitPoint = (ball.y - player2.y) / exports.PADDLE_HEIGHT;
            const angle = (hitPoint - 0.5) * Math.PI / 2;
            // Increase speed progressively with each paddle hit
            this.progressiveSpeedMultiplier = Math.min(2.5, this.progressiveSpeedMultiplier + 0.1);
            const currentSpeed = this.baseBallSpeed * this.progressiveSpeedMultiplier;
            this.ballVelocity.x = -currentSpeed * Math.cos(angle);
            this.ballVelocity.y = currentSpeed * Math.sin(angle);
            ball.x = exports.GAME_WIDTH - exports.PADDLE_WIDTH - exports.BALL_SIZE - 1;
            console.log(`Ball speed increased to ${currentSpeed.toFixed(2)} (multiplier: ${this.progressiveSpeedMultiplier.toFixed(2)})`);
        }
    }
    movePaddle(player, direction) {
        if (this.gameState.gameStatus !== 'playing')
            return;
        const paddle = this.gameState[player];
        const move = this.gameState.config.paddleSpeed;
        if (direction === 'up') {
            paddle.y = Math.max(0, paddle.y - move);
        }
        else {
            paddle.y = Math.min(exports.GAME_HEIGHT - exports.PADDLE_HEIGHT, paddle.y + move);
        }
    }
    moveAIPaddle(direction) {
        this.movePaddle('player2', direction);
    }
    startNewMatch() {
        this.gameState = this.getInitialState();
        this.progressiveSpeedMultiplier = 1.0;
        this.baseBallSpeed = exports.BASE_BALL_SPEED * exports.GLOBAL_BALL_SPEED_MULTIPLIER;
        this.startCountdown();
    }
    startCountdown() {
        this.gameState.gameStatus = 'countdown';
        this.gameState.countdown = 3;
        this.countdownStartTime = Date.now();
    }
    getGameState() {
        return {
            ...this.gameState,
            score: {
                player1: this.gameState.player1.score,
                player2: this.gameState.player2.score
            }
        };
    }
    // Updated methods for setting speed through multipliers
    setBallSpeed(speed) {
        setGlobalBallSpeedMultiplier(speed / exports.BASE_BALL_SPEED);
        this.baseBallSpeed = exports.BASE_BALL_SPEED * exports.GLOBAL_BALL_SPEED_MULTIPLIER;
        // Immediately update ball speed
        this.updateBallVelocity();
        console.log(`Ball speed set to ${speed} (multiplier: ${exports.GLOBAL_BALL_SPEED_MULTIPLIER})`);
    }
    setPaddleSpeed(speed) {
        setGlobalPaddleSpeedMultiplier(speed / exports.BASE_PADDLE_SPEED);
        console.log(`Paddle speed set to ${speed} (multiplier: ${exports.GLOBAL_PADDLE_SPEED_MULTIPLIER})`);
    }
    // New method for updating ball speed
    updateBallVelocity() {
        const currentSpeed = this.baseBallSpeed * this.progressiveSpeedMultiplier;
        // If game is in countdown state, just update configuration
        if (this.gameState.gameStatus === 'countdown') {
            console.log(`Game in countdown, ball speed will be applied when game starts: ${currentSpeed}`);
            return;
        }
        // If ball is moving, update its speed while preserving direction
        if (this.ballVelocity.x !== 0 || this.ballVelocity.y !== 0) {
            const magnitude = Math.sqrt(this.ballVelocity.x * this.ballVelocity.x + this.ballVelocity.y * this.ballVelocity.y);
            if (magnitude > 0) {
                // Normalize direction and apply new speed
                this.ballVelocity.x = (this.ballVelocity.x / magnitude) * currentSpeed;
                this.ballVelocity.y = (this.ballVelocity.y / magnitude) * currentSpeed;
            }
            else {
                // If ball is stationary, give it random direction
                const angle = (Math.random() - 0.5) * Math.PI / 3;
                this.ballVelocity.x = currentSpeed * Math.cos(angle);
                this.ballVelocity.y = currentSpeed * Math.sin(angle);
            }
        }
        else {
            // If ball is stationary, give it random direction
            const angle = (Math.random() - 0.5) * Math.PI / 3;
            this.ballVelocity.x = currentSpeed * Math.cos(angle);
            this.ballVelocity.y = currentSpeed * Math.sin(angle);
        }
        console.log(`Ball velocity updated: x=${this.ballVelocity.x.toFixed(2)}, y=${this.ballVelocity.y.toFixed(2)}, speed=${currentSpeed}, progressive multiplier=${this.progressiveSpeedMultiplier.toFixed(2)}`);
    }
}
exports.GameEngine = GameEngine;
