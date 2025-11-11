import { useState } from "react";
import Scanner from "../components/Scanner";
import { Loader2, AlertCircle, Search } from "lucide-react";

export default function CheckItem() {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  const API_URL = "/api";

  // === Fetch item by barcode ===
  const fetchItem = async (code) => {
    if (!code) {
      setError("Please enter or scan a barcode.");
      return;
    }

    setLoading(true);
    setError("");
    setItem(null);

    try {
      const res = await fetch(`${API_URL}?action=getItemByBarcode&barcode=${code}`);
      const data = await res.json();

      if (!data || !data.Barcode) {
        setError("❌ Item not found in stock.");
      } else {
        setItem(data);
      }
    } catch (err) {
      console.error("Error fetching item:", err);
      setError("⚠️ Failed to fetch item details.");
    } finally {
      setLoading(false);
    }
  };

  // === When barcode detected from scanner ===
  const handleDetected = (code) => {
    setBarcode(code);
    fetchItem(code);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-gray-800 text-center">
        🔍 Check Item Details
      </h1>

      {/* Scanner Section */}
      <div className="relative border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
        <Scanner onDetected={handleDetected} />
      </div>

      {/* Manual Input + Fetch Button */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter barcode manually"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => fetchItem(barcode)}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg flex items-center justify-center gap-1 transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Fetch</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Item Details Card */}
      {item && (
        <div className="bg-white rounded-xl shadow-md p-4 space-y-2 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-1">Item Details</h2>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div><strong>Barcode:</strong> {item.Barcode}</div>
            <div><strong>Name:</strong> {item.Name}</div>
            <div><strong>Type:</strong> {item.Type}</div>
            <div><strong>Category:</strong> {item.Category}</div>
            <div><strong>Min Stock:</strong> {item.MinStock}</div>
            <div><strong>Quantity:</strong> {item.Quantity}</div>
            <div>
              <strong>Created At:</strong>{" "}
              {item.CreatedAt ? new Date(item.CreatedAt).toLocaleString() : "-"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
