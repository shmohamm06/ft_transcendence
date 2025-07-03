import { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';

// This is a simplified mapping from backend coordinates to frontend 3D space
const SCENE_WIDTH = 16;
const SCENE_HEIGHT = 12;
const PADDLE_DEPTH = 0.5;
const PADDLE_3D_WIDTH = 0.4;
const PADDLE_3D_HEIGHT = 2;
const BALL_3D_SIZE = 0.3;

// Backend constants (should match backend)
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

interface GameState {
    ball: { x: number; y: number };
    player1: { y: number };
    player2: { y: number };
    score: { player1: number; player2: number };
}

interface PongSceneProps {
    gameState: GameState | null;
}

const PongScene = ({ gameState }: PongSceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const engine = new BABYLON.Engine(canvasRef.current, true);
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.15, 1);

        // Camera
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 20, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvasRef.current, true);

        // Lights
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.8;

        // Ground (Game Table)
        const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: SCENE_WIDTH, height: SCENE_HEIGHT }, scene);
        const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.6);
        ground.material = groundMaterial;

        // Paddles
        const paddle1 = BABYLON.MeshBuilder.CreateBox("player1", { width: PADDLE_3D_WIDTH, height: PADDLE_3D_HEIGHT, depth: PADDLE_DEPTH }, scene);
        const paddle2 = BABYLON.MeshBuilder.CreateBox("player2", { width: PADDLE_3D_WIDTH, height: PADDLE_3D_HEIGHT, depth: PADDLE_DEPTH }, scene);
        paddle1.position.x = -SCENE_WIDTH / 2;
        paddle2.position.x = SCENE_WIDTH / 2;

        // Ball
        const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: BALL_3D_SIZE }, scene);
        const ballMaterial = new BABYLON.StandardMaterial("ballMat", scene);
        ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0); // Yellow
        ball.material = ballMaterial;

        engine.runRenderLoop(() => {
            if (gameState) {
                // Map backend coordinates to frontend 3D coordinates
                ball.position.x = (gameState.ball.x / GAME_WIDTH - 0.5) * SCENE_WIDTH;
                ball.position.z = (gameState.ball.y / GAME_HEIGHT - 0.5) * -SCENE_HEIGHT; // Invert Z for correct orientation

                paddle1.position.z = (gameState.player1.y / GAME_HEIGHT - 0.5) * -SCENE_HEIGHT;
                paddle2.position.z = (gameState.player2.y / GAME_HEIGHT - 0.5) * -SCENE_HEIGHT;
            }
            scene.render();
        });

        const handleResize = () => engine.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            engine.dispose();
        };
    }, [gameState]); // Rerunning useEffect on gameState change might be heavy, but it's simple for now.

    return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default PongScene;
