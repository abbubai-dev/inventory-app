import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import Defects from "./pages/Defects";
import CheckItem from "./pages/CheckItem";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        >
          <Sidebar onLinkClick={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top navbar */}
          <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-lg font-semibold">Inventory Dashboard</h1>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stockin" element={<StockIn />} />
              <Route path="/stockout" element={<StockOut />} />
              <Route path="/defects" element={<Defects />} />
              <Route path="/check" element={<CheckItem />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
