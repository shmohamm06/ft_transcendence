// ft_transcendence - Modular JavaScript Application
// Version: 2025-06-23-v2
console.log('🚀 Loading ft_transcendence modules...');

// Function to dynamically load JavaScript modules
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            console.log(`✅ Loaded: ${src}`);
            resolve();
        };
        script.onerror = () => {
            console.error(`❌ Failed to load: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
    });
}

// Load all modules in the correct order
async function initializeApp() {
    try {
        console.log('📦 Loading application modules...');

        // Load utility modules first (they export classes that others depend on)
        await loadScript('src/js_files/utils.js');

        // Load manager modules (these depend on utils.js)
        await Promise.all([
            loadScript('src/js_files/auth.js'),
            loadScript('src/js_files/websocket.js'),
            loadScript('src/js_files/settings.js'),
            loadScript('src/js_files/ui.js'),
            loadScript('src/js_files/game.js')
        ]);

        console.log('🎉 All modules loaded successfully!');
        console.log('🚀 ft_transcendence application ready!');

    } catch (error) {
        console.error('💥 Failed to initialize application:', error);
        alert('Failed to load application modules. Please refresh the page.');
    }
}

// Check if DOM is ready and start loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
