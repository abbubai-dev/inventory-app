import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { RefreshCw, Loader2 } from "lucide-react"; // Added Loader2 for spinners
import logo from "../logo_PKPDKK.png";

// Helper function for timeout handling
const fetchWithTimeout = async (url, options, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(url, {
    ...options,
    signal: controller.signal  // Connect the abort signal
  });
  
  clearTimeout(id); // Clear the timeout if fetch finishes successfully
  return response;
};

// ===== Summary Card Component =====
function SummaryCard({ title, value, color }) {
  return (
    // Added a transition and fade-in utility class (opacity-100 duration-500)
    <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-all opacity-100 duration-500">
      <h2 className="text-gray-500 text-sm mb-1">{title}</h2>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true); // Set initial loading to true

  // === Fetch data from Netlify proxy with retry and timeout ===
  const fetchData = async (retries = 3) => {
    setLoading(true);
    try {
      // Use the helper fetchWithTimeout function
      const itemsRes = await fetchWithTimeout("/.netlify/functions/proxy?action=getItems");
      const transRes = await fetchWithTimeout("/.netlify/functions/proxy?action=getTransactions");

      if (!itemsRes.ok || !transRes.ok) {
        throw new Error("Network response was not ok");
      }

      const itemsData = await itemsRes.json();
      const transData = await transRes.json();

      setItems(itemsData || []);
      setTransactions(transData || []);

    } catch (err) {
      console.error(`❌ Failed to load data. Retries left: ${retries - 1}`, err.name);
      
      // Implement retry logic
      if (retries > 0 && err.name !== 'AbortError') { // Don't retry on timeout
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        await fetchData(retries - 1);
        return; // Exit here to prevent finally block from running yet
      }

      if (err.name === 'AbortError') {
          alert("Data fetch request timed out.");
      } else {
          alert("Failed to load dashboard data after multiple attempts.");
      }
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ======= COMPUTE SUMMARY DATA (remains the same) =======
  const totalItems = items.length;
  const totalStock = items.reduce(
    (sum, i) => sum + (parseInt(i.Quantity) || 0),
    0
  );
  const totalIn = transactions.filter((t) => t.Type === "in").length;
  const totalOut = transactions.filter((t) => t.Type === "out").length;
  const totalDefects = transactions.filter((t) => t.Type === "defect").length;

  // ======= TOP ITEMS (Bar Chart) (remains the same) =======
  const topItems = [...items]
    .sort((a, b) => (parseInt(b.Quantity) || 0) - (parseInt(a.Quantity) || 0))
    .slice(0, 5);

  // ======= STOCK BY CATEGORY (Pie Chart) (remains the same) =======
  const categoryMap = items.reduce((acc, item) => {
    const cat = item.Category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + (parseInt(item.Quantity) || 0);
    return acc;
  }, {});
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-MY", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // A spinner component for when charts/lists are empty/loading
  const DataSpinner = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-56 py-10 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  );

  return (
    // Added a global fade-in class to the main container
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen transition-opacity opacity-100 duration-500">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="KK Logo" className="w-12 h-12 rounded-lg shadow" />
          <h1 className="text-2xl font-semibold text-gray-800">
            Inventory KK Dashboard
          </h1>
        </div>
        <button
          onClick={fetchData}
          className="bg-white p-2 rounded-full shadow hover:bg-blue-50 transition"
          disabled={loading} // Disable button while loading
        >
          <RefreshCw
            className={`w-5 h-5 ${
              loading ? "animate-spin text-blue-500" : "text-gray-500"
            }`}
          />
        </button>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <SummaryCard title="Total Items" value={totalItems} color="text-blue-600" />
        <SummaryCard title="Total Stock" value={totalStock} color="text-purple-600" />
        <SummaryCard title="Stock In" value={totalIn} color="text-green-600" />
        <SummaryCard title="Stock Out" value={totalOut} color="text-red-600" />
        <SummaryCard title="Defects" value={totalDefects} color="text-yellow-600" />
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Top Items Chart */}
        <div className="bg-white rounded-xl shadow p-4 transition-opacity opacity-100 duration-500">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">
            Top 5 Items by Quantity
          </h2>
          {loading ? (
            <DataSpinner message="Loading chart data..." />
          ) : topItems.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems}>
                  <Tooltip />
                  <Legend />
                  {/* Assuming you want XAxis and YAxis for a functional bar chart */}
                  {/* <XAxis dataKey="name" /> */}
                  {/* <YAxis /> */}
                  <Bar dataKey="Quantity" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <DataSpinner message="No item data available" />
          )}
        </div>

        {/* Stock Distribution Chart */}
        <div className="bg-white rounded-xl shadow p-4 transition-opacity opacity-100 duration-500">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">
            Stock Distribution by Category
          </h2>
          {loading ? (
             <DataSpinner message="Loading chart data..." />
          ) : pieData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"][
                            i % 5
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <DataSpinner message="No category data available" />
          )}
        </div>
      </div>

      {/* ===== RECENT ACTIVITY ===== */}
      <div className="bg-white rounded-xl shadow p-4 transition-opacity opacity-100 duration-500">
        <h2 className="text-sm font-semibold mb-3 text-gray-700">
          Recent Activity / Logs
        </h2>
        {loading ? (
          <DataSpinner message="Loading transaction logs..." />
        ) : transactions.length > 0 ? (
          <ul className="text-sm text-gray-600 space-y-1 max-h-64 overflow-y-auto">
            {transactions
              .slice(-10)
              .reverse()
              .map((t, idx) => (
                <li key={idx} className="p-1 rounded hover:bg-gray-50">
                  ➡️ <strong>{formatDate(t.Timestamp)}</strong> →{" "}
                  <span
                    className={`font-medium ${
                      t.Type === "in"
                        ? "text-green-600"
                        : t.Type === "out"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {t.Type.toUpperCase()}
                  </span>{" "}
                  <span className="font-medium text-blue-600">
                    {t.ItemName || t.Barcode}
                  </span>{" "}
                  ({t.Quantity}) by{" "}
                  <span className="text-gray-800">{t.User}</span>
                </li>
              ))}
          </ul>
        ) : (
          <DataSpinner message="No transactions recorded" />
        )}
      </div>
    </div>
  );
}
