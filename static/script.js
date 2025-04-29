const mazeDiv = document.getElementById('maze');
let mazeMatrix = []; // Will be populated by generateMaze()
let highlightedPath = [];

// Function to draw the maze
function drawMaze() {
    mazeDiv.innerHTML = '';  // Clear the maze container
    for (let i = 0; i < mazeMatrix.length; i++) {
        for (let j = 0; j < mazeMatrix[i].length; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            if (mazeMatrix[i][j] === 0) {
                cell.classList.add('wall');  // Wall cells
            }

            // Mark start point with an image
            if (i === 0 && j === 1) {
                cell.classList.add('start');
                const boyImage = document.createElement('img');
                boyImage.src = 'static/boy.jpeg';
                boyImage.classList.add('boy-image');
                cell.appendChild(boyImage);
            }

            // Mark end point with an image
            if (i === 8 && j === 7) {
                cell.classList.add('end');
                const girlImage = document.createElement('img');
                girlImage.src = 'static/girl.jpeg';
                girlImage.classList.add('girl-image');
                cell.appendChild(girlImage);
            }

            // Highlight path cells
            if (highlightedPath.some(([x, y]) => x === i && y === j)) {
                if (mazeMatrix[i][j] === 1 && !(i === 0 && j === 1) && !(i === 8 && j === 7)) {
                    cell.classList.add('path');  // Add path highlight class
                }
            }

            mazeDiv.appendChild(cell);  // Add the cell to the maze container
        }
    }
}

// Function to animate the path
// ... (rest of your code remains unchanged)

function animatePath(path) {
    highlightedPath = [];
    let index = 0;

    function step() {
        if (index < path.length) {
            const [x, y] = path[index];
            highlightedPath.push([x, y]);
            drawMaze();

            // Exclude start and end from step count
            const stepsTaken = highlightedPath.filter(([a, b]) => !(a === 0 && b === 1) && !(a === 8 && b === 7)).length;
            updateStepsMessage(stepsTaken);

            index++;
            setTimeout(step, 300);
        }
    }

    step();
}


function updateStepsMessage(stepCount) {
    document.getElementById('steps-message').textContent = `Steps taken: ${stepCount}`;
}

function updatePathsInfo(paths) {
    const pathsInfoDiv = document.getElementById('paths-info');
    pathsInfoDiv.innerHTML = '';

    if (!paths || paths.length === 0) {
        pathsInfoDiv.innerHTML = "No paths found!";
        return;
    }

    // Sort paths by length
    paths.sort((a, b) => a.length - b.length);
    
    const shortestSteps = paths[0].length;
    let shortestPathIndex = 0;

    // Build the text content
    let output = `Total possible paths: ${paths.length}\n\n`;

    paths.forEach((path, index) => {
        output += `Path ${index + 1}: ${path.length} steps\n`;
        if (path.length === shortestSteps && shortestPathIndex === 0) {
            shortestPathIndex = index + 1; // Store 1-based index
        }
    });

    output += `\nShortest path: Path ${shortestPathIndex}\n\n`;
    output += `The shortest path is highlighted.`;

    // Display with preserved formatting
    pathsInfoDiv.innerHTML = `<pre>${output}</pre>`;
}

// Function to find paths
function findPaths() {
    fetch('/get-paths', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            updatePathsInfo(data.paths); // Just update info, don't draw all paths

            if (data.paths && data.paths.length > 0) {
                const shortestPath = data.paths[0]; // The shortest path
                highlightedPath = []; // Clear any existing highlighted path
                animatePath(shortestPath); // Animate the shortest path properly
            }
        }
    });
}

function drawPaths(paths) {
    paths.forEach((path, index) => {
        path.forEach(([x, y]) => {
            const index = x * mazeMatrix[0].length + y;
            mazeDiv.children[index].classList.add(`path-${index}`); // Differentiate paths visually
        });
    });
}

// Function to reset the maze
function resetMaze() {
    highlightedPath = [];
    drawMaze();
    document.getElementById('steps-message').textContent = 'Output';
    document.getElementById('paths-info').innerHTML = '';
}

// ✅ Updated: Function to generate maze and THEN call findPaths
function generateMaze() {
    return fetch('/generate-maze', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        console.log("Maze received:", data);  // Add this line
        mazeMatrix = data.maze;
        resetMaze();
    });
}

// ✅ Wait for maze to load before finding paths
window.onload = function() {
    generateMaze().then(() => {
        findPaths(); // Call only after maze is generated
    });
};
