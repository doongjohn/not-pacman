cmake_minimum_required(VERSION 3.24)

set(CMAKE_BUILD_TYPE Debug)

# use utf-8
add_compile_options("$<$<C_COMPILER_ID:MSVC>:/utf-8>")
add_compile_options("$<$<CXX_COMPILER_ID:MSVC>:/utf-8>")

# generate compile_commands.json
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# my project
project(pacman++
  LANGUAGES CXX
)

# get dependencies
include(cmake/CPM.cmake)
CPMAddPackage("gh:nlohmann/json#v3.11.2")
CPMAddPackage("gh:yhirose/cpp-httplib#v0.11.2")

# get all cpp source files
file(GLOB_RECURSE SRC_FILES src/*.cpp)

add_executable(
  ${PROJECT_NAME}
  ${SRC_FILES})

target_compile_features(
  ${PROJECT_NAME}
  PRIVATE
    cxx_std_20)

target_link_libraries(
  ${PROJECT_NAME}
  PRIVATE
    nlohmann_json::nlohmann_json
    httplib::httplib)

add_custom_target(run
  COMMAND ${CMAKE_BINARY_DIR}/Debug/${PROJECT_NAME}.exe
  DEPENDS ${PROJECT_NAME}
  WORKING_DIRECTORY ${CMAKE_SOURCE_DIR})
