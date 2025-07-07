import { useState } from 'react';

const TestPage = () => {
    const [clickCount, setClickCount] = useState(0);

    const handleClick = () => {
        setClickCount(prev => prev + 1);
        alert(`Button clicked ${clickCount + 1} times!`);
        console.log('Simple test button clicked!');
    };

    const testNavigation = () => {
        console.log('Navigation test');
        window.location.href = '/login';
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#1a202c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <h1 style={{ color: 'white', fontSize: '2rem' }}>Simple Test Page</h1>

            <button
                onClick={handleClick}
                style={{
                    padding: '12px 24px',
                    background: '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer'
                }}
            >
                Click Me! ({clickCount})
            </button>

            <button
                onClick={testNavigation}
                style={{
                    padding: '12px 24px',
                    background: '#4299e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer'
                }}
            >
                Go to Login (direct navigation)
            </button>

            <div style={{ color: 'white', textAlign: 'center' }}>
                <p>If buttons work here, the problem is with React Router or AuthContext</p>
                <p>If buttons don't work here, the problem is with React itself</p>
            </div>
        </div>
    );
};

export default TestPage;
