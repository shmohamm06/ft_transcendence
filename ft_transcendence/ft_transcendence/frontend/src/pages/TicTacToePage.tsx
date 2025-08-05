import React from 'react';
import { Link } from 'react-router-dom';
import TicTacToe from '../components/TicTacToe';

const TicTacToePage = () => {
    return (
        <div className="min-h-screen text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div 
                            key={i}
                            className="absolute border border-electric-green animate-pulse"
                            style={{
                                left: `${i * 11}%`,
                                top: '15%',
                                width: '1px',
                                height: '70%',
                                animationDelay: `${i * 0.2}s`
                            }}
                        />
                    ))}
                </div>
                
                {/* Floating Game Symbols */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <div 
                        key={i}
                        className="absolute text-electric-green opacity-20 animate-float text-4xl font-bold"
                        style={{
                            left: `${10 + i * 12}%`,
                            top: `${20 + (i % 3) * 20}%`,
                            animationDelay: `${i * 0.8}s`
                        }}
                    >
                        {i % 2 === 0 ? 'X' : 'O'}
                    </div>
                ))}
                
                {/* Corner Accents */}
                <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-electric-green opacity-30" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-electric-green opacity-30" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="text-center pt-24 pb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-electric-green bg-clip-text text-transparent">
                        TIC TAC TOE
                    </h1>
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-electric-green to-transparent mx-auto mb-6"></div>
                    <p className="text-lg text-gray-300">
                        Classic strategy game
                    </p>
                </header>

                {/* Game Content */}
                <main className="flex-1 flex items-center justify-center px-6">
                    <div className="w-full max-w-2xl">
                        <div className="bg-white bg-opacity-5 rounded-2xl p-8 backdrop-blur-20 border border-white border-opacity-10">
                            <TicTacToe />
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="text-center pb-8">
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-electric-green to-transparent mx-auto mb-6"></div>
                    <div className="flex justify-center gap-4">
                        <Link
                            to="/"
                            className="btn btn-secondary px-8 py-3"
                        >
                            Back to Home
                        </Link>
                        <Link
                            to="/game"
                            className="btn btn-primary px-8 py-3"
                        >
                            Play Pong
                        </Link>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default TicTacToePage;
