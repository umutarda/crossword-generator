class CrosswordGenerator {
    constructor(words) {
        this.words = words;
        this.maxLength = Math.max(...words.map(w => w.length));
        this.gridSize = Math.max(15, this.maxLength * 3);
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill('-'));
        this.solutions = [];
        this.placements = [];
        this.seen = new Set();
    }

    getBoundingBox() {
        let minI = this.gridSize, minJ = this.gridSize, maxI = -1, maxJ = -1;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== '-') {
                    minI = Math.min(minI, i);
                    minJ = Math.min(minJ, j);
                    maxI = Math.max(maxI, i);
                    maxJ = Math.max(maxJ, j);
                }
            }
        }
        return { minI, minJ, maxI, maxJ };
    }

    getCanonical() {
        const { minI, minJ, maxI, maxJ } = this.getBoundingBox();
        if (minI > maxI || minJ > maxJ) return "empty";
        
        let s = '';
        for (let i = minI; i <= maxI; i++) {
            for (let j = minJ; j <= maxJ; j++) {
                s += this.grid[i][j] === '-' ? '.' : this.grid[i][j];
            }
            s += '|';
        }
        return s;
    }

    verify() {
        const found = new Set();
        const grid = this.grid;
        const size = this.gridSize;
        
        // Check horizontal words
        for (let i = 0; i < size; i++) {
            let word = '';
            for (let j = 0; j < size; j++) {
                if (grid[i][j] !== '-') {
                    word += grid[i][j];
                } else if (word.length > 0) {
                    if (word.length > 1) found.add(word);
                    word = '';
                }
            }
            if (word.length > 1) found.add(word);
        }
        
        // Check vertical words
        for (let j = 0; j < size; j++) {
            let word = '';
            for (let i = 0; i < size; i++) {
                if (grid[i][j] !== '-') {
                    word += grid[i][j];
                } else if (word.length > 0) {
                    if (word.length > 1) found.add(word);
                    word = '';
                }
            }
            if (word.length > 1) found.add(word);
        }
        
        // Verify all found words are in the word list
        for (const word of found) {
            if (!this.words.includes(word)) {
                return false;
            }
        }
        return true;
    }

    canPlace(word, row, col, orientation, isFirst) {
        // Boundary checks
        if (orientation === 'across') {
            if (col + word.length > this.gridSize) return false;
        } else {
            if (row + word.length > this.gridSize) return false;
        }
        
        let hasConnection = false;
        let placedOnEmpty = false;
        
        for (let k = 0; k < word.length; k++) {
            const r = orientation === 'across' ? row : row + k;
            const c = orientation === 'across' ? col + k : col;
            
            // Out of bounds check
            if (r < 0 || r >= this.gridSize || c < 0 || c >= this.gridSize) 
                return false;
                
            const current = this.grid[r][c];
            const letter = word[k];
            
            // Letter conflict check
            if (current !== '-' && current !== letter) 
                return false;
            
            // Check if we're placing on an existing letter (connection)
            if (current !== '-') {
                hasConnection = true;
            } else {
                placedOnEmpty = true;
                
                // Check adjacent cells for conflicts
                if (orientation === 'across') {
                    // Check above and below
                    if (r > 0 && this.grid[r-1][c] !== '-') return false;
                    if (r < this.gridSize-1 && this.grid[r+1][c] !== '-') return false;
                } else {
                    // Check left and right
                    if (c > 0 && this.grid[r][c-1] !== '-') return false;
                    if (c < this.gridSize-1 && this.grid[r][c+1] !== '-') return false;
                }
            }
        }
        
        // Check word boundaries
        if (orientation === 'across') {
            if (col > 0 && this.grid[row][col-1] !== '-') return false;
            if (col + word.length < this.gridSize && this.grid[row][col+word.length] !== '-') return false;
        } else {
            if (row > 0 && this.grid[row-1][col] !== '-') return false;
            if (row + word.length < this.gridSize && this.grid[row+word.length][col] !== '-') return false;
        }
        
        // First word must be placed on empty cells
        if (isFirst && !placedOnEmpty) return false;
        
        // Subsequent words must connect to existing words
        return isFirst || hasConnection;
    }

    placeWord(word, row, col, orientation) {
        const backup = [];
        for (let k = 0; k < word.length; k++) {
            const r = orientation === 'across' ? row : row + k;
            const c = orientation === 'across' ? col + k : col;
            backup.push({ r, c, prev: this.grid[r][c] });
            this.grid[r][c] = word[k];
        }
        return backup;
    }

    restore(backup) {
        backup.forEach(({ r, c, prev }) => {
            this.grid[r][c] = prev;
        });
    }

    backtrack(index = 0) {
        if (index === this.words.length) {
            const key = this.getCanonical();
            if (!this.seen.has(key)) {
                this.seen.add(key);
                if (this.verify()) {
                    this.solutions.push({
                        grid: this.grid.map(row => [...row]),
                        placements: [...this.placements],
                        boundingBox: this.getBoundingBox()
                    });
                }
            }
            return;
        }
        
        const word = this.words[index];
        const isFirst = index === 0;
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                for (const ori of ['across', 'down']) {
                    if (this.canPlace(word, row, col, ori, isFirst)) {
                        const backup = this.placeWord(word, row, col, ori);
                        this.placements.push({ 
                            word, 
                            row, 
                            col, 
                            orientation: ori,
                            length: word.length
                        });
                        
                        this.backtrack(index + 1);
                        
                        this.placements.pop();
                        this.restore(backup);
                    }
                }
            }
        }
    }

    generate() {
        this.backtrack();
        return this.solutions;
    }
}