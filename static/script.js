// Get references to the DOM elements
const mazeContainer = document.getElementById('maze');
const pathsInfoContainer = document.getElementById('paths-info');

let currentMaze = [];

function generateMaze() {
    fetch('/generate-maze', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        currentMaze = data.maze;
        displayMaze(currentMaze);
        pathsInfoContainer.textContent = '';
    });
}

function displayMaze(maze) {
    mazeContainer.innerHTML = '';

    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', row);
            cell.setAttribute('data-col', col);

            if (maze[row][col] === 1) {
                cell.classList.add('wall');
            } else if (row === 0 && col === 0) {
                cell.classList.add('start');
            } else if (row === 8 && col === 8) {
                cell.classList.add('end');
            }
            mazeContainer.appendChild(cell);
        }
    }
}

function pathsMatch(path1, path2) {
    if (path1.length !== path2.length) return false;
    return path1.every((coord, i) => coord[0] === path2[i][0] && coord[1] === path2[i][1]);
}

function findPaths() {
    fetch('/find-path', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maze: currentMaze })
    })
    .then(response => response.json())
    .then(data => {
        const allPaths = data.all_paths.map(item => item.path);
        const shortestPath = data.shortest_path;

        displayPathsInfo(data.all_paths, shortestPath);
        highlightShortestPath(shortestPath);
    });
}

function displayPathsInfo(allPathsRaw, shortestPath) {
    if (!allPathsRaw || allPathsRaw.length === 0) {
        pathsInfoContainer.textContent = "No paths found!";
        return;
    }

    // Sort paths based on steps
    const sortedPaths = [...allPathsRaw].sort((a, b) => a.steps - b.steps);

    // The shortest path steps count
    const shortestPathSteps = sortedPaths[0].steps;

    // Find first path with same steps count
    let shortestPathIndex = sortedPaths.findIndex(pathObj => pathObj.steps === shortestPathSteps) + 1;

    let output = `Total possible paths: ${sortedPaths.length}\n\n`;

    sortedPaths.forEach((pathObj, index) => {
        output += `Path ${index + 1}: ${pathObj.steps - 1} steps\n`;  // Subtract 1 to show moves
    });

    output += `\nShortest path: Path ${shortestPathIndex} (${shortestPathSteps - 1} steps)\n`;  // Subtract 1 here too
    output += `\nThe shortest path is highlighted in the maze.`;

    pathsInfoContainer.innerHTML = `<pre>${output}</pre>`;
}



function highlightShortestPath(path) {
    path.forEach((coord, index) => {
        setTimeout(() => {
            const [row, col] = coord;
            const cell = mazeContainer.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
            if (cell && !cell.classList.contains('start') && !cell.classList.contains('end')) {
                cell.classList.add('shortest-path');
            }
        }, index * 200);
    });
}

function resetMaze() {
    const allCells = mazeContainer.querySelectorAll('.cell');
    allCells.forEach(cell => {
        cell.classList.remove('shortest-path');
    });
    pathsInfoContainer.textContent = '';
}

document.getElementById('generate-btn').addEventListener('click', generateMaze);
document.getElementById('reset-btn').addEventListener('click', resetMaze);
document.getElementById('find-btn').addEventListener('click', findPaths);

window.onload = generateMaze;
