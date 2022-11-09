#pragma once

#include <nlohmann/json.hpp>

#include "game_map.hpp"
#include "path_finder.hpp"

struct GameData {
  GameMap game_map;
  PathFinder path_finder;
  nlohmann::json json_map_data;

  GameData(const int width, const int height)
    : game_map(width, height),
      path_finder(game_map) {
    json_map_data["gridWidth"] = game_map.width; // this is a constant data
    json_map_data["gridHeight"] = game_map.height; // this is a constant data
    json_map_data["type"] = game_map.type;
  }

  auto update_json_data() -> void {
    json_map_data["type"] = game_map.type;
  }
};
