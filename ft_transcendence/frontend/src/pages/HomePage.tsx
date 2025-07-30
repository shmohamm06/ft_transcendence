import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const HomePage = () => {
    const { user, logout } = useAuth();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // Упрощенная автоматическая игра (только один мяч)
    const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
    const [ballDirection, setBallDirection] = useState({ x: 1, y: 1 });

    // Простая анимация одного мяча
    useEffect(() => {
        const gameInterval = setInterval(() => {
            setBallPosition(prev => {
                let newX = prev.x + ballDirection.x * 0.3;
                let newY = prev.y + ballDirection.y * 0.4;

                let newDirectionX = ballDirection.x;
                let newDirectionY = ballDirection.y;

                // Отражение от границ
                if (newX <= 5 || newX >= 95) {
                    newDirectionX = -ballDirection.x;
                }
                if (newY <= 10 || newY >= 90) {
                    newDirectionY = -ballDirection.y;
                }

                setBallDirection({ x: newDirectionX, y: newDirectionY });

                return {
                    x: Math.max(5, Math.min(95, newX)),
                    y: Math.max(10, Math.min(90, newY))
                };
            });
        }, 120); // Slower update rate

        return () => clearInterval(gameInterval);
    }, [ballDirection]);

    const gameCards = [
        {
            id: 'ai',
            title: 'VS AI',
            subtitle: 'Single Player',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H11V21H5V3H13V9H21ZM14 10V12H10V14H14V16L18 13L14 10ZM15 18V20H17V22H15C14.4 22 14 21.6 14 21V18H15Z"/>
                </svg>
            ),
            path: '/game',
            description: 'Challenge our smart AI opponent',
            difficulty: 'Medium',
            estimatedTime: '5-10 min'
        },
        {
            id: 'pvp',
            title: 'VS Player',
            subtitle: 'Local Multiplayer',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
                    <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12S12 10.2 12 8S13.8 4 16 4ZM8 4C10.2 4 12 5.8 12 8S10.2 12 8 12S4 10.2 4 8S5.8 4 8 4ZM8 14C5.8 14 1 15.1 1 17.3V20H15V17.3C15 15.1 10.2 14 8 14ZM16 14C15.7 14 15.4 14 15.1 14.1C16.2 14.8 17 15.9 17 17.3V20H23V17.3C23 15.1 18.2 14 16 14Z"/>
                </svg>
            ),
            path: '/game?mode=pvp',
            description: 'Play with a friend locally',
            difficulty: 'Depends on opponent',
            estimatedTime: '5-15 min'
        },
        {
            id: 'tournament',
            title: 'Tournament',
            subtitle: 'Bracket Competition',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
                    <path d="M5 16L3 5H1L3.5 17H5.5L9 7L12.5 17H14.5L17 5H15L13 16L9.5 6H8.5L5 16ZM18.5 2C20.4 2 22 3.6 22 5.5S20.4 9 18.5 9S15 7.4 15 5.5S16.6 2 18.5 2ZM18.5 7C19.3 7 20 6.3 20 5.5S19.3 4 18.5 4S17 4.7 17 5.5S17.7 7 18.5 7ZM18.5 10C19.9 10 21.4 10.6 22 12.5V22H15V12.5C15.6 10.6 17.1 10 18.5 10Z"/>
                </svg>
            ),
            path: '/tournament',
            description: 'Compete in elimination brackets',
            difficulty: 'High',
            estimatedTime: '20-30 min'
        },
        {
            id: 'tictactoe',
            title: 'Tic Tac Toe',
            subtitle: 'Classic Game',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7.5 6L6 7.5L8.5 10L6 12.5L7.5 14L10 11.5L12.5 14L14 12.5L11.5 10L14 7.5L12.5 6L10 8.5L7.5 6ZM8 16H16V18H8V16Z"/>
                </svg>
            ),
            path: '/tictactoe',
            description: 'Quick strategy game',
            difficulty: 'Easy',
            estimatedTime: '2-5 min'
        }
    ];

    const quickActions = [
        {
            title: 'View Stats',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z"/>
                </svg>
            ),
            path: '/profile'
        },
        {
            title: 'Settings',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M12 15.5C10.1 15.5 8.5 13.9 8.5 12S10.1 8.5 12 8.5S15.5 10.1 15.5 12S13.9 15.5 12 15.5ZM19.4 13C19.2 13.4 19.2 13.6 19.4 14L20.5 15.8C20.8 16.3 20.7 16.9 20.2 17.2L18.2 18.2C17.7 18.5 17.1 18.3 16.8 17.8L15.7 16C15.3 16.2 15 16.2 14.6 16.2L14.5 17.9C14.5 18.5 14 19 13.4 19H10.6C10 19 9.5 18.5 9.5 17.9L9.4 16.2C9 16.2 8.7 16.2 8.3 16L7.2 17.8C6.9 18.3 6.3 18.5 5.8 18.2L3.8 17.2C3.3 16.9 3.2 16.3 3.5 15.8L4.6 14C4.8 13.6 4.8 13.4 4.6 13L3.5 11.2C3.2 10.7 3.3 10.1 3.8 9.8L5.8 8.8C6.3 8.5 6.9 8.7 7.2 9.2L8.3 11C8.7 10.8 9 10.8 9.4 10.8L9.5 9.1C9.5 8.5 10 8 10.6 8H13.4C14 8 14.5 8.5 14.5 9.1L14.6 10.8C15 10.8 15.3 10.8 15.7 11L16.8 9.2C17.1 8.7 17.7 8.5 18.2 8.8L20.2 9.8C20.7 10.1 20.8 10.7 20.5 11.2L19.4 13Z"/>
                </svg>
            ),
            path: '/settings'
        }
    ];

    return (
        <div className="min-h-screen text-white relative overflow-hidden">
            {/* Гармонично заполненный статичный фон */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Сетка линий поля */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px transform -translate-x-1/2 opacity-8"
                     style={{background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 30px, rgba(204,255,0,0.4) 30px, rgba(204,255,0,0.4) 35px)'}} />

                {/* Дополнительные вертикальные линии */}
                <div className="absolute left-1/4 top-0 bottom-0 w-px opacity-5"
                     style={{background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 40px, rgba(204,255,0,0.3) 40px, rgba(204,255,0,0.3) 42px)'}} />
                <div className="absolute right-1/4 top-0 bottom-0 w-px opacity-5"
                     style={{background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 40px, rgba(204,255,0,0.3) 40px, rgba(204,255,0,0.3) 42px)'}} />

                {/* Горизонтальные линии */}
                <div className="absolute left-0 right-0 top-1/4 h-px opacity-5"
                     style={{background: 'repeating-linear-gradient(to right, transparent 0px, transparent 40px, rgba(204,255,0,0.3) 40px, rgba(204,255,0,0.3) 42px)'}} />
                <div className="absolute left-0 right-0 bottom-1/4 h-px opacity-5"
                     style={{background: 'repeating-linear-gradient(to right, transparent 0px, transparent 40px, rgba(204,255,0,0.3) 40px, rgba(204,255,0,0.3) 42px)'}} />

                {/* Статичные мячики (больше для заполнения) */}
                <div className="absolute w-2 h-2 bg-electric-green rounded-full opacity-12" style={{left: '12%', top: '18%'}} />
                <div className="absolute w-1.5 h-1.5 bg-electric-green rounded-full opacity-10" style={{left: '22%', top: '35%'}} />
                <div className="absolute w-2 h-2 bg-electric-green rounded-full opacity-12" style={{left: '38%', top: '25%'}} />
                <div className="absolute w-1.5 h-1.5 bg-electric-green rounded-full opacity-10" style={{left: '62%', top: '40%'}} />
                <div className="absolute w-2 h-2 bg-electric-green rounded-full opacity-12" style={{left: '78%', top: '32%'}} />
                <div className="absolute w-1.5 h-1.5 bg-electric-green rounded-full opacity-10" style={{left: '88%', top: '22%'}} />

                <div className="absolute w-2 h-2 bg-electric-green rounded-full opacity-12" style={{left: '15%', top: '65%'}} />
                <div className="absolute w-1.5 h-1.5 bg-electric-green rounded-full opacity-10" style={{left: '35%', top: '72%'}} />
                <div className="absolute w-2 h-2 bg-electric-green rounded-full opacity-12" style={{left: '55%', top: '68%'}} />
                <div className="absolute w-1.5 h-1.5 bg-electric-green rounded-full opacity-10" style={{left: '75%', top: '75%'}} />
                <div className="absolute w-2 h-2 bg-electric-green rounded-full opacity-12" style={{left: '25%', top: '85%'}} />
                <div className="absolute w-1.5 h-1.5 bg-electric-green rounded-full opacity-10" style={{left: '85%', top: '82%'}} />

                {/* Статичные ракетки (разные размеры и позиции) */}
                <div className="absolute w-1 h-10 bg-electric-green rounded-sm opacity-8" style={{left: '8%', top: '15%'}} />
                <div className="absolute w-1 h-12 bg-electric-green rounded-sm opacity-8" style={{left: '92%', top: '25%'}} />
                <div className="absolute w-1 h-8 bg-electric-green rounded-sm opacity-6" style={{left: '18%', top: '45%'}} />
                <div className="absolute w-1 h-14 bg-electric-green rounded-sm opacity-8" style={{left: '82%', top: '55%'}} />
                <div className="absolute w-1 h-10 bg-electric-green rounded-sm opacity-6" style={{left: '5%', top: '75%'}} />
                <div className="absolute w-1 h-12 bg-electric-green rounded-sm opacity-8" style={{left: '95%', top: '70%'}} />

                {/* Горизонтальные ракетки */}
                <div className="absolute w-10 h-1 bg-electric-green rounded-sm opacity-6" style={{left: '30%', top: '12%'}} />
                <div className="absolute w-12 h-1 bg-electric-green rounded-sm opacity-6" style={{left: '60%', top: '88%'}} />

                {/* Пинг-понг столы (простые прямоугольники) */}
                <div className="absolute border border-electric-green opacity-6 rounded-sm" style={{left: '20%', top: '30%', width: '50px', height: '25px'}} />
                <div className="absolute border border-electric-green opacity-6 rounded-sm" style={{left: '70%', top: '60%', width: '45px', height: '22px'}} />
                <div className="absolute border border-electric-green opacity-4 rounded-sm" style={{left: '10%', top: '55%', width: '40px', height: '20px'}} />

                {/* Траектории мячей (статичные линии) */}
                <div className="absolute opacity-6" style={{left: '25%', top: '40%', width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(204,255,0,0.4), transparent)', transform: 'rotate(15deg)'}} />
                <div className="absolute opacity-6" style={{left: '65%', top: '70%', width: '50px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(204,255,0,0.4), transparent)', transform: 'rotate(-20deg)'}} />
                <div className="absolute opacity-4" style={{left: '40%', top: '20%', width: '45px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(204,255,0,0.3), transparent)', transform: 'rotate(45deg)'}} />
                <div className="absolute opacity-4" style={{left: '15%', top: '80%', width: '55px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(204,255,0,0.3), transparent)', transform: 'rotate(-10deg)'}} />

                {/* Статичные счетчики игр */}
                <div className="absolute text-electric-green opacity-6 font-bold text-xs" style={{left: '20%', top: '85%'}}>3</div>
                <div className="absolute text-electric-green opacity-6 font-bold text-xs" style={{left: '80%', top: '85%'}}>0</div>

                {/* Геометрические фигуры пинг-понг тематики */}
                <div className="absolute border border-electric-green opacity-6 rounded-full" style={{left: '35%', top: '50%', width: '15px', height: '15px'}} />
                <div className="absolute border border-electric-green opacity-4" style={{left: '65%', top: '45%', width: '12px', height: '12px'}} />
                <div className="absolute border border-electric-green opacity-5 rounded-full" style={{left: '50%', top: '80%', width: '10px', height: '10px'}} />

                {/* Один движущийся мяч (главный элемент анимации) */}
                <div
                    className="absolute w-3 h-3 bg-electric-green rounded-full opacity-40 transition-all duration-200 ease-linear"
                    style={{
                        left: `${ballPosition.x}%`,
                        top: `${ballPosition.y}%`,
                        boxShadow: '0 0 12px rgba(204, 255, 0, 0.4)'
                    }}
                />

                {/* Угловые декоративные элементы */}
                <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-electric-green opacity-12" />
                <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-electric-green opacity-12" />
                <div className="absolute top-6 right-6 w-12 h-12 border-r border-t border-electric-green opacity-8" />
                <div className="absolute bottom-6 left-6 w-12 h-12 border-l border-b border-electric-green opacity-8" />
            </div>

            {/* Основной контент */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Секция героя */}
                <section className="pt-24 pb-12 text-center">
                    <div className="max-w-4xl mx-auto px-6">
                        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
                            PONG
                        </h1>
                        <p className="text-2xl md:text-3xl mb-4 text-green-400 font-light">
                            Welcome back, {user?.username || 'Player'}
                        </p>
                                                <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
                            Experience the classic game reimagined with modern technology and competitive gameplay
                        </p>
                    </div>
                </section>

                {/* Сетка игровых режимов */}
                <section className="flex-1 px-6 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Choose Your Game Mode</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {gameCards.map((card, index) => (
                                <Link
                                    key={card.id}
                                    to={card.path}
                                    className="game-card group"
                                    onMouseEnter={() => setHoveredCard(card.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div className="text-center relative z-10">
                                        <div className="icon mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                                            {card.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                                        <p className="text-green-400 text-sm mb-3">{card.subtitle}</p>
                                        <p className="text-gray-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {card.description}
                                        </p>

                                        {/* Детали при наведении */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                            <div className="text-xs text-gray-400 space-y-1">
                                                <div>Difficulty: <span className="text-green-400">{card.difficulty}</span></div>
                                                <div>Time: <span className="text-green-400">{card.estimatedTime}</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Интерактивная рамка */}
                                    <div className={`absolute inset-0 rounded-16 border-2 border-transparent transition-all duration-300 ${
                                        hoveredCard === card.id ? 'border-green-400 shadow-lg shadow-green-400/20' : ''
                                    }`} />
                                </Link>
                            ))}
                        </div>

                        {/* Быстрые действия */}
                        <div className="bg-white bg-opacity-5 rounded-2xl p-8 backdrop-blur-20">
                            <h3 className="text-2xl font-bold text-center mb-8">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                                {quickActions.map((action, index) => (
                                    <Link
                                        key={action.title}
                                        to={action.path}
                                        className="group p-4 rounded-xl border border-white border-opacity-10 hover:border-green-400 transition-all duration-300 hover:bg-green-400 hover:bg-opacity-10 text-center"
                                    >
                                        <div className="mb-2 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                                            {action.icon}
                                        </div>
                                        <div className="text-sm font-medium">{action.title}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Подвал */}
                <footer className="text-center pb-8">
                    <div className="max-w-lg mx-auto px-6">
                        <div className="w-24 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto mb-6"></div>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={logout}
                                className="btn btn-secondary px-6 py-3 text-sm"
                            >
                                Logout
                            </button>
                            <Link
                                to="/profile"
                                className="btn btn-primary px-6 py-3 text-sm"
                            >
                                View Profile
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default HomePage;
