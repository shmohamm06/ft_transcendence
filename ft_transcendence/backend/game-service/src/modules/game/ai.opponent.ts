import { GameState, PADDLE_HEIGHT } from './game.engine';

export class AIOpponent {
  private lastMoveTime: number = 0;

  getMove(state: GameState): 'up' | 'down' | null {
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
    const paddleCenter = aiPaddle.y + PADDLE_HEIGHT / 2;

    // Very simple and dumb AI with large tolerance
    if (paddleCenter < ball.y - 30) {
        this.lastMoveTime = now;
        return 'down';
    } else if (paddleCenter > ball.y + 30) {
        this.lastMoveTime = now;
        return 'up';
    }

    return null;
  }
}
