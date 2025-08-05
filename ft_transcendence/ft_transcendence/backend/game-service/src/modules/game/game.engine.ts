export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const PADDLE_WIDTH = 20;
export const PADDLE_HEIGHT = 120;
export const BALL_SIZE = 12;
export const BASE_PADDLE_SPEED = 8;
export const BASE_BALL_SPEED = 6;
export const WINNING_SCORE = 3;

export let GLOBAL_PADDLE_SPEED_MULTIPLIER = 1;
export let GLOBAL_BALL_SPEED_MULTIPLIER = 1;

export function setGlobalPaddleSpeedMultiplier(multiplier: number) {
    GLOBAL_PADDLE_SPEED_MULTIPLIER = Math.max(0.1, Math.min(3.0, multiplier));
    console.log(`Global paddle speed multiplier set to: ${GLOBAL_PADDLE_SPEED_MULTIPLIER}`);
}

export function setGlobalBallSpeedMultiplier(multiplier: number) {
    GLOBAL_BALL_SPEED_MULTIPLIER = Math.max(0.1, Math.min(3.0, multiplier));
    console.log(`Global ball speed multiplier set to: ${GLOBAL_BALL_SPEED_MULTIPLIER}`);
}

export interface GameState {
    ball: { x: number; y: number; };
    player1: { y: number; score: number; };
    player2: { y: number; score: number; };
    gameStatus: 'countdown' | 'playing' | 'gameOver';
    countdown: number;
    winner?: 'player1' | 'player2';
    score: { player1: number; player2: number; };
    config: {
        paddleSpeed: number;
        ballSpeed: number;
        paddleSpeedMultiplier: number;
        ballSpeedMultiplier: number;
    };
}

export class GameEngine {
    private gameState: GameState;
    private ballVelocity: { x: number, y: number };
    private lastUpdate: number;
    private countdownStartTime: number;
    private progressiveSpeedMultiplier: number;
    private baseBallSpeed: number;
    // Индивидуальные множители для этого экземпляра игры
    private instancePaddleSpeedMultiplier: number;
    private instanceBallSpeedMultiplier: number;

    constructor() {
        // Инициализируем с глобальными значениями, но делаем их независимыми
        this.instancePaddleSpeedMultiplier = GLOBAL_PADDLE_SPEED_MULTIPLIER;
        this.instanceBallSpeedMultiplier = GLOBAL_BALL_SPEED_MULTIPLIER;

        this.gameState = this.getInitialState();
        this.progressiveSpeedMultiplier = 1.0;
        this.baseBallSpeed = BASE_BALL_SPEED * this.instanceBallSpeedMultiplier;
        this.ballVelocity = {
            x: this.baseBallSpeed,
            y: this.baseBallSpeed / 2
        };
        this.lastUpdate = Date.now();
        this.countdownStartTime = this.lastUpdate;
    }

