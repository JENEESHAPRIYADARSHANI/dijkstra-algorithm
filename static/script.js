// ===============================
// DOM References
// ===============================
const mazeContainer = document.getElementById('maze');
const pathsInfoContainer = document.getElementById('paths-info');

let mazeMatrix = [];
let highlightedPath = [];

// ===============================
// Display Maze
// ===============================
function displayMaze(maze) {
    mazeContainer.innerHTML = '';

    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {

            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', row);
            cell.setAttribute('data-col', col);

            // Wall
            if (maze[row][col] === 0) {
                cell.classList.add('wall');
            }

            // Start
            if (row === 0 && col === 1) {
                cell.classList.add('start');
            }

            // End
            if (row === 8 && col === 7) {
                cell.classList.add('end');
            }

            // Highlight path
            if (highlightedPath.some(([x, y]) => x === row && y === col)) {
                if (!(row === 0 && col === 1) && !(row === 8 && col === 7)) {
                    cell.classList.add('path');
                }
            }

            mazeContainer.appendChild(cell);
        }
    }
}

// ===============================
// Generate Maze
// ===============================
function generateMaze() {
    return fetch('/generate-maze', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        console.log("Maze received:", data);
        mazeMatrix = data.maze;
        resetMaze();
    });
}

// ===============================
// Find Shortest Path
// ===============================
function findPaths() {
    fetch('/get-path', {   // ✅ fixed route name
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            if (data.path && data.path.length > 0) {
                highlightedPath = [];
                animatePath(data.path);
            }
        }
    });
}

// ===============================
// Animate Path Step-by-Step
// ===============================
function animatePath(path) {
    highlightedPath = [];
    let index = 0;

    function step() {
        if (index < path.length) {
            const [x, y] = path[index];
            highlightedPath.push([x, y]);

            displayMaze(mazeMatrix);

            const stepsTaken = highlightedPath.filter(
                ([a, b]) => !(a === 0 && b === 1) && !(a === 8 && b === 7)
            ).length;

            updateStepsMessage(stepsTaken);

            index++;
            setTimeout(step, 300);
        }
    }

    step();
}

// ===============================
// Update Steps Counter
// ===============================
function updateStepsMessage(stepCount) {
    document.getElementById('steps-message').textContent =
        `Steps taken: ${stepCount}`;
}

// ===============================
// Reset Maze View
// ===============================
function resetMaze() {
    highlightedPath = [];
    displayMaze(mazeMatrix);
    document.getElementById('steps-message').textContent = 'Output';
    document.getElementById('paths-info').innerHTML = '';
}

// ===============================
// Auto Load Maze + Run Dijkstra
// ===============================
window.onload = function() {
    generateMaze().then(() => {
        findPaths();
    });
};
