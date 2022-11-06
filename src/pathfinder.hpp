#pragma once

#include <iostream>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <functional>

#include "map.hpp"
#include "structs.hpp"

namespace heuristic {

// this is for dijkstra
static auto none(Point cur, Point dest) -> int {
  return 0;
}

// A*’s Use of the Heuristic:
// http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
static auto diagonal_distance(Point cur, Point dest) -> int {
    const int dx = abs(cur.x - dest.x);
    const int dy = abs(cur.y - dest.y);
    constexpr const int D = 10;
    constexpr const int D2 = 14;
    return D * (dx + dy) + (D2 - 2 * D) * std::min(dx, dy);
  }

} // namespace heuristic

class PathFinder {
private:
  Map &game_map;

public:
  ~PathFinder() {}
  PathFinder(Map &map) : game_map(map) {}

  auto is_in_bounds(Point pos) -> bool;
  auto get_neighbors(Point pos) -> Neighbors;

  auto dijkstra_base(Point start, Point dest, std::function<int(Point, Point)> heuristic_fn) -> std::vector<Point>;
  auto dijkstra(Point start, Point dest) -> std::vector<Point>;
  auto astar(Point start, Point dest) -> std::vector<Point>;

  auto print_path(std::vector<Point> path) -> void;
};

inline auto PathFinder::is_in_bounds(Point pos) -> bool {
  return pos.x >= 0 && pos.y >= 0 && pos.x < game_map.width && pos.y < game_map.height;
}

inline auto PathFinder::get_neighbors(Point pos) -> Neighbors {
  Neighbors result;

  constexpr const int straight_path_cost = 10;
  constexpr const int diagonal_path_cost = 14;

  result.nodes[0] = Node(pos.x + 1, pos.y);
  result.nodes[1] = Node(pos.x - 1, pos.y);
  result.nodes[2] = Node(pos.x, pos.y + 1);
  result.nodes[3] = Node(pos.x, pos.y - 1);
  for (int i = 0; i <= 3; ++i) {
    result.weights[i] = straight_path_cost;
  }

  result.nodes[4] = Node(-1, -1);
  result.nodes[5] = Node(-1, -1);
  result.nodes[6] = Node(-1, -1);
  result.nodes[7] = Node(-1, -1);

  // check blocked corner
  if ((is_in_bounds(result.nodes[0].pos) && game_map.get_walkable(result.nodes[0].pos)) ||
      (is_in_bounds(result.nodes[2].pos) && game_map.get_walkable(result.nodes[2].pos))) {
    result.nodes[4] = Node(pos.x + 1, pos.y + 1);
  }
  if ((is_in_bounds(result.nodes[0].pos) && game_map.get_walkable(result.nodes[0].pos)) ||
      (is_in_bounds(result.nodes[3].pos) && game_map.get_walkable(result.nodes[3].pos))) {
    result.nodes[5] = Node(pos.x + 1, pos.y - 1);
  }
  if ((is_in_bounds(result.nodes[1].pos) && game_map.get_walkable(result.nodes[1].pos)) ||
      (is_in_bounds(result.nodes[2].pos) && game_map.get_walkable(result.nodes[2].pos))) {
    result.nodes[6] = Node(pos.x - 1, pos.y + 1);
  }
  if ((is_in_bounds(result.nodes[1].pos) && game_map.get_walkable(result.nodes[1].pos)) ||
      (is_in_bounds(result.nodes[3].pos) && game_map.get_walkable(result.nodes[3].pos))) {
    result.nodes[7] = Node(pos.x - 1, pos.y - 1);
  }

  for (int i = 4; i <= 7; ++i) {
    result.weights[i] = diagonal_path_cost;
  }

  return result;
}

