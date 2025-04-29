import random
import heapq
from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Starting and ending points
start = (0, 1)
end = (8, 7)

# Maze global variable
maze = None

# Directions: up, down, left, right
directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

# Modified Dijkstra's algorithm to find the shortest path
def dijkstra(maze, start, end):
    rows, cols = len(maze), len(maze[0])
    distances = {start: 0}
    queue = [(0, start)]
    previous = {}
    visited = set()

    while queue:
        dist, current = heapq.heappop(queue)
        if current == end:
            break
        if current in visited:
            continue
        visited.add(current)

        x, y = current
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 <= nx < rows and 0 <= ny < cols and maze[nx][ny] == 1:
                neighbor = (nx, ny)
                new_dist = dist + 1
                if neighbor not in distances or new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    heapq.heappush(queue, (new_dist, neighbor))
                    previous[neighbor] = current

    # Reconstruct the shortest path
    path = []
    node = end
    while node in previous:
        path.append(node)
        node = previous[node]
    if node == start:
        path.append(start)
        path.reverse()
        return path
    else:
        return None

# Generate a random maze
def generate_maze(rows=9, cols=9):
    maze = [[1 if random.random() < 0.7 else 0 for _ in range(cols)] for _ in range(rows)]
    maze[start[0]][start[1]] = 1  # Ensure start is open
    maze[end[0]][end[1]] = 1      # Ensure end is open
    return maze

# Generate a valid maze with at least one path from start to end
def generate_valid_maze(rows=9, cols=9):
    while True:
        maze = generate_maze(rows, cols)
        path = dijkstra(maze, start, end)
        if path:
            return maze

# Highlight the shortest path in the maze
def highlight_shortest_path(maze, path):
    if not path:
        return maze
    for (x, y) in path:
        maze[x][y] = 2  # Mark shortest path with a '2'
    return maze

# Function to find multiple paths (basic version)
def find_multiple_paths(maze, start, end, num_paths=3):
    all_paths = []
    original_maze = [row[:] for row in maze]  # Make a copy

    for _ in range(num_paths):
        path = dijkstra(original_maze, start, end)
        if path:
            all_paths.append(path)
            # Remove a random cell in the found path (except start and end) to encourage new paths
            if len(path) > 2:
                removable = random.choice(path[1:-1])
                x, y = removable
                original_maze[x][y] = 0  # Add wall
        else:
            break

    return all_paths

# Routes

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate-maze', methods=['POST'])
def generate_maze_route():
    global maze
    maze = generate_valid_maze()
    return jsonify({'maze': maze})

@app.route('/get-path', methods=['POST'])
def get_path():
    global maze
    if maze is None:
        return jsonify({'paths': []})

    path = dijkstra(maze, start, end)

    if path is None:
        return jsonify({'error': 'No path found'})

    highlighted_maze = highlight_shortest_path([row[:] for row in maze], path)

    return jsonify({'maze': highlighted_maze, 'path': path})

@app.route('/get-paths', methods=['POST'])
def get_multiple_paths():
    global maze
    if maze is None:
        return jsonify({'paths': []})

    paths = find_multiple_paths(maze, start, end, num_paths=3)
    if not paths:
        return jsonify({'error': 'No paths found'})

    return jsonify({'maze': maze, 'paths': paths})

if __name__ == '__main__':
    app.run(debug=True)
