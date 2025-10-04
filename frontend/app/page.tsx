import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <h1 className="text-xl font-bold">Travel Guardian 360</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4">🚦 Next-Generation Transit Intelligence</Badge>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Real-Time Public Transport Delay Reporting
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community-driven platform to report delays, earn points, and help fellow commuters 
            navigate public transportation with confidence.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/map">
              <Button size="lg" variant="outline" className="text-lg">
                View Live Map
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-bold mb-2">Report Delays</h3>
            <p className="text-gray-600">
              Quickly report transit delays with location, photos, and details. 
              Help the community stay informed.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Earn Points</h3>
            <p className="text-gray-600">
              Get rewarded for contributing verified reports. Redeem points 
              for discounts with partner organizations.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold mb-2">Smart Routing</h3>
            <p className="text-gray-600">
              Find optimal routes that avoid active delays. Our C++ routing 
              engine calculates the best path in real-time.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2">Live Updates</h3>
            <p className="text-gray-600">
              Receive real-time notifications about delays on your saved routes. 
              Stay ahead of disruptions.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2">Community Verified</h3>
            <p className="text-gray-600">
              Reports are verified by multiple users and cross-checked with 
              official data for accuracy.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Leaderboards</h3>
            <p className="text-gray-600">
              Compete with fellow commuters. Top contributors get recognition 
              and bonus rewards.
            </p>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">Coming Soon</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">—</div>
              <div className="text-gray-600">Reports Today</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">—</div>
              <div className="text-gray-600">Routes Optimized</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">—</div>
              <div className="text-gray-600">Points Awarded</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>Travel Guardian 360 - Built with Next.js 15, powered by C++ routing engine</p>
          <p className="text-sm mt-2">🚧 Currently in development</p>
        </div>
      </footer>
    </div>
  );
}
