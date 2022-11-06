#include <httplib.h>
#include <iostream>
#include <string>

#include "map.hpp"
#include "pathfinder.hpp"

// TODO: create websocket server
// TODO: create web frontend
// - [ ] character movement
// - [ ] ghost state machine
// - [ ] character collision

auto main() -> int {
  std::vector<std::string> m = {
    "■■■■■■■■■■■■■■■■■■■■■■■■■■■■",
    "■            ■■            ■",
    "■ ■■■■ ■■■■■ ■■ ■■■■■ ■■■■ ■",
    "■ ■■■■ ■■■■■ ■■ ■■■■■ ■■■■ ■",
    "■ ■■■■ ■■■■■ ■■ ■■■■■ ■■■■ ■",
    "■                          ■",
    "■ ■■■■ ■■ ■■■■■■■■ ■■ ■■■■ ■",
    "■ ■■■■ ■■ ■■■■■■■■ ■■ ■■■■ ■",
    "■      ■■    ■■    ■■      ■",
    "■■■■■■ ■■■■■ ■■ ■■■■■ ■■■■■■",
    "■■■■■■ ■■■■■ ■■ ■■■■■ ■■■■■■",
    "■■■■■■ ■■          ■■ ■■■■■■",
    "■■■■■■ ■■ ■■■  ■■■ ■■ ■■■■■■",
    "■■■■■■ ■■ ■      ■ ■■ ■■■■■■",
    "■         ■      ■         ■",
    "■■■■■■ ■■ ■      ■ ■■ ■■■■■■",
    "■■■■■■ ■■ ■■■■■■■■ ■■ ■■■■■■",
    "■■■■■■ ■■          ■■ ■■■■■■",
    "■■■■■■ ■■ ■■■■■■■■ ■■ ■■■■■■",
    "■■■■■■ ■■ ■■■■■■■■ ■■ ■■■■■■",
    "■            ■■            ■",
    "■ ■■■■ ■■■■■ ■■ ■■■■■ ■■■■ ■",
    "■ ■■■■ ■■■■■ ■■ ■■■■■ ■■■■ ■",
    "■   ■■                ■■   ■",
    "■■■ ■■ ■■          ■■ ■■ ■■■",
    "■■■ ■■ ■■          ■■ ■■ ■■■",
    "■      ■■          ■■      ■",
    "■ ■■■■■■■          ■■■■■■■ ■",
    "■ ■■■■■■■          ■■■■■■■ ■",
    "■                          ■",
    "■■■■■■■■■■■■■■■■■■■■■■■■■■■■",
  };

  Map map(28, 31);
  map.for_each([&](Point pos) {
    int x = pos.x;
    int y = pos.y;
    switch (m[y][x]) {
      break; case '■': // wall
        map.set_type({x, y}, 1);
        map.set_walkable({x, y}, false);

      break; case '.': // score

      break; case '*': // powerup

      break; default:
        std::cout << "Unknown tile type!\n";
    }
  });

  PathFinder path_finder(map);
  auto path = path_finder.astar({1, 1}, {8, 8});
  path_finder.print_path(path);

  // start_http_server();
  return 0;
}
