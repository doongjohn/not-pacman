#pragma once

#include <memory.h>
#include <iostream>
#include <vector>
#include <functional>

#include "structs.hpp"

class GameMap {
public:
  const int width;
  const int height;
  std::vector<std::vector<int>> type;
  std::vector<std::vector<int>> extra_cost;
  std::vector<std::vector<bool>> walkable;

  GameMap(int width, int height) : width(width), height(height) {
    type.resize(height);
    extra_cost.resize(height);
    walkable.resize(height);
    for (int i = 0; i < height; ++i) {
      type[i].resize(width);
      extra_cost[i].resize(width);
      walkable[i].resize(width);
    }
    for (int y = 0; y < height; ++y) {
      for (int x = 0; x < width; ++x) {
        walkable[y][x] = true;
      }
    }
  }
  ~GameMap() {}

  auto for_each(std::function<void(Point)> func) -> void {
    for (int y = 0; y < height; ++y) {
      for (int x = 0; x < width; ++x) {
        func({x, y});
      }
    }
  }

  auto set_type(Point pos, int value) -> void {
    type[pos.y][pos.x] = value;
  }
  auto set_extra_cost(Point pos, int value) -> void {
    extra_cost[pos.y][pos.x] = value;
  }
  auto set_walkable(Point pos, bool value) -> void {
    walkable[pos.y][pos.x] = value;
  }

  auto get_type(Point pos) -> int {
    return type[pos.y][pos.x];
  }
  auto get_extra_cost(Point pos) -> int {
    return extra_cost[pos.y][pos.x];
  }
  auto get_walkable(Point pos) -> bool {
    return walkable[pos.y][pos.x];
  }
};
