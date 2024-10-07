const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 40;
const ROWS = canvas.height / TILE_SIZE;
const COLS = canvas.width / TILE_SIZE;

let pacman = {
    x: TILE_SIZE + TILE_SIZE / 2,
    y: TILE_SIZE + TILE_SIZE / 2,
    size: 15,
    speed: 2,
    direction: 'right',
    mouthOpenAngle: 0.2,
    mouthOpening: true
};

let level = generateRandomLevel();

function generateRandomLevel() {
    let level = [];
    for (let row = 0; row < ROWS; row++) {
        level[row] = [];
        for (let col = 0; col < COLS; col++) {
            // Randbereiche frei lassen
            if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
                level[row][col] = 1; // Wand
            } else {
                level[row][col] = 1; // Initialisiere alles als Wand
            }
        }
    }

    // Depth-First Search (DFS) verwenden, um verbundene Gänge zu erstellen
    function carvePath(row, col) {
        level[row][col] = 0; // Setze aktuellen Punkt als frei
        const directions = [
            [0, 1],   // rechts
            [0, -1],  // links
            [1, 0],   // unten
            [-1, 0]   // oben
        ];
        // Reihenfolge der Richtungen mischen, um zufällige Gänge zu erzeugen
        directions.sort(() => Math.random() - 0.5);

        for (let [dRow, dCol] of directions) {
            const newRow = row + dRow * 2;
            const newCol = col + dCol * 2;

            if (newRow > 0 && newRow < ROWS - 1 && newCol > 0 && newCol < COLS - 1 && level[newRow][newCol] === 1) {
                level[newRow][newCol] = 0; // Zielkachel freimachen
                level[row + dRow][col + dCol] = 0; // Zwischenkachel freimachen
                carvePath(newRow, newCol);
            }
        }
    }

    // Startpunkt festlegen und Pfad schnitzen
    carvePath(1, 1);

    return level;
}

function drawLevel() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (level[row][col] === 1) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawPacman() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();

    // Berechnung des Mundwinkels basierend auf der Richtung
    let startAngle, endAngle;
    if (pacman.direction === 'right') {
        startAngle = pacman.mouthOpenAngle * Math.PI;
        endAngle = (2 - pacman.mouthOpenAngle) * Math.PI;
    } else if (pacman.direction === 'left') {
        startAngle = (1 + pacman.mouthOpenAngle) * Math.PI;
        endAngle = (1 - pacman.mouthOpenAngle) * Math.PI;
    } else if (pacman.direction === 'up') {
        startAngle = (1.5 + pacman.mouthOpenAngle) * Math.PI;
        endAngle = (1.5 - pacman.mouthOpenAngle) * Math.PI;
    } else if (pacman.direction === 'down') {
        startAngle = (0.5 + pacman.mouthOpenAngle) * Math.PI;
        endAngle = (0.5 - pacman.mouthOpenAngle) * Math.PI;
    }

    ctx.arc(pacman.x, pacman.y, pacman.size, startAngle, endAngle);
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fill();
}

function updatePacman() {
    let nextX = pacman.x;
    let nextY = pacman.y;

    if (pacman.direction === 'right') {
        nextX += pacman.speed;
    } else if (pacman.direction === 'left') {
        nextX -= pacman.speed;
    } else if (pacman.direction === 'up') {
        nextY -= pacman.speed;
    } else if (pacman.direction === 'down') {
        nextY += pacman.speed;
    }

    let col = Math.floor((nextX - pacman.size) / TILE_SIZE);
    let row = Math.floor((nextY - pacman.size) / TILE_SIZE);
    let colRight = Math.floor((nextX + pacman.size) / TILE_SIZE);
    let rowBottom = Math.floor((nextY + pacman.size) / TILE_SIZE);

    // Kollision mit der Wand verhindern, indem überprüft wird, ob Pacman anstößt
    if (level[row] && level[row][col] === 0 && level[row][colRight] === 0 && level[rowBottom] && level[rowBottom][col] === 0 && level[rowBottom][colRight] === 0) {
        pacman.x = nextX;
        pacman.y = nextY;
    }

    // Mundwinkel aktualisieren (auf- und zumachen)
    if (pacman.mouthOpening) {
        pacman.mouthOpenAngle += 0.05;
        if (pacman.mouthOpenAngle >= 0.3) {
            pacman.mouthOpening = false;
        }
    } else {
        pacman.mouthOpenAngle -= 0.05;
        if (pacman.mouthOpenAngle <= 0.05) {
            pacman.mouthOpening = true;
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLevel();
    updatePacman();
    drawPacman();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
        pacman.direction = 'right';
    } else if (event.key === 'ArrowLeft') {
        pacman.direction = 'left';
    } else if (event.key === 'ArrowUp') {
        pacman.direction = 'up';
    } else if (event.key === 'ArrowDown') {
        pacman.direction = 'down';
    }
});

gameLoop();