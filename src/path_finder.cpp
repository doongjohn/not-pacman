#include "path_finder.hpp"

auto PathFinder::is_in_bounds(Point pos) -> bool {
  return pos.x >= 0 && pos.y >= 0 && pos.x < game_map.width && pos.y < game_map.height;
}

auto PathFinder::dijkstra_base(Point start, Point dest, std::function<int(Point, Point)> heuristic_fn) -> std::vector<Point> {
  // check out of bounds
  if (!is_in_bounds(start) || !is_in_bounds(dest)) {
    return {};
  }

  // swap start and dest
  {
    Point tmp = start;
    start = dest;
    dest = tmp;
  }

  std::vector<Point> path; // final path

  Array2D<Node> nodes(game_map.width, game_map.height);
  nodes.for_each([&](int x, int y) {
    Point pos{x, y};
    nodes.at(pos).pos = pos;
  });
  nodes.at(start).cost = 0;

  Array2D<bool> visited(game_map.width, game_map.height);
  visited.set_all(false);

  std::priority_queue<NodeRef, std::vector<NodeRef>, std::greater<NodeRef>> pq;
  pq.push(NodeRef(nodes.at_ptr(start)));

  while (!pq.empty()) {
    // get next node
    Node &current_node = *pq.top().ptr;
    pq.pop();

    // update visited
    visited.at(current_node.pos) = true;

    // destination found
    if (current_node.pos == dest) {
      // backtrace parent to find a path
      Node &node = current_node;
      while (true) {
        path.push_back(node.pos);
        if (node.pos == start) {
          path.push_back(node.pos); // add starting point
          break;
        }
        node = nodes.at(node.parent_pos);
      }
      return path;
    }

    // update neighbors
    const std::vector<Point> neighbor_offsets{
        {+1, +0},
        {-1, +0},
        {+0, +1},
        {+0, -1},
    };
    for (int i = 0; i < 4; ++i) {
      const Point offset = neighbor_offsets[i];
      const Point neighbor_pos{
        current_node.pos.x + offset.x,
        current_node.pos.y + offset.y,
      };

      // check array bounds
      if (!is_in_bounds(neighbor_pos)) {
        continue;
      }

      // check walkable
      if (!game_map.get_walkable(neighbor_pos)) {
        continue;
      }

      // skip visited
      if (visited.at(neighbor_pos)) {
        continue;
      }

      Node &neighbor = nodes.at(neighbor_pos);
      const int weight = straight_path_cost;

      // Understanding Edge Relaxation for Dijkstra’s Algorithm and Bellman-Ford Algorithm:
      // https://towardsdatascience.com/algorithm-shortest-paths-1d8fa3f50769

      const int new_cost =
        current_node.cost +
        weight +
        game_map.get_extra_cost(neighbor.pos) +
        heuristic_fn(neighbor.pos, dest);

      if (neighbor.cost > new_cost) {
        // update cost and parent (edge relaxation)
        neighbor.cost = new_cost;
        neighbor.parent_pos = current_node.pos;

        // push to priority queue
        pq.push(NodeRef(nodes.at_ptr(neighbor_pos)));
      }
    }
  }

  return {};
}

auto PathFinder::dijkstra(Point start, Point dest) -> std::vector<Point> {
  return dijkstra_base(start, dest, heuristic::none);
}

auto PathFinder::astar(Point start, Point dest) -> std::vector<Point> {
  return dijkstra_base(start, dest, heuristic::manhattan_distance);
}
