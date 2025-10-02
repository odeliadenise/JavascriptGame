class ColorMemoryGame {
    constructor() {
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.livesElement = document.getElementById('lives');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.finalScoreElement = document.getElementById('finalScore');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        
        this.difficulty = 'easy';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.hints = 3;
        this.gameActive = false;
        this.sequence = [];
        this.playerSequence = [];
        this.currentStep = 0;
        this.showingSequence = false;
        
        this.colors = [
            { name: 'Red', class: 'red', gradient: 'linear-gradient(45deg, #f56565, #e53e3e)' },
            { name: 'Blue', class: 'blue', gradient: 'linear-gradient(45deg, #4299e1, #3182ce)' },
            { name: 'Green', class: 'green', gradient: 'linear-gradient(45deg, #48bb78, #38a169)' },
            { name: 'Yellow', class: 'yellow', gradient: 'linear-gradient(45deg, #ed8936, #dd6b20)' },
            { name: 'Purple', class: 'purple', gradient: 'linear-gradient(45deg, #9f7aea, #805ad5)' },
            { name: 'Pink', class: 'pink', gradient: 'linear-gradient(45deg, #ed64a6, #d53f8c)' },
            { name: 'Teal', class: 'teal', gradient: 'linear-gradient(45deg, #38b2ac, #319795)' },
            { name: 'Orange', class: 'orange', gradient: 'linear-gradient(45deg, #f6ad55, #ed8936)' },
            { name: 'Cyan', class: 'cyan', gradient: 'linear-gradient(45deg, #06b6d4, #0891b2)' },
            { name: 'Lime', class: 'lime', gradient: 'linear-gradient(45deg, #84cc16, #65a30d)' },
            { name: 'Indigo', class: 'indigo', gradient: 'linear-gradient(45deg, #6366f1, #4f46e5)' },
            { name: 'Amber', class: 'amber', gradient: 'linear-gradient(45deg, #f59e0b, #d97706)' },
            { name: 'Rose', class: 'rose', gradient: 'linear-gradient(45deg, #fb7185, #f43f5e)' },
            { name: 'Slate', class: 'slate', gradient: 'linear-gradient(45deg, #94a3b8, #64748b)' },
            { name: 'Emerald', class: 'emerald', gradient: 'linear-gradient(45deg, #10b981, #059669)' },
            { name: 'Violet', class: 'violet', gradient: 'linear-gradient(45deg, #8b5cf6, #7c3aed)' }
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.setupEventListeners();
        this.updateDisplay();
        this.generateBoard();
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.hintBtn.addEventListener('click', () => this.useHint());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                this.resetGame();
            });
        });
        
        // Close modal when clicking outside
        this.gameOverModal.addEventListener('click', (e) => {
            if (e.target === this.gameOverModal) {
                this.gameOverModal.style.display = 'none';
            }
        });
    }
    
    generateBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `game-board ${this.difficulty}`;
        
        const boardSize = this.getBoardSize();
        const numTiles = boardSize * boardSize;
        const colorsToUse = this.colors.slice(0, numTiles);
        
        colorsToUse.forEach((color, index) => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.index = index;
            tile.style.background = color.gradient;
            tile.textContent = color.name.charAt(0);
            tile.title = color.name;
            
            tile.addEventListener('click', () => this.handleTileClick(index));
            
            this.gameBoard.appendChild(tile);
        });
    }
    
    getBoardSize() {
        switch (this.difficulty) {
            case 'easy': return 2;
            case 'medium': return 3;
            case 'hard': return 4;
            default: return 2;
        }
    }
    
    startGame() {
        if (this.gameActive) return;
        
        this.gameActive = true;
        this.startBtn.disabled = true;
        this.hintBtn.disabled = false;
        this.hintBtn.textContent = `Hint (${this.hints})`;
        
        this.generateSequence();
        this.showSequence();
    }
    
    generateSequence() {
        const boardSize = this.getBoardSize();
        const numTiles = boardSize * boardSize;
        const sequenceLength = Math.min(3 + this.level, numTiles);
        
        this.sequence = [];
        for (let i = 0; i < sequenceLength; i++) {
            this.sequence.push(Math.floor(Math.random() * numTiles));
        }
        
        this.playerSequence = [];
        this.currentStep = 0;
    }
    
    async showSequence() {
        this.showingSequence = true;
        const tiles = this.gameBoard.querySelectorAll('.tile');
        
        // Disable all tiles during sequence display
        tiles.forEach(tile => tile.classList.add('disabled'));
        
        for (let i = 0; i < this.sequence.length; i++) {
            const tileIndex = this.sequence[i];
            const tile = tiles[tileIndex];
            if (!tile) {
                // If the tile doesn't exist (safety), regenerate board and abort this display
                this.generateBoard();
                this.showingSequence = false;
                tiles.forEach(t => t.classList.remove('disabled'));
                return;
            }
            
            // Highlight the tile
            tile.classList.add('active');
            await this.delay(600);
            
            // Remove highlight
            tile.classList.remove('active');
            await this.delay(200);
        }
        
        // Re-enable tiles for player input
        tiles.forEach(tile => tile.classList.remove('disabled'));
        this.showingSequence = false;
    }
    
    handleTileClick(tileIndex) {
        if (!this.gameActive || this.showingSequence) return;
        
        const tiles = this.gameBoard.querySelectorAll('.tile');
        const tile = tiles[tileIndex];
        
        // Add visual feedback
        tile.classList.add('active');
        setTimeout(() => tile.classList.remove('active'), 200);
        
        this.playerSequence.push(tileIndex);
        
        // Check if the move is correct
        if (this.playerSequence[this.currentStep] === this.sequence[this.currentStep]) {
            tile.classList.add('correct');
            setTimeout(() => tile.classList.remove('correct'), 300);
            
            this.currentStep++;
            
            // Check if sequence is complete
            if (this.currentStep === this.sequence.length) {
                this.levelComplete();
            }
        } else {
            // Wrong move
            tile.classList.add('incorrect');
            setTimeout(() => tile.classList.remove('incorrect'), 300);
            this.wrongMove();
        }
    }
    
    levelComplete() {
        this.score += this.level * 10;
        this.level++;
        this.updateDisplay();
        
        // Show success message
        this.showMessage('Level Complete! 🎉', 'success');
        
        // Generate next sequence after a delay
        setTimeout(() => {
            this.generateSequence();
            this.showSequence();
        }, 1500);
    }
    
    wrongMove() {
        this.lives--;
        this.updateDisplay();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.showMessage(`Wrong! Lives remaining: ${this.lives}`, 'error');
            // Reset current attempt
            this.playerSequence = [];
            this.currentStep = 0;
            
            // Show sequence again after a delay
            setTimeout(() => {
                this.showSequence();
            }, 1500);
        }
    }
    
    useHint() {
        if (this.hints <= 0 || !this.gameActive || this.showingSequence) return;
        
        this.hints--;
        this.hintBtn.textContent = `Hint (${this.hints})`;
        
        if (this.hints <= 0) {
            this.hintBtn.disabled = true;
        }
        
        // Show the next correct tile
        const nextCorrectIndex = this.sequence[this.currentStep];
        const tiles = this.gameBoard.querySelectorAll('.tile');
        const correctTile = tiles[nextCorrectIndex];
        
        correctTile.classList.add('active');
        setTimeout(() => correctTile.classList.remove('active'), 1000);
        
        this.showMessage('Hint used! 💡', 'info');
    }
    
    gameOver() {
        this.gameActive = false;
        this.startBtn.disabled = false;
        this.hintBtn.disabled = true;
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverModal.style.display = 'block';
        
        // Update game over message based on performance
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        
        if (this.score >= 100) {
            title.textContent = 'Excellent! 🌟';
            message.innerHTML = `Amazing focus and memory! Your final score: <span id="finalScore">${this.score}</span>`;
        } else if (this.score >= 50) {
            title.textContent = 'Great Job! 👏';
            message.innerHTML = `Well done! Your final score: <span id="finalScore">${this.score}</span>`;
        } else {
            title.textContent = 'Good Try! 💪';
            message.innerHTML = `Keep practicing! Your final score: <span id="finalScore">${this.score}</span>`;
        }
    }
    
    resetGame() {
        this.gameActive = false;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.hints = 3;
        this.sequence = [];
        this.playerSequence = [];
        this.currentStep = 0;
        this.showingSequence = false;
        
        this.startBtn.disabled = false;
        this.hintBtn.disabled = false;
        this.hintBtn.textContent = `Hint (${this.hints})`;
        
        this.gameOverModal.style.display = 'none';
        this.updateDisplay();
        this.generateBoard();
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.livesElement.textContent = this.lives;
    }
    
    showMessage(text, type) {
        // Create temporary message element
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 1.1rem;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            animation: messageSlideIn 0.3s ease;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'messageSlideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(message), 300);
        }, 1500);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes messageSlideIn {
        from {
            opacity: 0;
            transform: translate(-50%, -60%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }
    
    @keyframes messageSlideOut {
        from {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -40%);
        }
    }
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ColorMemoryGame();
});
