#include <iostream>
#include <string>

#include "game_data.hpp"
#include "server.hpp"

// TODO: create websocket server
// TODO: create web frontend
//   - [x] load map data from the http server
//   - [x] character movement
//   - [x] character & tile collision
//   - [ ] character & ghost collision
//   - [ ] character respawn
//   - [ ] ghost state machine
//   - [ ] game over

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
