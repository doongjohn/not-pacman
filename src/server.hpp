#pragma once

#include <httplib.h>
#include <iostream>

#include "game_data.hpp"

auto start_http_server(GameData &data) -> void {
  using namespace httplib;

  Server svr;
  if (!svr.set_mount_point("/", "./frontend")) {
    std::cout << "error: The specified base directory doesn't exist...\n";
    exit(1);
  }

  svr.Get("/get-map-json", [&](const Request &req, Response &res) {
    res.set_content(data.json_map_data.dump(), "application/json");
  });

  svr.Post("/get-path-json", [&](const Request &req, Response &res) {
    nlohmann::json json_req = nlohmann::json::parse(req.body);
    const Point start = json_req["start"];
    const Point dest = json_req["dest"];

    nlohmann::json path = data.path_finder.astar(start, dest);
    res.set_content(path.dump(), "application/json");
  });

  // start server
  std::cout << "starting local http server -> http://localhost:3000\n";
  svr.listen("localhost", 3000);
}
