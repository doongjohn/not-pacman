#pragma once

#include <queue>
#include <vector>
#include <functional>

#include "game_map.hpp"
#include "structs.hpp"

class PathFinder {
private:
  GameMap &game_map;

public:
  constexpr static const int straight_path_cost = 10;
  constexpr static const int diagonal_path_cost = 14;

  ~PathFinder() {}
  PathFinder(GameMap &map) : game_map(map) {}

  auto is_in_bounds(Point pos) -> bool;

  auto dijkstra_base(Point start, Point dest, std::function<int(Point, Point)> heuristic_fn) -> std::vector<Point>;
  auto dijkstra(Point start, Point dest) -> std::vector<Point>;
  auto astar(Point start, Point dest) -> std::vector<Point>;
};

namespace heuristic {

// A*’s Use of the Heuristic:
// http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

static auto none(Point cur, Point dest) -> int {
  return 0;
}

static auto diagonal_distance(Point cur, Point dest) -> int {
  const int dx = abs(cur.x - dest.x);
  const int dy = abs(cur.y - dest.y);
  constexpr const int D = PathFinder::straight_path_cost;
  constexpr const int D2 = PathFinder::diagonal_path_cost;
  return D * (dx + dy) + (D2 - 2 * D) * std::min(dx, dy);
}

static auto manhattan_distance(Point cur, Point dest) -> int {
  const int dx = abs(cur.x - dest.x);
  const int dy = abs(cur.y - dest.y);
  constexpr const int D = PathFinder::straight_path_cost;
  return D * (dx + dy);
}

} // namespace heuristic