    private getInitialState(): GameState {
        return {
            ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 },
            player1: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 },
            player2: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 },
            gameStatus: 'countdown',
            countdown: 3,
            winner: undefined,
            score: { player1: 0, player2: 0 },
            config: {
                paddleSpeed: BASE_PADDLE_SPEED * this.instancePaddleSpeedMultiplier,
                ballSpeed: BASE_BALL_SPEED * this.instanceBallSpeedMultiplier,
                paddleSpeedMultiplier: this.instancePaddleSpeedMultiplier,
                ballSpeedMultiplier: this.instanceBallSpeedMultiplier,
            },
        };
    }

    public update() {
        const now = Date.now();
        const deltaTime = Math.min((now - this.lastUpdate) / 16.67, 5.0);
        this.lastUpdate = now;

        const oldBallSpeed = this.gameState.config.ballSpeed;
        this.gameState.config.paddleSpeed = BASE_PADDLE_SPEED * this.instancePaddleSpeedMultiplier;
        this.gameState.config.ballSpeed = BASE_BALL_SPEED * this.instanceBallSpeedMultiplier;
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

        this.gameState.ball.x = Math.max(0, Math.min(GAME_WIDTH - BALL_SIZE, this.gameState.ball.x));
        this.gameState.ball.y = Math.max(0, Math.min(GAME_HEIGHT - BALL_SIZE, this.gameState.ball.y));

        if (this.gameState.ball.y <= 0 || this.gameState.ball.y >= GAME_HEIGHT - BALL_SIZE) {
            this.ballVelocity.y *= -1;
            this.gameState.ball.y = Math.max(0, Math.min(GAME_HEIGHT - BALL_SIZE, this.gameState.ball.y));
        }

        // Ball collision with paddles
        this.handlePaddleCollision();

        // Scoring
        if (this.gameState.ball.x <= 0) {
            this.scorePoint('player2');
        } else if (this.gameState.ball.x >= GAME_WIDTH - BALL_SIZE) {
            this.scorePoint('player1');
        }
    }

    private scorePoint(player: 'player1' | 'player2') {
        this.gameState[player].score++;
        if (this.gameState[player].score >= WINNING_SCORE) {
            this.gameState.winner = player;
            this.gameState.gameStatus = 'gameOver';
        } else {
            this.resetBall(player === 'player1' ? -1 : 1);
        }
    }

    private resetBall(direction: number) {
        this.gameState.ball = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
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
    private handlePaddleCollision() {
        const { ball, player1, player2 } = this.gameState;

        // Player 1 collision
        if (this.ballVelocity.x < 0 && ball.x <= PADDLE_WIDTH && ball.y + BALL_SIZE >= player1.y && ball.y <= player1.y + PADDLE_HEIGHT) {
            const hitPoint = (ball.y - player1.y) / PADDLE_HEIGHT;
            const angle = (hitPoint - 0.5) * Math.PI / 2; // Math.PI / 2 = 1.570796
            this.progressiveSpeedMultiplier = Math.min(5.0, this.progressiveSpeedMultiplier + 0.3);
            const currentSpeed = this.baseBallSpeed * this.progressiveSpeedMultiplier;
            this.ballVelocity.x = currentSpeed * Math.cos(angle);
            this.ballVelocity.y = currentSpeed * Math.sin(angle);
            ball.x = PADDLE_WIDTH + 1;
            console.log(`Ball speed increased to ${currentSpeed.toFixed(2)} (multiplier: ${this.progressiveSpeedMultiplier.toFixed(2)})`);
        }

        // Player 2 collision
        if (this.ballVelocity.x > 0 && ball.x + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH && ball.y + BALL_SIZE >= player2.y && ball.y <= player2.y + PADDLE_HEIGHT) {
            const hitPoint = (ball.y - player2.y) / PADDLE_HEIGHT;
            const angle = (hitPoint - 0.5) * Math.PI / 2;
            this.progressiveSpeedMultiplier = Math.min(5.0, this.progressiveSpeedMultiplier + 0.3);
            const currentSpeed = this.baseBallSpeed * this.progressiveSpeedMultiplier;
            this.ballVelocity.x = -currentSpeed * Math.cos(angle);
            this.ballVelocity.y = currentSpeed * Math.sin(angle);
            ball.x = GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE - 1;
            console.log(`Ball speed increased to ${currentSpeed.toFixed(2)} (multiplier: ${this.progressiveSpeedMultiplier.toFixed(2)})`);
        }
    }

    public movePaddle(player: 'player1' | 'player2', direction: 'up' | 'down') {
        if (this.gameState.gameStatus !== 'playing') return;
        const paddle = this.gameState[player];
        const move = this.gameState.config.paddleSpeed;
        if (direction === 'up') {
            paddle.y = Math.max(0, paddle.y - move);
        } else {
            paddle.y = Math.min(GAME_HEIGHT - PADDLE_HEIGHT, paddle.y + move);
        }
    }

    public moveAIPaddle(direction: 'up' | 'down') {
        this.movePaddle('player2', direction);
    }

    public startNewMatch() {
        this.gameState = this.getInitialState();
        this.progressiveSpeedMultiplier = 1.0;
        this.baseBallSpeed = BASE_BALL_SPEED * this.instanceBallSpeedMultiplier;
        this.startCountdown();
    }

    public startCountdown() {
        this.gameState.gameStatus = 'countdown';
        this.gameState.countdown = 3;
        this.countdownStartTime = Date.now();
    }

    public getGameState(): GameState {
        return {
            ...this.gameState,
            score: {
                player1: this.gameState.player1.score,
                player2: this.gameState.player2.score
            }
        };
    }

    public setBallSpeed(speed: number) {
        this.instanceBallSpeedMultiplier = Math.max(0.3, Math.min(3.0, speed / BASE_BALL_SPEED));
        this.baseBallSpeed = BASE_BALL_SPEED * this.instanceBallSpeedMultiplier;
        this.updateBallVelocity();
        console.log(`Ball speed set to ${speed} (instance multiplier: ${this.instanceBallSpeedMultiplier})`);
    }

    public setPaddleSpeed(speed: number) {
        this.instancePaddleSpeedMultiplier = Math.max(0.1, Math.min(3.0, speed / BASE_PADDLE_SPEED));
        console.log(`Paddle speed set to ${speed} (instance multiplier: ${this.instancePaddleSpeedMultiplier})`);
    }

    private updateBallVelocity() {
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
