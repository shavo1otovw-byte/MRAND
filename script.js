class MazeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 30;
        this.currentLevel = 1;
        this.totalLevels = 10;
        this.maze = null;
        this.playerPos = { x: 1, y: 1 };
        this.exitPos = null;
        this.coins = [];
        this.coinsCollected = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isGameActive = true;
        this.gameWidth = 0;
        this.gameHeight = 0;
        
        this.init();
        this.setupEventListeners();
    }

    // Профессиональные уровни (10 штук)
    getMazeLevel(level) {
        const levels = {
            1: {
                width: 15,
                height: 15,
                walls: [
                    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
                    [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
                    [1,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
                    [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
                    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
                    [1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
                    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
                    [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1],
                    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
                    [1,0,1,0,1,1,1,1,1,0,1,0,1,0,1],
                    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
                    [1,1,1,0,1,0,1,1,1,1,1,0,1,1,1],
                    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
                ],
                coins: [[3,3], [5,5], [7,7], [9,3], [11,11], [3,11], [11,3]],
                exit: [13, 13]
            },
            2: {
                width: 17,
                height: 17,
                walls: Array(17).fill().map(() => Array(17).fill(0)),
                coins: [],
                exit: [15, 15]
            },
            3: {
                width: 19,
                height: 19,
                walls: Array(19).fill().map(() => Array(19).fill(0)),
                coins: [],
                exit: [17, 17]
            },
            4: {
                width: 15,
                height: 15,
                walls: Array(15).fill().map(() => Array(15).fill(0)),
                coins: [],
                exit: [13, 13]
            },
            5: {
                width: 21,
                height: 21,
                walls: Array(21).fill().map(() => Array(21).fill(0)),
                coins: [],
                exit: [19, 19]
            }
        };

        // Генерация сложных лабиринтов для уровней 2-5
        if (level === 2) return this.generateMazePattern(17, 'spiral');
        if (level === 3) return this.generateMazePattern(19, 'hard');
        if (level === 4) return this.generateMazePattern(15, 'expert');
        if (level === 5) return this.generateMazePattern(21, 'master');
        if (level >= 6) return this.generateMazePattern(19 + (level-6)*2, 'random');
        
        return levels[level];
    }

    generateMazePattern(size, difficulty) {
        const maze = {
            width: size,
            height: size,
            walls: Array(size).fill().map(() => Array(size).fill(1)),
            coins: [],
            exit: [size-2, size-2]
        };

        // Алгоритм генерации лабиринта (DFS)
        const stack = [];
        const start = [1, 1];
        maze.walls[start[0]][start[1]] = 0;
        stack.push(start);

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current, maze.walls, size);
            
            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                const wallX = (current[0] + next[0]) / 2;
                const wallY = (current[1] + next[1]) / 2;
                maze.walls[wallX][wallY] = 0;
                maze.walls[next[0]][next[1]] = 0;
                stack.push(next);
            } else {
                stack.pop();
            }
        }

        // Добавляем дополнительные проходы для сложности
        const extraPassages = difficulty === 'easy' ? 5 : difficulty === 'hard' ? 15 : 25;
        for (let i = 0; i < extraPassages; i++) {
            const x = Math.floor(Math.random() * (size-2)) + 1;
            const y = Math.floor(Math.random() * (size-2)) + 1;
            if (maze.walls[x][y] === 1 && !(x === 1 && y === 1) && !(x === size-2 && y === size-2)) {
                maze.walls[x][y] = 0;
            }
        }

        // Добавляем монеты
        const coinCount = Math.min(size, 8) + (difficulty === 'hard' ? 3 : 0);
        for (let i = 0; i < coinCount; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (size-2)) + 1;
                y = Math.floor(Math.random() * (size-2)) + 1;
            } while (maze.walls[x][y] === 1 || (x === 1 && y === 1) || 
                     (x === size-2 && y === size-2) || 
                     maze.coins.some(coin => coin[0] === x && coin[1] === y));
            maze.coins.push([x, y]);
        }

        return maze;
    }

    getUnvisitedNeighbors(pos, walls, size) {
        const neighbors = [];
        const dirs = [[-2,0], [2,0], [0,-2], [0,2]];
        
        for (const [dx, dy] of dirs) {
            const nx = pos[0] + dx;
            const ny = pos[1] + dy;
            if (nx > 0 && nx < size-1 && ny > 0 && ny < size-1 && walls[nx][ny] === 1) {
                neighbors.push([nx, ny]);
            }
        }
        return neighbors;
    }

    loadLevel(level) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        const levelData = this.getMazeLevel(level);
        this.maze = levelData.walls;
        this.gameWidth = levelData.width;
        this.gameHeight = levelData.height;
        this.exitPos = levelData.exit;
        this.coins = [...levelData.coins];
        this.coinsCollected = 0;
        this.playerPos = { x: 1, y: 1 };
        this.moves = 0;
        this.timer = 0;
        this.isGameActive = true;
        
        this.updateUI();
        this.startTimer();
        this.draw();
        
        document.getElementById('statusMessage').innerHTML = '🏃‍♂️ Собери все монеты и найди выход!';
        document.getElementById('statusMessage').style.background = '#f0f0f0';
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.isGameActive) {
                this.timer++;
                this.updateTimerDisplay();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        document.getElementById('timerDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateUI() {
        document.getElementById('levelNumber').textContent = this.currentLevel;
        document.getElementById('movesCount').textContent = this.moves;
        this.updateTimerDisplay();
        
        document.getElementById('prevBtn').disabled = this.currentLevel === 1;
        document.getElementById('nextBtn').disabled = this.currentLevel === this.totalLevels;
    }

    movePlayer(dx, dy) {
        if (!this.isGameActive) return;
        
        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;
        
        if (newX >= 0 && newX < this.gameHeight && newY >= 0 && newY < this.gameWidth &&
            this.maze[newX][newY] === 0) {
            
            this.playerPos.x = newX;
            this.playerPos.y = newY;
            this.moves++;
            document.getElementById('movesCount').textContent = this.moves;
            
            // Проверка сбора монеты
            const coinIndex = this.coins.findIndex(coin => coin[0] === newX && coin[1] === newY);
            if (coinIndex !== -1) {
                this.coins.splice(coinIndex, 1);
                this.coinsCollected++;
                document.getElementById('statusMessage').innerHTML = '💰 Монета собрана! +1';
                document.getElementById('statusMessage').style.background = '#d4edda';
                setTimeout(() => {
                    document.getElementById('statusMessage').style.background = '#f0f0f0';
                    document.getElementById('statusMessage').innerHTML = '✨ Продолжай движение!';
                }, 1000);
            }
            
            // Проверка выхода
            if (newX === this.exitPos[0] && newY === this.exitPos[1] && this.coins.length === 0) {
                this.victory();
            } else if (newX === this.exitPos[0] && newY === this.exitPos[1] && this.coins.length > 0) {
                document.getElementById('statusMessage').innerHTML = '⚠️ Сначала собери все монеты!';
                document.getElementById('statusMessage').style.background = '#fff3cd';
                setTimeout(() => {
                    document.getElementById('statusMessage').style.background = '#f0f0f0';
                    document.getElementById('statusMessage').innerHTML = '✨ Собери все монеты!';
                }, 1000);
            }
            
            this.draw();
        }
    }

    victory() {
        this.isGameActive = false;
        clearInterval(this.timerInterval);
        
        document.getElementById('completedLevel').textContent = this.currentLevel;
        document.getElementById('finalMoves').textContent = this.moves;
        document.getElementById('finalTime').textContent = document.getElementById('timerDisplay').textContent;
        document.getElementById('victoryModal').style.display = 'block';
        
        // Сохраняем прогресс
        if (this.currentLevel === this.totalLevels) {
            document.getElementById('nextLevelBtn').textContent = '🏆 Завершить игру';
        }
    }

    nextLevel() {
        if (this.currentLevel < this.totalLevels) {
            this.currentLevel++;
            this.loadLevel(this.currentLevel);
            document.getElementById('victoryModal').style.display = 'none';
        } else {
            alert('🎉 Поздравляем! Ты прошёл ВСЮ игру! 🎉\nНачни заново с первого уровня.');
            this.currentLevel = 1;
            this.loadLevel(1);
            document.getElementById('victoryModal').style.display = 'none';
        }
    }

    restartLevel() {
        this.loadLevel(this.currentLevel);
        document.getElementById('victoryModal').style.display = 'none';
    }

    showHint() {
        if (!this.isGameActive) return;
        
        const remainingCoins = this.coins.length;
        const distToExit = Math.abs(this.playerPos.x - this.exitPos[0]) + 
                          Math.abs(this.playerPos.y - this.exitPos[1]);
        
        let hint = '';
        if (remainingCoins > 0) {
            hint = `💡 Осталось собрать ${remainingCoins} монет${this.getCoinEnding(remainingCoins)}. `;
            if (distToExit < 10) {
                hint += `Выход уже близко! 🚪`;
            } else {
                hint += `Продолжай исследовать лабиринт! 🗺️`;
            }
        } else {
            hint = `💡 Все монеты собраны! Теперь найди выход! 🚪`;
        }
        
        document.getElementById('statusMessage').innerHTML = hint;
        document.getElementById('statusMessage').style.background = '#e7f3ff';
        setTimeout(() => {
            document.getElementById('statusMessage').style.background = '#f0f0f0';
        }, 3000);
    }

    getCoinEnding(count) {
        if (count % 10 === 1 && count % 100 !== 11) return 'у';
        if ([2,3,4].includes(count % 10) && ![12,13,14].includes(count % 100)) return 'ы';
        return '';
    }

    draw() {
        this.canvas.width = this.gameWidth * this.cellSize;
        this.canvas.height = this.gameHeight * this.cellSize;
        
        for (let row = 0; row < this.gameHeight; row++) {
            for (let col = 0; col < this.gameWidth; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                
                if (this.maze[row][col] === 1) {
                    // Стена с градиентом
                    const gradient = this.ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
                    gradient.addColorStop(0, '#2c3e50');
                    gradient.addColorStop(1, '#34495e');
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(x, y, this.cellSize - 1, this.cellSize - 1);
                    
                    // Текстура стены
                    this.ctx.strokeStyle = '#1a2632';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x, y, this.cellSize - 1, this.cellSize - 1);
                } else {
                    // Пол с градиентом
                    const gradient = this.ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
                    gradient.addColorStop(0, '#ecf0f1');
                    gradient.addColorStop(1, '#bdc3c7');
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(x, y, this.cellSize - 1, this.cellSize - 1);
                }
                
                // Выход
                if (row === this.exitPos[0] && col === this.exitPos[1]) {
                    this.ctx.fillStyle = '#f39c12';
                    this.ctx.beginPath();
                    this.ctx.arc(x + this.cellSize/2, y + this.cellSize/2, this.cellSize/3, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#e67e22';
                    this.ctx.font = `${this.cellSize/2}px Arial`;
                    this.ctx.fillText('🚪', x + this.cellSize/4, y + this.cellSize/1.5);
                }
                
                // Монеты
                if (this.coins.some(coin => coin[0] === row && coin[1] === col)) {
                    this.ctx.fillStyle = '#f1c40f';
                    this.ctx.beginPath();
                    this.ctx.arc(x + this.cellSize/2, y + this.cellSize/2, this.cellSize/4, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#f39c12';
                    this.ctx.font = `${this.cellSize/2.5}px Arial`;
                    this.ctx.fillText('💎', x + this.cellSize/3.5, y + this.cellSize/1.5);
                }
            }
        }
        
        // Игрок с анимацией
        const px = this.playerPos.y * this.cellSize;
        const py = this.playerPos.x * this.cellSize;
        
        // Тень игрока
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
        
        // Градиент для игрока
        const gradient = this.ctx.createLinearGradient(px, py, px + this.cellSize, py + this.cellSize);
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(1, '#2980b9');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(px + this.cellSize/2, py + this.cellSize/2, this.cellSize/2.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${this.cellSize/1.8}px Arial`;
        this.ctx.fillText('😀', px + this.cellSize/3.5, py + this.cellSize/1.5);
        
        this.ctx.shadowBlur = 0;
    }

    setupEventListeners() {
        // Управление с клавиатуры
        window.addEventListener('keydown', (e) => {
            const key = e.key;
            const moves = {
                'ArrowUp': [-1, 0], 'ArrowDown': [1, 0],
                'ArrowLeft': [0, -1], 'ArrowRight': [0, 1],
                'w': [-1, 0], 's': [1, 0], 'a': [0, -1], 'd': [0, 1]
            };
            
            if (moves[key]) {
                e.preventDefault();
                this.movePlayer(moves[key][0], moves[key][1]);
            }
        });
        
        // Кнопки управления
        document.getElementById('resetBtn').addEventListener('click', () => this.restartLevel());
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.currentLevel > 1) {
                this.currentLevel--;
                this.loadLevel(this.currentLevel);
            }
        });
        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.currentLevel < this.totalLevels) {
                this.currentLevel++;
                this.loadLevel(this.currentLevel);
            }
        });
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        
        // Модальное окно
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('restartLevelBtn').addEventListener('click', () => this.restartLevel());
        
        // Закрытие модального окна по клику вне его
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('victoryModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    init() {
        this.loadLevel(1);
    }
}

// Запуск игры
const game = new MazeGame();