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

    animatePath(data.path);
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

        const steps = highlightedPath.filter(
            ([x, y]) => !(x === 0 && y === 1) && !(x === 8 && y === 7)
        ).length;

        stepsMessage.textContent = `Steps taken: ${steps}`;

        index++;
        setTimeout(step, 250);
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
