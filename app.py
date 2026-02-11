import random
import heapq
from flask import Flask, render_template, jsonify

app = Flask(__name__)

START = (0, 1)
END = (8, 7)
maze = None

DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]


# -------------------------
# Dijkstra Algorithm
# -------------------------
def dijkstra(maze, start, end):
    rows, cols = len(maze), len(maze[0])
    distances = {start: 0}
    queue = [(0, start)]
    previous = {}
    visited = set()

    while queue:
        dist, current = heapq.heappop(queue)

        if current in visited:
            continue

        visited.add(current)

        if current == end:
            break

        x, y = current

        for dx, dy in DIRECTIONS:
            nx, ny = x + dx, y + dy

            if 0 <= nx < rows and 0 <= ny < cols and maze[nx][ny] == 1:
                neighbor = (nx, ny)
                new_dist = dist + 1

                if neighbor not in distances or new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    previous[neighbor] = current
                    heapq.heappush(queue, (new_dist, neighbor))

    # Reconstruct path
    path = []
    node = end

    while node in previous:
        path.append(node)
        node = previous[node]

    if node == start:
        path.append(start)
        path.reverse()
        return path

    return None


# -------------------------
# Maze Generator
# -------------------------
def generate_valid_maze(rows=9, cols=9):
    while True:
        new_maze = [
            [1 if random.random() < 0.7 else 0 for _ in range(cols)]
            for _ in range(rows)
        ]

        new_maze[START[0]][START[1]] = 1
        new_maze[END[0]][END[1]] = 1

        if dijkstra(new_maze, START, END):
            return new_maze


# -------------------------
# Routes
# -------------------------
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate-maze", methods=["POST"])
def generate_maze_route():
    global maze
    maze = generate_valid_maze()
    return jsonify({"maze": maze})


@app.route("/get-path", methods=["POST"])
def get_path():
    global maze

    if maze is None:
        return jsonify({"error": "Maze not generated"})

    path = dijkstra(maze, START, END)

    if not path:
        return jsonify({"error": "No path found"})

    return jsonify({"path": path})


if __name__ == "__main__":
    app.run(debug=True)
