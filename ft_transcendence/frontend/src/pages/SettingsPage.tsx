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
      localStorage.setItem('ballSpeed', ballSpeed.toString());
      localStorage.setItem('paddleSpeed', paddleSpeed.toString());

      await new Promise(resolve => setTimeout(resolve, 500));

      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-electric-green border-t-transparent animate-spin mx-auto mb-4 rounded-full"></div>
          <p className="text-white">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Circuit Pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i}
              className="absolute border border-electric-green"
              style={{
                left: `${i * 16}%`,
                top: '20%',
                width: '1px',
                height: '60%'
              }}
            />
          ))}
        </div>
        
        {/* Corner Elements */}
        <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-electric-green opacity-30" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-electric-green opacity-30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center pt-24 pb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-electric-green bg-clip-text text-transparent">
            SETTINGS
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-electric-green to-transparent mx-auto mb-6"></div>
          <p className="text-lg text-gray-300">
            Customize your game experience
          </p>
        </header>

        {/* Settings Form */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-lg">
            <div className="settings-form">
              
              {/* Ball Speed Setting */}
              <div className="form-group">
                <div className="text-center mb-6">
                  <label className="block text-lg font-bold mb-2">
                    Ball Speed
                  </label>
                  <div className="text-3xl font-bold text-electric-green mb-4">{ballSpeed}</div>
                </div>
                <div className="relative mb-8">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={ballSpeed}
                    onChange={(e) => setBallSpeed(parseInt(e.target.value))}
                    className="form-range w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-3">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>

              {/* Paddle Speed Setting */}
              <div className="form-group">
                <div className="text-center mb-6">
                  <label className="block text-lg font-bold mb-2">
                    Paddle Speed
                  </label>
                  <div className="text-3xl font-bold text-electric-green mb-4">{paddleSpeed}</div>
                </div>
                <div className="relative mb-8">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={paddleSpeed}
                    onChange={(e) => setPaddleSpeed(parseInt(e.target.value))}
                    className="form-range w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-3">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="text-center mb-8">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="btn btn-primary px-12 py-4"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

              {/* Message */}
              {message && (
                <div className="text-center p-4 border border-electric-green bg-electric-green bg-opacity-10 rounded-lg">
                  <span className="text-electric-green font-medium">{message}</span>
                </div>
              )}

              {/* Controls Info */}
              <div className="mt-12 pt-8 border-t border-white border-opacity-10">
                <h3 className="text-center text-xl font-bold mb-6">Game Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-white bg-opacity-5 rounded-lg">
                    <div className="text-electric-green text-xl font-bold mb-2">Player 1</div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div>W - Move Up</div>
                      <div>S - Move Down</div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-white bg-opacity-5 rounded-lg">
                    <div className="text-electric-green text-xl font-bold mb-2">Player 2</div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div>↑ - Move Up</div>
                      <div>↓ - Move Down</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center pb-8">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-electric-green to-transparent mx-auto mb-6"></div>
          <Link
            to="/"
            className="btn btn-secondary px-8 py-3"
          >
            Back to Home
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default SettingsPage;