inline auto PathFinder::dijkstra_base(Point start, Point dest, std::function<int(Point, Point)> heuristic_fn) -> std::vector<Point> {
  // check out of bounds
  if (!is_in_bounds(start) || !is_in_bounds(dest)) {
    std::cout << "start or dest is out of map bounds!\n";
    return {};
  }

  // swap start and dest to make the result reverse
  {
    Point tmp_start = start;
    start = dest;
    dest = tmp_start;
  }

  std::vector<Point> path;                     // final path
  std::unordered_map<Point, Node> node_lookup; // store explored node data

  Array2D<bool> visited(game_map.width, game_map.height);
  visited.set_all(false);

  std::priority_queue<Node, std::vector<Node>, std::greater<Node>> pq;
  pq.push(Node(start.x, start.y));

  while (!pq.empty()) {
    // get next node
    Node current_node = pq.top();
    pq.pop();

    // update visited
    visited.at(current_node.pos) = true;

    // update node_lookup
    node_lookup[current_node.pos] = current_node;

    // destination found
    if (current_node.pos == dest) {
      // backtrace parent to find a path
      Node parent = current_node;
      while (true) {
        path.push_back(parent.pos);
        parent = node_lookup[parent.parent_pos];
        if (parent.pos == start) {
          path.push_back(parent.pos); // add starting point
          break;
        }
      }
      return path;
    }

    // update neighbors
    auto neighbors = get_neighbors(current_node.pos);
    for (int i = 0; i < neighbors.nodes.size(); ++i) {
      auto &neighbor = neighbors.nodes[i];
      auto &weight = neighbors.weights[i];

      // check array bounds
      if (!is_in_bounds(neighbor.pos)) {
        continue;
      }

      // check walkable
      if (!game_map.get_walkable(neighbor.pos)) {
        continue;
      }

      // skip visited
      if (visited.at(neighbor.pos)) {
        continue;
      }

      // Understanding Edge Relaxation for Dijkstra’s Algorithm and Bellman-Ford Algorithm:
      // https://towardsdatascience.com/algorithm-shortest-paths-1d8fa3f50769
      const bool node_first_time = node_lookup.find(neighbor.pos) == node_lookup.end();
      const int new_cost = current_node.cost + weight + game_map.get_extra_cost(neighbor.pos) + heuristic_fn(neighbor.pos, dest);
      if (node_first_time || node_lookup[neighbor.pos].cost > new_cost) {
        // update cost and parent (edge relaxation)
        neighbor.cost = new_cost;
        neighbor.parent_pos = current_node.pos;
        node_lookup[neighbor.pos] = neighbor;
      }

      // push to priority queue
      pq.push(neighbor);
    }
  }

  return {};
}

inline auto PathFinder::astar(Point start, Point dest) -> std::vector<Point> {
  // check out of bounds
  if (!is_in_bounds(start) || !is_in_bounds(dest)) {
    std::cout << "start or dest is out of map bounds!\n";
    return {};
  }

  // swap start and dest to make the result reverse
  {
    Point tmp_start = start;
    start = dest;
    dest = tmp_start;
  }

  std::vector<Point> path;                     // final path
  std::unordered_map<Point, Node> node_lookup; // store explored node data

  Array2D<bool> visited(game_map.width, game_map.height);
  visited.set_all(false);

  std::priority_queue<Node, std::vector<Node>, std::greater<Node>> pq;
  pq.push(Node(start.x, start.y));

  while (!pq.empty()) {
    // get next node
    Node current_node = pq.top();
    pq.pop();

    // update visited
    visited.at(current_node.pos) = true;

    // update node_lookup
    node_lookup[current_node.pos] = current_node;

    // destination found
    if (current_node.pos == dest) {
      // backtrace parent to find a path
      Node parent = current_node;
      while (true) {
        path.push_back(parent.pos);
        parent = node_lookup[parent.parent_pos];
        if (parent.pos == start) {
          path.push_back(parent.pos); // add starting point
          break;
        }
      }
      return path;
    }

    // update neighbors
    auto neighbors = get_neighbors(current_node.pos);
    for (int i = 0; i < neighbors.nodes.size(); ++i) {
      auto &neighbor = neighbors.nodes[i];
      auto &weight = neighbors.weights[i];

      // check array bounds
      if (!is_in_bounds(neighbor.pos)) {
        continue;
      }

      // check walkable
      if (!game_map.get_walkable(neighbor.pos)) {
        continue;
      }

      // skip visited
      if (visited.at(neighbor.pos)) {
        continue;
      }

      // Understanding Edge Relaxation for Dijkstra’s Algorithm and Bellman-Ford Algorithm:
      // https://towardsdatascience.com/algorithm-shortest-paths-1d8fa3f50769
      const bool node_first_time = node_lookup.find(neighbor.pos) == node_lookup.end();
      const int new_cost = current_node.cost + weight + game_map.get_extra_cost(neighbor.pos) + heuristic::diagonal_distance(neighbor.pos, dest);
      if (node_first_time || node_lookup[neighbor.pos].cost > new_cost) {
        // update cost and parent (edge relaxation)
        neighbor.cost = new_cost;
        neighbor.parent_pos = current_node.pos;
        node_lookup[neighbor.pos] = neighbor;
      }

      // push to priority queue
      pq.push(neighbor);
    }
  }

  return {};
}

inline auto PathFinder::print_path(std::vector<Point> path) -> void {
  for (int y = 0; y < game_map.height; ++y) {
    for (int x = 0; x < game_map.width; ++x) {
      if (std::find(path.begin(), path.end(), Point(x, y)) != path.end()) {
        fputs("* ", stdout);
      } else {
        fputs(". ", stdout);
      }
    }
    puts("");
  }
}
