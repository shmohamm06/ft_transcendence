import { GameState, PADDLE_HEIGHT } from './game.engine';

export class AIOpponent {
  getMove(state: GameState): 'up' | 'down' | null {
    if (state.gameStatus !== 'playing') {
      return null;
    }

    const aiPaddle = state.player2;
    const ball = state.ball;
    const paddleCenter = aiPaddle.y + PADDLE_HEIGHT / 2;

    // A simple logic: move towards the ball's Y position with a small tolerance
    if (paddleCenter < ball.y - 10) {
        return 'down';
    } else if (paddleCenter > ball.y + 10) {
        return 'up';
    }

    return null;
  }
}
