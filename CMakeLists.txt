cmake_minimum_required(VERSION 3.24)

# generate compile_commands.json
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# my project
project(pacman++
  LANGUAGES CXX
)

# get dependencies
include(cmake/CPM.cmake)
CPMAddPackage("gh:yhirose/cpp-httplib#v0.11.2")

# get all cpp source files
file(GLOB_RECURSE SRC_FILES src/*.cpp)

add_executable(
  ${PROJECT_NAME}
  ${SRC_FILES})

target_compile_features(
  ${PROJECT_NAME}
  PRIVATE cxx_std_20)

add_custom_target(run
  COMMAND ${CMAKE_BINARY_DIR}/Debug/${PROJECT_NAME}.exe
  DEPENDS ${PROJECT_NAME}
  WORKING_DIRECTORY ${CMAKE_SOURCE_DIR})
