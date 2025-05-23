import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Sports club data
const attendanceData = [
  { name: "Jan", training: 120, matches: 85 },
  { name: "Feb", training: 135, matches: 92 },
  { name: "Mar", training: 148, matches: 78 },
  { name: "Apr", training: 165, matches: 105 },
  { name: "May", training: 152, matches: 115 },
  { name: "Jun", training: 180, matches: 130 }
];

const membershipData = [
  { name: "Q1", total: 420, active: 320 },
  { name: "Q2", total: 580, active: 450 },
  { name: "Q3", total: 650, active: 520 },
  { name: "Q4", total: 820, active: 680 }
];

const sportsData = [
  { name: "Football", value: 45 },
  { name: "Basketball", value: 25 },
  { name: "Tennis", value: 15 },
  { name: "Swimming", value: 10 },
  { name: "Athletics", value: 5 }
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const upcomingEvents = [
  { name: "Summer Tournament", date: "2023-07-15", sport: "Football" },
  { name: "Junior League Finals", date: "2023-07-22", sport: "Basketball" },
  { name: "Annual Swim Meet", date: "2023-08-05", sport: "Swimming" }
];

const recentMatches = [
  { home: "FC Panthers", away: "United Lions", score: "3-2", date: "2023-06-28" },
  { home: "Shooting Stars", away: "Thunderbolts", score: "1-1", date: "2023-06-25" },
  { home: "Wave Riders", away: "Ocean Kings", score: "0-3", date: "2023-06-22" }
];

// Simple card component
const Card = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
    {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
    {children}
  </div>
);

// Button component
const Button = ({ children, className = "", ...props }) => (
  <button
    className={`px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

const SportsClubDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-2xl font-bold text-gray-800">Sports Club Dashboard</h1>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm p-4 hidden md:block">
          <nav>
            <ul className="space-y-2">
              <li><a href="#" className="block px-4 py-2 rounded-md bg-blue-50 text-blue-600 font-medium">Dashboard</a></li>
              <li><a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">Teams</a></li>
              <li><a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">Players</a></li>
              <li><a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">Events</a></li>
              <li><a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">Members</a></li>
              <li><a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">Competitions</a></li>
              <li><a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">Reports</a></li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Button className="flex flex-col items-center h-24 justify-center gap-2">
              <span className="text-2xl">⚽</span>
              <span>Teams</span>
            </Button>
            <Button className="flex flex-col items-center h-24 justify-center gap-2">
              <span className="text-2xl">👥</span>
              <span>Players</span>
            </Button>
            <Button className="flex flex-col items-center h-24 justify-center gap-2">
              <span className="text-2xl">📅</span>
              <span>Events</span>
            </Button>
            <Button className="flex flex-col items-center h-24 justify-center gap-2">
              <span className="text-2xl">🎟️</span>
              <span>Members</span>
            </Button>
            <Button className="flex flex-col items-center h-24 justify-center gap-2">
              <span className="text-2xl">🏆</span>
              <span>Competitions</span>
            </Button>
            <Button className="flex flex-col items-center h-24 justify-center gap-2">
              <span className="text-2xl">📊</span>
              <span>Reports</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500">Total Members</h4>
                <span className="text-2xl">👥</span>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">824</p>
                <p className="text-xs text-gray-500">+12% from last quarter</p>
              </div>
            </Card>
            <Card>
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500">Active Teams</h4>
                <span className="text-2xl">⚽</span>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">28</p>
                <p className="text-xs text-gray-500">+3 this season</p>
              </div>
            </Card>
            <Card>
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500">Upcoming Events</h4>
                <span className="text-2xl">📅</span>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">7</p>
                <p className="text-xs text-gray-500">2 this week</p>
              </div>
            </Card>
            <Card>
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500">Renewals Due</h4>
                <span className="text-2xl">🔄</span>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
            {/* Attendance Chart */}
            <Card className="col-span-4">
              <h3 className="text-lg font-semibold mb-3">Attendance Overview</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="training" fill="#3b82f6" name="Training Sessions" />
                    <Bar dataKey="matches" fill="#10b981" name="Matches" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Sports Distribution */}
            <Card className="col-span-3">
              <h3 className="text-lg font-semibold mb-3">Sports Participation</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sportsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {sportsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Second Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
            {/* Membership Growth */}
            <Card className="col-span-4">
              <h3 className="text-lg font-semibold mb-3">Membership Growth</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={membershipData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total Members" />
                    <Line type="monotone" dataKey="active" stroke="#10b981" name="Active Players" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Upcoming Events */}
            <Card className="col-span-3">
              <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-gray-500">
                        {event.sport} • {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button className="text-sm" size="sm">
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Matches */}
          <Card>
            <h3 className="text-lg font-semibold mb-3">Recent Match Results</h3>
            <div className="space-y-4">
              {recentMatches.map((match, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 text-right font-medium">{match.home}</div>
                  <div className="w-24 text-center px-2 py-1 bg-gray-100 rounded-md mx-2 font-bold">
                    {match.score}
                  </div>
                  <div className="flex-1 font-medium">{match.away}</div>
                  <div className="ml-4 text-sm text-gray-500">
                    {new Date(match.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default SportsClubDashboard;