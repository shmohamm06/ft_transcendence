import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Player {
    id: number;
    nickname: string;
    isReady: boolean;
}

interface Match {
    id: number;
    player1: Player | null;
    player2: Player | null;
    winner: Player | null;
    isCompleted: boolean;
    round: 'semifinal' | 'final';
}

type TournamentPhase = 'registration' | 'bracket' | 'playing' | 'completed';

interface TournamentState {
    phase: TournamentPhase;
    players: Player[];
    matches: Match[];
    currentMatch: Match | null;
    champion: Player | null;
}

const Tournament: React.FC = () => {
    const [phase, setPhase] = useState<TournamentPhase>('registration');
    const [players, setPlayers] = useState<Player[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
    const [champion, setChampion] = useState<Player | null>(null);
    const [newPlayerName, setNewPlayerName] = useState('');

    // Save tournament state to localStorage
    const saveTournamentState = (state: Partial<TournamentState>) => {
        const currentState = loadTournamentState();
        const newState = { ...currentState, ...state };
        localStorage.setItem('tournamentState', JSON.stringify(newState));
    };

    // Load tournament state from localStorage
    const loadTournamentState = (): TournamentState => {
        const saved = localStorage.getItem('tournamentState');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('Error loading tournament state:', error);
            }
        }
        return {
            phase: 'registration',
            players: [],
            matches: [],
            currentMatch: null,
            champion: null
        };
    };

    // Load tournament state on component mount
    useEffect(() => {
        const savedState = loadTournamentState();
        setPhase(savedState.phase);
        setPlayers(savedState.players);
        setMatches(savedState.matches);
        setCurrentMatch(savedState.currentMatch);
        setChampion(savedState.champion);
    }, []);

    // Save state whenever it changes
    useEffect(() => {
        saveTournamentState({
            phase,
            players,
            matches,
            currentMatch,
            champion
        });
    }, [phase, players, matches, currentMatch, champion]);

    // Listen for game results from localStorage
    useEffect(() => {
        const handleGameResult = () => {
            const gameResult = localStorage.getItem('tournamentGameResult');
            console.log('🔍 Checking for tournament result:', gameResult);

            if (gameResult && currentMatch) {
                try {
                    const result = JSON.parse(gameResult);
                    console.log('📋 Parsed result:', result, 'Current match:', currentMatch);

                    if (result.matchId === currentMatch.id) {
                        console.log('✅ Match IDs match! Auto-completing match with result:', result);
                        // Auto-complete match based on game result
                        const winnerId = result.winner === 'player1' ? currentMatch.player1!.id : currentMatch.player2!.id;
                        const winnerName = result.winner === 'player1' ? currentMatch.player1!.nickname : currentMatch.player2!.nickname;

                        console.log(`🏆 Setting winner: ${winnerName} (ID: ${winnerId})`);
                        completeMatch(winnerId);
                        localStorage.removeItem('tournamentGameResult');
                        console.log('🧹 Cleaned up tournament result from localStorage');
                    } else {
                        console.log('❌ Match ID mismatch:', result.matchId, 'vs', currentMatch.id);
                    }
                } catch (error) {
                    console.error('❌ Error parsing game result:', error);
                    localStorage.removeItem('tournamentGameResult');
                }
            } else if (!gameResult) {
                console.log('📭 No tournament result found in localStorage');
            } else if (!currentMatch) {
                console.log('🚫 No current match to process result for');
            }
        };

        // Check for game result when component mounts or updates
        console.log('🔄 Setting up tournament result listeners...');
        handleGameResult();

        // Listen for storage changes (when user returns from game)
        const handleStorageChange = (e: StorageEvent) => {
            console.log('💾 Storage change detected:', e.key, e.newValue);
            if (e.key === 'tournamentGameResult') {
                setTimeout(handleGameResult, 100);
            }
        };

        // Also check on focus (when user returns to tab)
        const handleFocus = () => {
            console.log('👁️ Window focus detected, checking for results...');
            setTimeout(handleGameResult, 200);
        };

        // Check more frequently for game results (every 500ms)
        const interval = setInterval(() => {
            handleGameResult();
        }, 500);

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            console.log('🧹 Cleaning up tournament result listeners...');
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
            clearInterval(interval);
        };
    }, [currentMatch]);

    // Auto-return to bracket if we're in playing state but no current match
    useEffect(() => {
        if (phase === 'playing' && !currentMatch) {
            console.log('🔄 No current match in playing state, returning to bracket');
            setPhase('bracket');
        }
    }, [phase, currentMatch]);

    // Initialize tournament
    const initializeTournament = () => {
        if (players.length !== 4) return;

        // Create semifinal matches
        const semifinal1: Match = {
            id: 1,
            player1: players[0],
            player2: players[1],
            winner: null,
            isCompleted: false,
            round: 'semifinal'
        };

        const semifinal2: Match = {
            id: 2,
            player1: players[2],
            player2: players[3],
            winner: null,
            isCompleted: false,
            round: 'semifinal'
        };

        const final: Match = {
            id: 3,
            player1: null,
            player2: null,
            winner: null,
            isCompleted: false,
            round: 'final'
        };

        setMatches([semifinal1, semifinal2, final]);
        setPhase('bracket');
    };

    // Add player
    const addPlayer = () => {
        if (newPlayerName.trim() && players.length < 4) {
            const newPlayer: Player = {
                id: players.length + 1,
                nickname: newPlayerName.trim(),
                isReady: true
            };
            setPlayers([...players, newPlayer]);
            setNewPlayerName('');
        }
    };

    // Remove player
    const removePlayer = (playerId: number) => {
        setPlayers(players.filter(p => p.id !== playerId));
    };

    // Start match
    const startMatch = (match: Match) => {
        setCurrentMatch(match);
        setPhase('playing');

        // Store match data for the game
        const matchData = {
            matchId: match.id,
            player1: match.player1!.nickname,
            player2: match.player2!.nickname,
            round: match.round,
            isTournament: true
        };
        localStorage.setItem('tournamentMatch', JSON.stringify(matchData));
    };

    // Complete match
    const completeMatch = (winnerId: number) => {
        if (!currentMatch) return;

        const winner = currentMatch.player1?.id === winnerId ? currentMatch.player1 : currentMatch.player2;
        console.log(`🏆 Completing match ${currentMatch.id} with winner:`, winner);

        setMatches(prevMatches => {
            const updatedMatches = prevMatches.map(m => {
                if (m.id === currentMatch.id) {
                    return { ...m, winner, isCompleted: true };
                }
                return m;
            });

            // Check if we need to set up final match
            const completedSemifinals = updatedMatches.filter(m => m.round === 'semifinal' && m.isCompleted);
            if (completedSemifinals.length === 2) {
                const finalMatch = updatedMatches.find(m => m.round === 'final');
                if (finalMatch && !finalMatch.player1) {
                    finalMatch.player1 = completedSemifinals[0].winner;
                    finalMatch.player2 = completedSemifinals[1].winner;
                    console.log('🏁 Final match set up:', finalMatch);
                }
            }

            return updatedMatches;
        });

        // Clear current match first
        setCurrentMatch(null);
        console.log('🧹 Cleared current match');

        // Check if tournament is complete
        if (currentMatch.round === 'final') {
            console.log('🏆 Tournament complete! Setting champion:', winner);
            setChampion(winner);
            setPhase('completed');
        } else {
            console.log('🔄 Returning to bracket state');
            setPhase('bracket');
        }
    };

    // Reset tournament
    const resetTournament = () => {
        setPhase('registration');
        setPlayers([]);
        setMatches([]);
        setCurrentMatch(null);
        setChampion(null);
        setNewPlayerName('');
        localStorage.removeItem('tournamentMatch');
        localStorage.removeItem('tournamentGameResult');
        localStorage.removeItem('tournamentState');
    };

    const renderRegistration = () => (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-8">Tournament Registration</h2>

            <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Add Players ({players.length}/4)</h3>

                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder="Enter player nickname"
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        maxLength={20}
                        onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                    />
                    <button
                        onClick={addPlayer}
                        disabled={!newPlayerName.trim() || players.length >= 4}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition"
                    >
                        Add Player
                    </button>
                </div>

                <div className="space-y-2">
                    {players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <span className="font-semibold">{player.nickname}</span>
                            <button
                                onClick={() => removePlayer(player.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <button
                    onClick={initializeTournament}
                    disabled={players.length !== 4}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg text-lg font-semibold transition"
                >
                    Start Tournament
                </button>
                {players.length !== 4 && (
                    <p className="text-gray-400 mt-2">Need exactly 4 players to start</p>
                )}
            </div>
        </div>
    );

    const renderBracket = () => (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-8">Tournament Bracket</h2>

            {/* Progress indicator */}
            <div className="mb-6 text-center">
                <div className="text-sm text-gray-400">
                    Matches completed: {matches.filter(m => m.isCompleted).length} / {matches.length}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Semifinals */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center">Semifinals</h3>
                    {matches.filter(m => m.round === 'semifinal').map((match) => (
                        <div key={match.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold">{match.player1?.nickname}</span>
                                <span className="text-gray-400">vs</span>
                                <span className="font-semibold">{match.player2?.nickname}</span>
                            </div>
                            {match.isCompleted ? (
                                <div className="text-center">
                                    <span className="text-green-400 font-bold">
                                        ✅ Winner: {match.winner?.nickname}
                                    </span>
                                </div>
                            ) : currentMatch?.id === match.id ? (
                                <div className="text-center">
                                    <span className="text-yellow-400 font-bold animate-pulse">
                                        🎮 Match in Progress...
                                    </span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => startMatch(match)}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                >
                                    Start Match
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Final */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center">Final</h3>
                    {matches.filter(m => m.round === 'final').map((match) => (
                        <div key={match.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500">
                            {match.player1 && match.player2 ? (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold">{match.player1.nickname}</span>
                                        <span className="text-gray-400">vs</span>
                                        <span className="font-semibold">{match.player2.nickname}</span>
                                    </div>
                                    {match.isCompleted ? (
                                        <div className="text-center">
                                            <span className="text-green-400 font-bold">
                                                🏆 Champion: {match.winner?.nickname}
                                            </span>
                                        </div>
                                    ) : currentMatch?.id === match.id ? (
                                        <div className="text-center">
                                            <span className="text-yellow-400 font-bold animate-pulse">
                                                🎮 Final Match in Progress...
                                            </span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => startMatch(match)}
                                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                                        >
                                            Start Final
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-gray-400">
                                    Waiting for semifinal winners...
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderPlaying = () => (
        <div className="max-w-2xl mx-auto p-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Match in Progress</h2>
            {currentMatch && (
                <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-yellow-500">
                    <h3 className="text-xl font-semibold mb-4 text-yellow-400">
                        🏓 {currentMatch.round === 'semifinal' ? 'Semifinal Match' : 'Final Match'}
                    </h3>
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">{currentMatch.player1?.nickname}</div>
                            <div className="text-sm text-gray-400">(W/S keys)</div>
                        </div>
                        <span className="text-3xl text-gray-400">⚔️</span>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-400">{currentMatch.player2?.nickname}</div>
                            <div className="text-sm text-gray-400">(Arrow keys)</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-700 rounded-lg p-4">
                            <p className="text-lg text-gray-300 mb-2">Ready to battle?</p>
                            <p className="text-sm text-gray-400">Click the button below to start your Pong match!</p>
                            <div className="mt-2 p-2 bg-blue-900 rounded text-xs text-blue-200">
                                🏆 <strong>Tournament Rule:</strong> First player to reach 3 points wins the match!
                            </div>
                        </div>

                        <Link
                            to="/game?mode=tournament"
                            className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-lg font-semibold transition transform hover:scale-105"
                        >
                            🏓 Play Pong Game
                        </Link>

                        <div className="mt-6 pt-4 border-t border-gray-600">
                            <div className="text-center text-gray-400">
                                <div className="animate-pulse mb-2">
                                    <span className="text-yellow-400">⚠️</span> Waiting for game result...
                                </div>
                                <p className="text-xs">
                                    The winner will be determined automatically when someone reaches 3 points.<br/>
                                    Come back to this page after completing the match.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center">
                <button
                    onClick={() => {
                        console.log('🔄 Back to Bracket button clicked');
                        setCurrentMatch(null);
                        setPhase('bracket');
                    }}
                    className="inline-block px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition text-sm"
                >
                    ← Back to Bracket
                </button>
            </div>
        </div>
    );

    const renderCompleted = () => (
        <div className="max-w-2xl mx-auto p-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Tournament Complete!</h2>
            {champion && (
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg p-6 mb-6">
                    <h3 className="text-4xl font-bold mb-2">🏆 Champion 🏆</h3>
                    <p className="text-2xl font-semibold">{champion.nickname}</p>
                </div>
            )}

            {/* Tournament Results Summary */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h4 className="text-xl font-semibold mb-4">Tournament Results</h4>
                <div className="space-y-2">
                    {matches.filter(m => m.isCompleted).map((match) => (
                        <div key={match.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                            <span className="text-sm">
                                {match.round === 'semifinal' ? 'Semifinal' : 'Final'}: {match.player1?.nickname} vs {match.player2?.nickname}
                            </span>
                            <span className="font-bold text-green-400">
                                {match.winner?.nickname} Won
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <button
                    onClick={resetTournament}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition"
                >
                    Start New Tournament
                </button>
                <div>
                    <Link
                        to="/"
                        className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-blue-400 hover:underline">
                            ← Back to Home
                        </Link>
                        <h1 className="text-2xl font-bold">Pong Tournament</h1>
                        {phase !== 'registration' && (
                            <span className="text-sm text-gray-400">
                                ({phase === 'bracket' ? 'Bracket' : phase === 'playing' ? 'Playing' : 'Completed'})
                            </span>
                        )}
                    </div>
                    <button
                        onClick={resetTournament}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                    >
                        Reset Tournament
                    </button>
                </div>
            </div>

            <div className="p-6">
                {phase === 'registration' && renderRegistration()}
                {phase === 'bracket' && renderBracket()}
                {phase === 'playing' && renderPlaying()}
                {phase === 'completed' && renderCompleted()}
            </div>
        </div>
    );
};

export default Tournament;
