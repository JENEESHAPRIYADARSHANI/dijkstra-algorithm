from flask import Flask, jsonify, render_template, request
import random
import heapq

app = Flask(__name__)

DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]

# Generate random 9x9 maze
def generate_maze():
    size = 9
    maze = [[1 for _ in range(size)] for _ in range(size)]

    def carve(x, y):
        directions = [(0, 2), (0, -2), (2, 0), (-2, 0)]
        random.shuffle(directions)
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 <= nx < size and 0 <= ny < size and maze[nx][ny] == 1:
                maze[nx][ny] = 0
                maze[x + dx // 2][y + dy // 2] = 0
                carve(nx, ny)

    maze[0][0] = 0
    carve(0, 0)
    maze[size - 1][size - 1] = 0

    # Random extra openings
    for _ in range(random.randint(5, 10)):
        x, y = random.randint(0, size - 1), random.randint(0, size - 1)
        maze[x][y] = 0

    return maze

# DFS to find up to 5 paths
def find_all_paths(maze, start, end, max_paths=5):
    all_paths = []
    path = []

    def dfs(x, y):
        if len(all_paths) >= max_paths:
            return  # stop after 5 paths
        if (x, y) == end:
            all_paths.append(list(path) + [end])
            return
        for dx, dy in DIRECTIONS:
            nx, ny = x + dx, y + dy
            if 0 <= nx < 9 and 0 <= ny < 9 and maze[nx][ny] == 0 and (nx, ny) not in path:
                path.append((nx, ny))
                dfs(nx, ny)
                path.pop()

    path.append(start)
    dfs(start[0], start[1])
    return all_paths

# Dijkstra's shortest path
def dijkstra(maze, start, end):
    size = 9
    dist = { (x, y): float('inf') for x in range(size) for y in range(size) }
    prev = {}
    dist[start] = 0
    heap = [(0, start)]

    while heap:
        cost, (x, y) = heapq.heappop(heap)
        if (x, y) == end:
            break

        for dx, dy in DIRECTIONS:
            nx, ny = x + dx, y + dy
            if 0 <= nx < size and 0 <= ny < size and maze[nx][ny] == 0:
                if dist[(x, y)] + 1 < dist[(nx, ny)]:
                    dist[(nx, ny)] = dist[(x, y)] + 1
                    prev[(nx, ny)] = (x, y)
                    heapq.heappush(heap, (dist[(nx, ny)], (nx, ny)))

    path = []
    current = end
    while current in prev:
        path.append(current)
        current = prev[current]
    if current == start:
        path.append(start)
        path.reverse()
        return path
    return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate-maze', methods=['POST'])
def generate_maze_route():
    maze = generate_maze()
    return jsonify({"maze": maze})

@app.route('/find-path', methods=['POST'])
def find_path_route():
    data = request.get_json()
    maze = data['maze']
    start = (0, 0)
    end = (8, 8)

    all_paths = find_all_paths(maze, start, end)
    all_paths_info = [{"path": path, "steps": len(path) - 1} for path in all_paths]

    shortest_path = dijkstra(maze, start, end)
    shortest_steps = len(shortest_path) - 1 if shortest_path else 0

    return jsonify({
        "all_paths": all_paths_info,
        "shortest_path": shortest_path,
        "shortest_steps": shortest_steps
    })

if __name__ == '__main__':
    app.run(debug=True)
