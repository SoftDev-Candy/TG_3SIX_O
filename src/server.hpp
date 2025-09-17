#pragma once
#include <httplib.h>
#include "json.hpp"
#include "store.hpp"
#include "dijkstra.hpp"

void run_server(int port = 8080);
