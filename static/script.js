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
            } else {
                // Mark available path cells (blue)
                cell.classList.add('available-path');
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

            // Highlight shortest path cells (yellow)
            if (highlightedPath.some(([x, y]) => x === i && y === j)) {
                if (!(i === 0 && j === 1) && !(i === 8 && j === 7)) {
                    cell.classList.add('shortest-path');  // Yellow path
                }
            }

            mazeDiv.appendChild(cell);  // Add the cell to the maze container
        }
    }
}


// Function to animate the path
function animatePath(path) {
    highlightedPath = []; // Clear the highlighted path at the start
    let index = 0;

    function step() {
        if (index < path.length) {
            const [x, y] = path[index];
            highlightedPath.push([x, y]); // Add the current step to the highlighted path
            drawMaze();
            index++;
            setTimeout(step, 300); // Continue to the next step after a delay
        }
    }

    step(); // Start the animation
}

function updatePathsInfo(paths) {
    const pathsInfoDiv = document.getElementById('paths-info');
    pathsInfoDiv.innerHTML = '';

    if (!paths || paths.length === 0) {
        pathsInfoDiv.innerHTML = "No paths found!";
        return;
    }

    // Sort paths by real step count (excluding start and end)
    paths.sort((a, b) => 
        countActualSteps(a) - countActualSteps(b)
    );

    const shortestSteps = countActualSteps(paths[0]);
    let shortestPathIndex = 0;

    let output = `Total possible paths: ${paths.length}\n\n`;

    paths.forEach((path, index) => {
        const stepCount = countActualSteps(path);
        output += `Path ${index + 1}: ${stepCount} steps\n`;
        if (stepCount === shortestSteps && shortestPathIndex === 0) {
            shortestPathIndex = index + 1;
        }
    });

    output += `\nShortest path: Path ${shortestPathIndex}\n\n`;
    output += `The shortest path is highlighted.`;

    pathsInfoDiv.innerHTML = `<pre>${output}</pre>`;
}

// ✅ Helper function to count steps excluding start (0,1) and end (8,7)
function countActualSteps(path) {
    return path.filter(([a, b]) => !(a === 0 && b === 1) && !(a === 8 && b === 7)).length;
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
            updatePathsInfo(data.paths); // Update path counts info first

            if (data.paths && data.paths.length > 0) {
                // ✅ Always find and animate the real shortest path
                const sortedPaths = data.paths.slice().sort((a, b) => countActualSteps(a) - countActualSteps(b));
                const shortestPath = sortedPaths[0]; 
                
                highlightedPath = []; // Clear any existing highlighted path
                animatePath(shortestPath); // Animate the sorted shortest path
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
    document.getElementById('paths-info').innerHTML = '';
}

// ✅ Function to generate maze and THEN call findPaths
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

// ✅ Wait for maze to load before finding paths
window.onload = function() {
    generateMaze().then(() => {
        findPaths(); // Call only after maze is generated
    });
};
