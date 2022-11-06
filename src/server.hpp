#pragma once

#include <httplib.h>
#include <iostream>

#include "map.hpp"
#include "pathfinder.hpp"

auto start_http_server() -> void {
  using namespace httplib;

  Server svr;
  if (!svr.set_mount_point("/", "./frontend")) {
    std::cout << "error: The specified base directory doesn't exist...\n";
    exit(1);
  }

  svr.Get("/get_map_json", [&](const Request &req, Response &res) {
    // res.set_content(data.json_map_data.dump(), "application/json");
  });

  svr.Get("/get_path_json", [&](const Request &req, Response &res) {
    // json json_dijkstra_result = data.path_finder.dijkstra(data.startingPoint, data.destinationPoint);
    // res.set_content(json_dijkstra_result.dump(), "application/json");
  });

  svr.Post("/set_map_json", [&](const Request &req, Response &res) {
    // data.json_map_data = json::parse(req.body);
    // data.update_all_data();
  });

  std::cout << "starting local http server -> http://localhost:3000\n";
  svr.listen("localhost", 3000);
}

// start this in a diffrent thread
auto start_websock_server() -> void {
  // TODO: process packet
  // - [ ] sync positions
  // - [ ] sync collision
}
