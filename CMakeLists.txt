cmake_minimum_required(VERSION 3.10)
project(TG_3sixO LANGUAGES CXX)

# Require C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Allow user to choose build type on single-config generators
if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
  set(CMAKE_BUILD_TYPE "Release" CACHE STRING "Choose the type of build." FORCE)
endif()

# Helpful output dir defaults
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE ${CMAKE_BINARY_DIR}/bin)

# Platform / compiler specific flags
if (MSVC)
  # /EHsc = enable C++ exceptions model (recommended)
  add_compile_options(/W4 /EHsc)
  # Link Winsock (httplib uses sockets on Windows)
  set(PLATFORM_LIBS Ws2_32)
else()
  add_compile_options(-Wall -Wextra -pedantic)
  # set optimization for Release only (leave Debug unoptimized for easier debugging)
  if (CMAKE_BUILD_TYPE STREQUAL "Release")
    add_compile_options(-O2)
  endif()
  set(PLATFORM_LIBS "")
endif()

# Optional define to raise minimum Win32 API if needed (uncomment if you get errors)
# add_definitions(-D_WIN32_WINNT=0x0601)

# We will create the executable later; collect sources
set(SOURCES
    src/main.cpp
    src/server.cpp
    src/store.cpp
    src/dijkstra.cpp
    src/TransitDNA.cpp
)

# Create the executable target
add_executable(${PROJECT_NAME} ${SOURCES})

# Ensure includes from src are available
target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_SOURCE_DIR}/src)

# Add include directories (header-only deps are expected under deps/)
target_include_directories(${PROJECT_NAME} SYSTEM BEFORE PRIVATE ${CMAKE_SOURCE_DIR}/deps)


# Link Threads
find_package(Threads REQUIRED)
target_link_libraries(${PROJECT_NAME} PRIVATE Threads::Threads ${PLATFORM_LIBS})

# Provide helpful compile definitions (optional)
# target_compile_definitions(${PROJECT_NAME} PRIVATE _CRT_SECURE_NO_WARNINGS)

# Platform-specific notes for developers
if (WIN32)
  message(STATUS "Configuring for Windows. If you don't have Visual Studio, you can use MSYS2/mingw or Ninja generator.")
endif()

message(STATUS "Project: ${PROJECT_NAME}")
message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "Output dir: ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}")
