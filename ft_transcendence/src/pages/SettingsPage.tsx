import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Setting {
  key: string;
  value: string;
}

const SettingsPage: React.FC = () => {
  const [ballSpeed, setBallSpeed] = useState(5);
  const [paddleSpeed, setPaddleSpeed] = useState(6);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const settings: Setting[] = await response.json();
        settings.forEach(setting => {
          if (setting.key === 'ballSpeed') {
            setBallSpeed(parseInt(setting.value));
          } else if (setting.key === 'paddleSpeed') {
            setPaddleSpeed(parseInt(setting.value));
          }
        });
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
      const settings: Setting[] = [
        { key: 'ballSpeed', value: ballSpeed.toString() },
        { key: 'paddleSpeed', value: paddleSpeed.toString() }
      ];

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage('Настройки сохранены успешно!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Загрузка настроек...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Настройки игры</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* Ball Speed Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Скорость мяча: <span className="font-bold text-blue-600">{ballSpeed}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={ballSpeed}
                onChange={(e) => setBallSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Медленно (1)</span>
                <span>Быстро (10)</span>
              </div>
            </div>

            {/* Paddle Speed Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Скорость ракетки: <span className="font-bold text-blue-600">{paddleSpeed}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={paddleSpeed}
                onChange={(e) => setPaddleSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
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
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {saving ? 'Сохранение...' : 'Сохранить настройки'}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded ${message.includes('Ошибка') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message}
              </div>
            )}
          </div>

          {/* Game Controls Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Управление в игре</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Клавиши управления:</strong>
                <ul className="mt-2 space-y-1">
                  <li>W или ↑ - движение вверх</li>
                  <li>S или ↓ - движение вниз</li>
                </ul>
              </div>
              <div>
                <strong>Цель игры:</strong>
                <p className="mt-2">Забить 3 гола противнику (ИИ)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
