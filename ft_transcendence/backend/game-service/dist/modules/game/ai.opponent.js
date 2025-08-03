"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIOpponent = void 0;
const game_engine_1 = require("./game.engine");
class AIOpponent {
    constructor() {
        this.lastMoveTime = 0;
    }
    getMove(state) {
        if (state.gameStatus !== 'playing') {
            return null;
        }
        // Add random delay to make AI slower and dumber
        const now = Date.now();
        if (now - this.lastMoveTime < 10 + Math.random() * 70) {
            return null;
        }
        const aiPaddle = state.player2;
        const ball = state.ball;
        const paddleCenter = aiPaddle.y + game_engine_1.PADDLE_HEIGHT / 2;
        // Very simple and dumb AI with large tolerance
        if (paddleCenter < ball.y - 30) {
            this.lastMoveTime = now;
            return 'down';
        }
        else if (paddleCenter > ball.y + 30) {
            this.lastMoveTime = now;
            return 'up';
        }
        return null;
    }
}
exports.AIOpponent = AIOpponent;
