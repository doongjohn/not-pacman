#pragma once

#include <httplib.h>
#include <iostream>

#include "game_map.hpp"
#include "path_finder.hpp"

auto start_http_server(GameData &data) -> void {
  using namespace httplib;

  Server svr;
  if (!svr.set_mount_point("/", "./frontend")) {
    std::cout << "error: The specified base directory doesn't exist...\n";
    exit(1);
  }

  svr.Get("/get_map_json", [&](const Request &req, Response &res) {
    res.set_content(data.json_map_data.dump(), "application/json");
  });

  // start server
  std::cout << "starting local http server -> http://localhost:3000\n";
  svr.listen("localhost", 3000);
}

// NOTE: Do I really need this?
// start this in a diffrent thread
auto start_websock_server() -> void {
  // TODO: process packet
  // - [ ] sync positions
  // - [ ] sync collision
}
