// Game state
let allSolutions = [];
let currentSolutionIndex = 0;
let currentWords = [];
let game;

// Initialize Phaser game
function initGame() {
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: window.innerWidth,
        height: window.innerHeight,
        scene: CrosswordScene,
        backgroundColor: '#1a1a1a'
    };

    game = new Phaser.Game(config);
}

// Show loading overlay
function showLoading(show, text = 'Generating crossword solutions...') {
    const loading = document.getElementById('loading');
    const loadingText = document.getElementById('loading-text');
    
    if (show) {
        loading.style.display = 'flex';
        loadingText.textContent = text;
    } else {
        loading.style.display = 'none';
    }
}

// Generate crossword from input
function generateCrossword() {
    const input = document.getElementById('word-input').value;
    if (!input) return;
    
    const words = input.split(',')
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length > 0)
        .slice(0, 7); // Limit to 7 words
    
    if (words.length < 2) {
        alert('Please enter at least 2 words');
        return;
    }
    
    currentWords = words;
    showLoading(true, `Generating solutions for: ${words.join(', ')}`);
    
    // Generate in background to prevent blocking
    setTimeout(() => {
        const gen = new CrosswordGenerator(words);
        allSolutions = gen.generate();
        currentSolutionIndex = 0;
        
        // Start Phaser scene with solutions
        game.scene.start('CrosswordScene', { 
            solutions: allSolutions, 
            index: currentSolutionIndex 
        });
        
        showLoading(false);
    }, 100);
}

// Navigation functions
function showNextSolution() {
    if (allSolutions.length === 0) return;
    currentSolutionIndex = (currentSolutionIndex + 1) % allSolutions.length;
    game.scene.start('CrosswordScene', { 
        solutions: allSolutions, 
        index: currentSolutionIndex 
    });
}

function showPreviousSolution() {
    if (allSolutions.length === 0) return;
    currentSolutionIndex = (currentSolutionIndex - 1 + allSolutions.length) % allSolutions.length;
    game.scene.start('CrosswordScene', { 
        solutions: allSolutions, 
        index: currentSolutionIndex 
    });
}

function regenerateCrossword() {
    if (currentWords.length) {
        generateCrossword();
    }
}

// Set up event listeners
function setupEventListeners() {
    // Press Enter in input to generate
    document.getElementById('word-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            generateCrossword();
        }
    });
    
    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') showNextSolution();
        else if (e.key === 'ArrowLeft') showPreviousSolution();
        else if (e.key.toLowerCase() === 'r') regenerateCrossword();
        else if (e.key === 'Backspace' || e.key === 'Delete') {
            document.getElementById('word-input').value = '';
            document.getElementById('word-input').focus();
        }
    });
    
    // Start with example words
    document.getElementById('word-input').value = "seat,east,eat,set,tea";
    generateCrossword();
}

// Handle window resize
function handleResize() {
    game.scale.resize(window.innerWidth, window.innerHeight);
    game.scene.getScene('CrosswordScene').scene.restart();
}

// Initialize application
window.addEventListener('load', () => {
    initGame();
    setupEventListeners();
    
    window.addEventListener('resize', handleResize);
});