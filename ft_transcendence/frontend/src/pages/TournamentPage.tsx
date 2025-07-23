import React from 'react';
import Tournament from '../components/Tournament';
import { Link } from 'react-router-dom';

const TournamentPage: React.FC = () => {
    const [tournament, setTournament] = React.useState<any>(null);
    const [playerNames, setPlayerNames] = React.useState<string[]>(Array(4).fill(''));
    const [numPlayers, setNumPlayers] = React.useState(4);

    const createTournament = () => {
        const newTournament = {
            id: Date.now(),
            name: `Tournament ${Date.now()}`,
            players: playerNames.map((name, index) => ({ id: index, name: name })),
            matches: [],
            status: 'setup',
        };
        setTournament(newTournament);
    };

    const handleMatchComplete = (winner: string) => {
        if (tournament) {
            const updatedTournament = { ...tournament };
            updatedTournament.matches.push({
                id: Date.now(),
                player1: playerNames[0],
                player2: playerNames[1],
                winner: winner,
            });
            setTournament(updatedTournament);
        }
    };

    const updatePlayerName = (index: number, name: string) => {
        const newPlayerNames = [...playerNames];
        newPlayerNames[index] = name;
        setPlayerNames(newPlayerNames);
    };

    return (
        <div className="min-h-screen text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Tournament Grid Pattern */}
                <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div 
                            key={i}
                            className="absolute border border-electric-green animate-pulse"
                            style={{
                                left: `${15 + i * 14}%`,
                                top: '10%',
                                width: '1px',
                                height: '80%',
                                animationDelay: `${i * 0.3}s`
                            }}
                        />
                    ))}
                </div>
                
                {/* Trophy Elements */}
                {Array.from({ length: 4 }).map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-1 h-1 bg-electric-green rounded-full opacity-30 animate-pulse"
                        style={{
                            left: `${20 + i * 20}%`,
                            top: `${25 + (i % 2) * 30}%`,
                            animationDelay: `${i * 0.6}s`
                        }}
                    />
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
                        PONG TOURNAMENT
                    </h1>
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-electric-green to-transparent mx-auto mb-6"></div>
                    <Link to="/" className="text-electric-green hover:text-electric-green-dark font-medium transition-colors duration-300">
                        ← Back to Home
                    </Link>
                </header>

                {/* Content */}
                <main className="flex-1 px-6 pb-12">
                    <div className="max-w-4xl mx-auto">
                        {!tournament ? (
                            // Tournament Setup
                            <div className="bg-white bg-opacity-5 rounded-2xl p-8 backdrop-blur-20 border border-white border-opacity-10">
                                <h2 className="text-3xl font-bold mb-8 text-center text-electric-green">Create Tournament</h2>
                                
                                <div className="max-w-lg mx-auto">
                                    <div className="form-group">
                                        <label className="block text-white text-lg font-bold mb-4">
                                            Number of Players: <span className="text-electric-green">{numPlayers}</span>
                                        </label>
                                        <select
                                            value={numPlayers}
                                            onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                                            className="form-input w-full"
                                        >
                                            <option value={4}>4 Players</option>
                                            <option value={8}>8 Players</option>
                                        </select>
                                    </div>

                                    {playerNames.map((name, index) => (
                                        <div key={index} className="form-group">
                                            <label className="block text-white text-sm font-bold mb-2">
                                                Player {index + 1}
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => updatePlayerName(index, e.target.value)}
                                                className="form-input w-full"
                                                placeholder={`Player ${index + 1}`}
                                            />
                                        </div>
                                    ))}

                                    <button
                                        onClick={createTournament}
                                        className="btn btn-primary w-full py-4 text-lg mt-6"
                                    >
                                        Start Tournament
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Tournament Display
                            <div className="space-y-8">
                                <div className="bg-white bg-opacity-5 rounded-2xl p-6 backdrop-blur-20 border border-white border-opacity-10">
                                    <Tournament tournament={tournament} onMatchComplete={handleMatchComplete} />
                                </div>
                                
                                {/* Reset Tournament Button */}
                                <div className="text-center">
                                    <button
                                        onClick={() => {
                                            setTournament(null);
                                            setPlayerNames(Array(4).fill(''));
                                            setNumPlayers(4);
                                        }}
                                        className="btn btn-danger px-8 py-3"
                                    >
                                        Reset Tournament
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TournamentPage;
