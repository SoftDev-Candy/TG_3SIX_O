cmake_minimum_required(VERSION 3.10)
project(TG_3sixO LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if (MSVC)
  add_compile_options(/W4)
else()
  add_compile_options(-Wall -Wextra -pedantic -O2 -g)
endif()

include_directories(${CMAKE_SOURCE_DIR}/deps)
# add include for src if you like
include_directories(${CMAKE_SOURCE_DIR}/src)

add_executable(guardian
    src/main.cpp
    src/server.cpp
    src/store.cpp
    src/dijkstra.cpp
    src/TransitDNA.cpp
)

find_package(Threads REQUIRED)
target_link_libraries(guardian PRIVATE Threads::Threads)
