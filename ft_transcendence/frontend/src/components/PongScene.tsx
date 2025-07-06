import { useEffect, useRef, useState, useCallback } from 'react';

// Backend constants (must match backend exactly!)
const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 120;
const BALL_SIZE = 12;

interface GameState {
    ball: { x: number; y: number };
    player1: { y: number };
    player2: { y: number };
    score: { player1: number; player2: number };
    gameStatus?: 'countdown' | 'playing' | 'gameOver';
    winner?: 'player1' | 'player2';
    countdown?: number;
}

interface PongSceneProps {
    gameState: GameState | null;
}

const PongScene = ({ gameState }: PongSceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const previousStateRef = useRef<GameState | null>(null);

    // Optimized drawing functions
    const drawPaddle = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
        // Shadow
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;

        // Paddle gradient
        const paddleGradient = ctx.createLinearGradient(x, y, x + PADDLE_WIDTH, y);
        paddleGradient.addColorStop(0, color);
        paddleGradient.addColorStop(0.5, '#ffffff');
        paddleGradient.addColorStop(1, color);

        ctx.fillStyle = paddleGradient;
        ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);

        // Paddle border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);

        ctx.shadowBlur = 0;
    }, []);

    const drawBall = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
        const ballCenterX = x + BALL_SIZE / 2;
        const ballCenterY = y + BALL_SIZE / 2;

        // Ball glow
        const ballGradient = ctx.createRadialGradient(
            ballCenterX, ballCenterY, 0,
            ballCenterX, ballCenterY, BALL_SIZE
        );
        ballGradient.addColorStop(0, '#ffff00');
        ballGradient.addColorStop(0.7, '#ffaa00');
        ballGradient.addColorStop(1, 'rgba(255, 170, 0, 0)');

        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.fillStyle = ballGradient;
        ctx.beginPath();
        ctx.arc(ballCenterX, ballCenterY, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();

        // Ball core
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ballCenterX, ballCenterY, BALL_SIZE / 4, 0, Math.PI * 2);
        ctx.fill();
    }, []);

    const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
        // Create background gradient
        const bgGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        bgGradient.addColorStop(0, '#1a1a2e');
        bgGradient.addColorStop(0.5, '#16213e');
        bgGradient.addColorStop(1, '#0f3460');

        // Clear canvas with gradient background
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Draw center line with glow effect
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.setLineDash([15, 15]);
        ctx.beginPath();
        ctx.moveTo(GAME_WIDTH / 2, 20);
        ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT - 20);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // Add corner decorations
        const drawCornerDecoration = (x: number, y: number) => {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y + 20);
            ctx.lineTo(x, y);
            ctx.lineTo(x + 20, y);
            ctx.stroke();
        };

        drawCornerDecoration(10, 10);
        drawCornerDecoration(GAME_WIDTH - 30, 10);
        drawCornerDecoration(10, GAME_HEIGHT - 10);
        drawCornerDecoration(GAME_WIDTH - 30, GAME_HEIGHT - 10);
    }, []);

    // Simple interpolation with performance optimization
    useEffect(() => {
        if (!gameState || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;

        let currentState = gameState;
        let targetState = gameState;
        let animationStartTime = Date.now();
        const interpolationDuration = 16; // ~60fps

        const render = () => {
            if (!ctx) return;

            // Simple linear interpolation for smoother movement
            const elapsed = Date.now() - animationStartTime;
            const progress = Math.min(elapsed / interpolationDuration, 1);

            let renderState = currentState;

            if (previousStateRef.current && progress < 1) {
                // Interpolate between previous and current state
                const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

                renderState = {
                    ...currentState,
                    ball: {
                        x: lerp(previousStateRef.current.ball.x, currentState.ball.x, progress),
                        y: lerp(previousStateRef.current.ball.y, currentState.ball.y, progress)
                    },
                    player1: {
                        y: lerp(previousStateRef.current.player1.y, currentState.player1.y, progress)
                    },
                    player2: {
                        y: lerp(previousStateRef.current.player2.y, currentState.player2.y, progress)
                    }
                };
            }

            // Draw everything
            drawBackground(ctx);
            drawPaddle(ctx, 10, renderState.player1.y, '#00ff88');
            drawPaddle(ctx, GAME_WIDTH - PADDLE_WIDTH - 10, renderState.player2.y, '#ff6b6b');
            drawBall(ctx, renderState.ball.x, renderState.ball.y);

            // Continue animation only if interpolating
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(render);
            }
        };

        // Start new interpolation when state changes
        if (previousStateRef.current &&
            (previousStateRef.current.ball.x !== gameState.ball.x ||
             previousStateRef.current.ball.y !== gameState.ball.y ||
             previousStateRef.current.player1.y !== gameState.player1.y ||
             previousStateRef.current.player2.y !== gameState.player2.y)) {

            animationStartTime = Date.now();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            animationRef.current = requestAnimationFrame(render);
        } else {
            // No interpolation needed, just render current state
            drawBackground(ctx);
            drawPaddle(ctx, 10, gameState.player1.y, '#00ff88');
            drawPaddle(ctx, GAME_WIDTH - PADDLE_WIDTH - 10, gameState.player2.y, '#ff6b6b');
            drawBall(ctx, gameState.ball.x, gameState.ball.y);
        }

        previousStateRef.current = gameState;

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [gameState, drawBackground, drawPaddle, drawBall]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <canvas
                ref={canvasRef}
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    border: '3px solid #ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
                    backgroundColor: '#1a1a2e'
                }}
            />
        </div>
    );
};

export default PongScene;
