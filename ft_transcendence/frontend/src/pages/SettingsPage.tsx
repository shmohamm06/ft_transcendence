import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const [ballSpeed, setBallSpeed] = useState(5);
  const [paddleSpeed, setPaddleSpeed] = useState(6);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      // Load settings from localStorage
      const savedBallSpeed = localStorage.getItem('ballSpeed');
      const savedPaddleSpeed = localStorage.getItem('paddleSpeed');

      if (savedBallSpeed) {
        setBallSpeed(parseInt(savedBallSpeed));
      }
      if (savedPaddleSpeed) {
        setPaddleSpeed(parseInt(savedPaddleSpeed));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Save settings to localStorage
      localStorage.setItem('ballSpeed', ballSpeed.toString());
      localStorage.setItem('paddleSpeed', paddleSpeed.toString());

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));

      setMessage('Настройки сохранены успешно!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-xl text-gray-400">Загрузка настроек...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Настройки игры</h1>
          <Link to="/" className="text-blue-400 hover:underline">← Назад к игре</Link>
        </div>

        <div className="bg-gray-800 shadow rounded-lg p-6 border border-gray-700">
          <div className="space-y-6">
            {/* Ball Speed Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Скорость мяча: <span className="font-bold text-yellow-400">{ballSpeed}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={ballSpeed}
                onChange={(e) => setBallSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(ballSpeed - 1) * 11.11}%, #4b5563 ${(ballSpeed - 1) * 11.11}%, #4b5563 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Медленно (1)</span>
                <span>Быстро (10)</span>
              </div>
            </div>

            {/* Paddle Speed Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Скорость ракетки: <span className="font-bold text-green-400">{paddleSpeed}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={paddleSpeed}
                onChange={(e) => setPaddleSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${(paddleSpeed - 1) * 11.11}%, #4b5563 ${(paddleSpeed - 1) * 11.11}%, #4b5563 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Медленно (1)</span>
                <span>Быстро (10)</span>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition"
              >
                {saving ? 'Сохранение...' : 'Сохранить настройки'}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg ${message.includes('Ошибка') ? 'bg-red-900 text-red-300 border border-red-700' : 'bg-green-900 text-green-300 border border-green-700'}`}>
                {message}
              </div>
            )}
          </div>

          {/* Game Controls Info */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Управление в игре</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div>
                <strong className="text-white">Режим AI:</strong>
                <ul className="mt-2 space-y-1">
                  <li>W или ↑ - движение вверх</li>
                  <li>S или ↓ - движение вниз</li>
                </ul>
              </div>
              <div>
                <strong className="text-white">Режим PvP:</strong>
                <ul className="mt-2 space-y-1">
                  <li>Player 1: W (вверх) / S (вниз)</li>
                  <li>Player 2: ↑ (вверх) / ↓ (вниз)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <strong className="text-white">Цель игры:</strong>
              <p className="mt-2 text-gray-300">Забить 3 гола противнику</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
