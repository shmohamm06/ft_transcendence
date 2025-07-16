"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIOpponent = void 0;
const game_engine_1 = require("./game.engine");
class AIOpponent {
    getMove(state) {
        if (state.gameStatus !== 'playing') {
            return null;
        }
        const aiPaddle = state.player2;
        const ball = state.ball;
        const paddleCenter = aiPaddle.y + game_engine_1.PADDLE_HEIGHT / 2;
        // A simple logic: move towards the ball's Y position with a small tolerance
        if (paddleCenter < ball.y - 10) {
            return 'down';
        }
        else if (paddleCenter > ball.y + 10) {
            return 'up';
        }
        return null;
    }
}
exports.AIOpponent = AIOpponent;
