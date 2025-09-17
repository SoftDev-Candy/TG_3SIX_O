#include <iostream>
#include <thread>
#include "server.hpp"

// main simply starts the server; you can later spawn simulators or CLI.
int main() {
    std::thread srv([]() { run_server(8080); });
    std::cout << "Guardian backend running on http://localhost:8080\n";
    std::cout << "Press Ctrl+C to stop.\n";
    srv.join();
    return 0;
}
