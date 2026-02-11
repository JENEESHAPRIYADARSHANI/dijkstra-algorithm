const mazeContainer = document.getElementById("maze");
const stepsMessage = document.getElementById("steps-message");

const generateBtn = document.getElementById("generate-btn");
const findBtn = document.getElementById("find-btn");
const resetBtn = document.getElementById("reset-btn");

let mazeMatrix = [];
let highlightedPath = [];


// -----------------------------
// Render Maze
// -----------------------------
function renderMaze() {
    mazeContainer.innerHTML = "";

    mazeMatrix.forEach((row, r) => {
        row.forEach((cellValue, c) => {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            if (cellValue === 0) {
                cell.classList.add("wall");
            }

            if (r === 0 && c === 1) {
                cell.classList.add("start");
            }

            if (r === 8 && c === 7) {
                cell.classList.add("end");
            }

            if (highlightedPath.some(([x, y]) => x === r && y === c)) {
                if (!(r === 0 && c === 1) && !(r === 8 && c === 7)) {
                    cell.classList.add("path");
                }
            }

            mazeContainer.appendChild(cell);
        });
    });
}


// -----------------------------
// Generate Maze
// -----------------------------
async function generateMaze() {
    const response = await fetch("/generate-maze", {
        method: "POST"
    });

    const data = await response.json();

    mazeMatrix = data.maze;
    highlightedPath = [];
    stepsMessage.textContent = "Output";

    renderMaze();
}


// -----------------------------
// Find Shortest Path
// -----------------------------
async function findPath() {
    const response = await fetch("/get-path", {
        method: "POST"
    });

    const data = await response.json();

    if (data.error) {
        alert(data.error);
        return;
    }


    displayDijkstraInfo(data);

    // Animate path AFTER printing steps
    animatePath(data.shortest_path);
}


function displayPathInfo(pathNumber, steps, path) {
    const infoContainer = document.getElementById("paths-info");

    let output = "";
    output += `Total possible paths: 1\n\n`;
    output += `Shortest Path: Path ${pathNumber}\n`;
    output += `Steps Required: ${steps}\n\n`;
    output += `Path Coordinates:\n`;

    path.forEach((coord, index) => {
        output += `Step ${index}: (${coord[0]}, ${coord[1]})\n`;
    });

    infoContainer.innerHTML = `<pre>${output}</pre>`;
}

function displayDijkstraInfo(data) {
    const infoContainer = document.getElementById("paths-info");

    let output = "";
    output += "Dijkstra's Algorithm Result\n\n";
    // output += "Nodes Visited: " + data.visited_nodes + "\n";
    output += "Shortest Path Length: " + data.shortest_steps + "\n";

    infoContainer.innerHTML = "<pre>" + output + "</pre>";
}





// -----------------------------
// Animate Path
// -----------------------------
function animatePath(path) {
    highlightedPath = [];
    let index = 0;

    function step() {
        if (index >= path.length) return;

        highlightedPath.push(path[index]);
        renderMaze();

        index++;
        setTimeout(step, 200);
    }

    step();
}




// -----------------------------
// Reset
// -----------------------------
function resetMaze() {
    highlightedPath = [];
    stepsMessage.textContent = "Output";
    renderMaze();
}


// -----------------------------
// Button Events
// -----------------------------
generateBtn.addEventListener("click", generateMaze);
findBtn.addEventListener("click", findPath);
resetBtn.addEventListener("click", resetMaze);


// -----------------------------
// Initial Load
// -----------------------------
window.onload = generateMaze;
