const CELL_SIZE = 50;

class CrosswordScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CrosswordScene' });
    }

    init(data) {
        this.solutions = data.solutions || [];
        this.index = data.index || 0;
    }

    create() {
        // Clear previous content
        this.children.removeAll();
        
        // Set background
        this.cameras.main.setBackgroundColor('#1a1a1a');
        
        // Handle no solutions
        if (!this.solutions.length || !this.solutions[this.index]) {
            const text = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                'No crossword solutions found\n\nEnter words above to generate',
                { 
                    fontSize: '28px', 
                    color: '#FFFFFF',
                    align: 'center',
                    lineSpacing: 20
                }
            ).setOrigin(0.5);
            
            return;
        }
        
        // Get current solution
        const solution = this.solutions[this.index];
        const { minI, minJ, maxI, maxJ } = solution.boundingBox;
        const width = maxJ - minJ + 1;
        const height = maxI - minI + 1;
        
        // Calculate grid position
        const gridWidth = width * CELL_SIZE;
        const gridHeight = height * CELL_SIZE;
        const offsetX = (this.cameras.main.width - gridWidth) / 2;
        const offsetY = (this.cameras.main.height - gridHeight) / 2;
        
        // Draw grid background
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            gridWidth + 20,
            gridHeight + 20,
            0x2c3e50
        ).setAlpha(0.3);
        
        // Draw grid cells
        for (let i = minI; i <= maxI; i++) {
            for (let j = minJ; j <= maxJ; j++) {
                const x = offsetX + (j - minJ) * CELL_SIZE + CELL_SIZE / 2;
                const y = offsetY + (i - minI) * CELL_SIZE + CELL_SIZE / 2;
                const letter = solution.grid[i][j];
                
                // Draw cell
                if (letter !== '-') {
                    // Cell background
                    this.add.rectangle(x, y, CELL_SIZE - 4, CELL_SIZE - 4, 0x8E2DE2);
                    
                    // Letter
                    this.add.text(x, y, letter.toUpperCase(), {
                        fontSize: '24px',
                        color: '#FFFFFF',
                        fontWeight: 'bold'
                    }).setOrigin(0.5);
                    
                    // Word number (if start of word)
                    if (solution.placements.some(p => 
                        p.row === i && p.col === j && p.orientation)) {
                        this.add.text(
                            x - CELL_SIZE/2 + 8, 
                            y - CELL_SIZE/2 + 8, 
                            (solution.placements.findIndex(p => 
                                p.row === i && p.col === j) + 1).toString(),
                            { fontSize: '16px', color: '#fff', fontWeight: 'bold' }
                        );
                    }
                } else {
                    // Empty cell
                    this.add.rectangle(x, y, CELL_SIZE - 4, CELL_SIZE - 4, 0x34495e).setAlpha(0.5);
                }
            }
        }
        
        // Draw solution counter at the bottom center
        this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.height - 30, 
            `Solution ${this.index + 1} of ${this.solutions.length}`,
            { 
                fontSize: '18px', 
                color: '#fff',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5, 0.5);
    }
}