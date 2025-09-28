#include <iostream>
#include <thread>
#include "TransitDNA.hpp"
#include "server.hpp"

// global DNA object
TransitDNA DNA;

// main simply starts the server; you can later spawn simulators or CLI.
int main() {

    // ----- DEMO SEED (temporary) -----
// Place this after you construct the global TransitDNA object (or just inside main()
// before run_server(...) so development runs show non-empty DNA).
// Remove before production.
    DNA.logIncidentImpact(1, 3, 10); // node 1, severity 3 => observed +10 min
    std::cout << "[demo] TransitDNA seeded: node=1 sev=3 delay=10min\n";
//TODO - REMOVE THE DAMN THING PEOPLE ! 

    std::thread srv([]() { run_server(8080); });
    std::cout << "Guardian backend running on http://localhost:8080\n";
    std::cout << "Press Ctrl+C to stop.\n";
    srv.join();
 
    return 0;
}
