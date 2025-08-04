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
exports.GLOBAL_PADDLE_SPEED_MULTIPLIER = 1;
exports.GLOBAL_BALL_SPEED_MULTIPLIER = 1;
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
        // Инициализируем с глобальными значениями, но делаем их независимыми
        this.instancePaddleSpeedMultiplier = exports.GLOBAL_PADDLE_SPEED_MULTIPLIER;
        this.instanceBallSpeedMultiplier = exports.GLOBAL_BALL_SPEED_MULTIPLIER;
        this.gameState = this.getInitialState();
        this.progressiveSpeedMultiplier = 1.0;
        this.baseBallSpeed = exports.BASE_BALL_SPEED * this.instanceBallSpeedMultiplier;
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
                paddleSpeed: exports.BASE_PADDLE_SPEED * this.instancePaddleSpeedMultiplier,
                ballSpeed: exports.BASE_BALL_SPEED * this.instanceBallSpeedMultiplier,
                paddleSpeedMultiplier: this.instancePaddleSpeedMultiplier,
                ballSpeedMultiplier: this.instanceBallSpeedMultiplier,
            },
        };
    }
    update() {
        const now = Date.now();
        const deltaTime = Math.min((now - this.lastUpdate) / 16.67, 5.0);
        this.lastUpdate = now;
        const oldBallSpeed = this.gameState.config.ballSpeed;
        this.gameState.config.paddleSpeed = exports.BASE_PADDLE_SPEED * this.instancePaddleSpeedMultiplier;
        this.gameState.config.ballSpeed = exports.BASE_BALL_SPEED * this.instanceBallSpeedMultiplier;
        this.gameState.config.paddleSpeedMultiplier = this.instancePaddleSpeedMultiplier;
        this.gameState.config.ballSpeedMultiplier = this.instanceBallSpeedMultiplier;
        if (oldBallSpeed !== this.gameState.config.ballSpeed) {
            console.log(`Ball speed changed from ${oldBallSpeed} to ${this.gameState.config.ballSpeed}, updating velocity...`);
            this.updateBallVelocity();
        }
        if (this.gameState.gameStatus === 'countdown') {
            const elapsed = now - this.countdownStartTime;
            const newCountdown = Math.ceil(3 - elapsed / 1000);
            if (newCountdown !== this.gameState.countdown) {
                this.gameState.countdown = newCountdown;
            }
            if (this.gameState.countdown <= 0) {
                this.gameState.gameStatus = 'playing';
                this.updateBallVelocity();
            }
            return;
        }
        if (this.gameState.gameStatus !== 'playing') {
            return;
        }
        this.gameState.ball.x += this.ballVelocity.x * deltaTime;
        this.gameState.ball.y += this.ballVelocity.y * deltaTime;
        this.gameState.ball.x = Math.max(0, Math.min(exports.GAME_WIDTH - exports.BALL_SIZE, this.gameState.ball.x));
        this.gameState.ball.y = Math.max(0, Math.min(exports.GAME_HEIGHT - exports.BALL_SIZE, this.gameState.ball.y));
        if (this.gameState.ball.y <= 0 || this.gameState.ball.y >= exports.GAME_HEIGHT - exports.BALL_SIZE) {
            this.ballVelocity.y *= -1;
            this.gameState.ball.y = Math.max(0, Math.min(exports.GAME_HEIGHT - exports.BALL_SIZE, this.gameState.ball.y));
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
        const angle = (Math.random() - 0.7) * Math.PI / 6;
        const currentSpeed = this.baseBallSpeed * this.progressiveSpeedMultiplier;
        this.ballVelocity = {
            x: currentSpeed * direction * Math.cos(angle),
            y: currentSpeed * Math.sin(angle),
        };
        this.startCountdown();
    }
    // градусы = радианы × (180 / 3.14159...)
    // градусы = радианы × 57.2958...
    handlePaddleCollision() {
        const { ball, player1, player2 } = this.gameState;
        // Player 1 collision
        if (this.ballVelocity.x < 0 && ball.x <= exports.PADDLE_WIDTH && ball.y + exports.BALL_SIZE >= player1.y && ball.y <= player1.y + exports.PADDLE_HEIGHT) {
            const hitPoint = (ball.y - player1.y) / exports.PADDLE_HEIGHT;
            const angle = (hitPoint - 0.5) * Math.PI / 2; // Math.PI / 2 = 1.570796
            this.progressiveSpeedMultiplier = Math.min(5.0, this.progressiveSpeedMultiplier + 0.3);
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
            this.progressiveSpeedMultiplier = Math.min(5.0, this.progressiveSpeedMultiplier + 0.3);
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
        this.baseBallSpeed = exports.BASE_BALL_SPEED * this.instanceBallSpeedMultiplier;
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
    setBallSpeed(speed) {
        this.instanceBallSpeedMultiplier = Math.max(0.3, Math.min(3.0, speed / exports.BASE_BALL_SPEED));
        this.baseBallSpeed = exports.BASE_BALL_SPEED * this.instanceBallSpeedMultiplier;
        this.updateBallVelocity();
        console.log(`Ball speed set to ${speed} (instance multiplier: ${this.instanceBallSpeedMultiplier})`);
    }
    setPaddleSpeed(speed) {
        this.instancePaddleSpeedMultiplier = Math.max(0.1, Math.min(3.0, speed / exports.BASE_PADDLE_SPEED));
        console.log(`Paddle speed set to ${speed} (instance multiplier: ${this.instancePaddleSpeedMultiplier})`);
    }
    updateBallVelocity() {
        const currentSpeed = this.baseBallSpeed * this.progressiveSpeedMultiplier;
        if (this.gameState.gameStatus === 'countdown') {
            console.log(`Game in countdown, ball speed will be applied when game starts: ${currentSpeed}`);
            return;
        }
        if (this.ballVelocity.x !== 0 || this.ballVelocity.y !== 0) {
            const magnitude = Math.sqrt(this.ballVelocity.x * this.ballVelocity.x + this.ballVelocity.y * this.ballVelocity.y);
            if (magnitude > 0) {
                this.ballVelocity.x = (this.ballVelocity.x / magnitude) * currentSpeed;
                this.ballVelocity.y = (this.ballVelocity.y / magnitude) * currentSpeed;
            }
        }
        console.log(`Ball velocity updated: x=${this.ballVelocity.x.toFixed(2)}, y=${this.ballVelocity.y.toFixed(2)}, speed=${currentSpeed}, progressive multiplier=${this.progressiveSpeedMultiplier.toFixed(2)}`);
    }
}
exports.GameEngine = GameEngine;
