#include <iostream>
#include <string>

#include <nlohmann/json.hpp>

#include "game_map.hpp"
#include "path_finder.hpp"

// TODO: create websocket server
// TODO: create web frontend
//   - [x] load map data from the http server
//   - [x] character movement
//   - [x] character tile collision
//   - [ ] character ghost collision
//   - [ ] character respawn
//   - [ ] ghost state machine
//   - [ ] game over

using nlohmann::json;

struct GameData {
  GameMap game_map;
  PathFinder path_finder;
  json json_map_data;

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

#include "server.hpp"

auto main() -> int {
  GameData game_data(28, 31);

  // original pacman map:
  // https://static.wikia.nocookie.net/pacman/images/0/00/Pac-Man.png/revision/latest?cb=20131228020207
  std::vector<std::string> map_str = {
    "############################",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#@####.#####.##.#####.####@#",
    "#.####.#####.##.#####.####.#",
    "#..........................#",
    "#.####.##.########.##.####.#",
    "#.####.##.########.##.####.#",
    "#......##....##....##......#",
    "######.#####.##.#####.######",
    "######.#####.##.#####.######",
    "######.##          ##.######",
    "######.## ###--### ##.######",
    "######.## #      # ##.######",
    "#........ #      # ........#",
    "######.## #      # ##.######",
    "######.## ######## ##.######",
    "######.##          ##.######",
    "######.## ######## ##.######",
    "######.## ######## ##.######",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#.####.#####.##.#####.####.#",
    "#@..##................##..@#",
    "###.##.##.########.##.##.###",
    "###.##.##.########.##.##.###",
    "#......##....##....##......#",
    "#.##########.##.##########.#",
    "#.##########.##.##########.#",
    "#..........................#",
    "############################",
  };

  game_data.game_map.for_each([&](Point pos) {
    GameMap &game_map = game_data.game_map;
    int x = pos.x;
    int y = pos.y;
    switch (map_str[y][x]) {
      break; case '#': // wall
        game_map.set_type({x, y}, 1);
        game_map.set_walkable({x, y}, false);

      break; case '-': // gate
        game_map.set_type({x, y}, 2);
        game_map.set_walkable({x, y}, false);

      break; case '.': // score
        game_map.set_type({x, y}, 3);

      break; case '@': // powerup
        game_map.set_type({x, y}, 4);

      break; default: // empty
        game_map.set_type({x, y}, 0);
    }
  });
  game_data.update_json_data();

  start_http_server(game_data);
  return 0;
}
