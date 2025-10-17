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
import { RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, transRes] = await Promise.all([
        fetch(
          "https://script.google.com/macros/s/AKfycbxPCh3ANaZAl_kc2StbF19scMAyKDzQZv2n746FvVGHTJk3urIltB3qn59HNEUY4_ZQ/exec?action=getItems"
        ).then((r) => r.json()),
        fetch(
          "https://script.google.com/macros/s/AKfycbxPCh3ANaZAl_kc2StbF19scMAyKDzQZv2n746FvVGHTJk3urIltB3qn59HNEUY4_ZQ/exec?action=getTransactions"
        ).then((r) => r.json()),
      ]);
      setItems(itemsRes || []);
      setTransactions(transRes || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalItems = items.length;
  const stockInToday = transactions.filter((t) => t.Type === "in").length;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">📦 Inventory Dashboard</h1>
        <button
          onClick={fetchData}
          className="bg-white p-2 rounded-full shadow hover:bg-blue-50 transition"
        >
          <RefreshCw
            className={`w-5 h-5 ${loading ? "animate-spin text-blue-500" : "text-gray-500"}`}
          />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-gray-500 text-sm">Total Items</h2>
          <p className="text-3xl font-bold text-blue-600">{totalItems}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-gray-500 text-sm">Stock-in Today</h2>
          <p className="text-3xl font-bold text-green-600">{stockInToday}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Top 5 Items</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={items.slice(0, 5)}>
                <Bar dataKey="quantity" fill="#3b82f6" />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">Stock Distribution</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Food", value: 40 },
                    { name: "Non-Food", value: 60 },
                  ]}
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-sm font-semibold mb-3 text-gray-700">
          Recent Activity / Logs
        </h2>
        <ul className="text-sm text-gray-600 space-y-1 max-h-64 overflow-y-auto">
          {transactions.slice(-8).reverse().map((t, idx) => (
            <li key={idx}>
              ➡️ <strong>{t.Timestamp}</strong> → {t.Type}{" "}
              <span className="font-medium text-blue-600">{t.ItemName}</span> (
              {t.Quantity}) by <span className="text-gray-800">{t.User}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
