import { useState } from "react";
import Scanner from "../components/Scanner";
import axios from "axios";
import { API_URL } from "../api";
import { Search, Loader2 } from "lucide-react";

export default function CheckItem() {
  const [barcode, setBarcode] = useState("");
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDetected = (code) => setBarcode(code);

  const handleCheck = async () => {
    if (!barcode) return alert("No barcode scanned");
    setLoading(true);
    setItem(null);
    try {
      const res = await axios.get(`${API_URL}?action=getItem&barcode=${barcode}`);
      setItem(res.data || null);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch item details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">🔍 Check Item</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <h2 className="text-lg font-medium mb-4 text-gray-700">Scan Barcode</h2>
          <div className="w-full border rounded-lg overflow-hidden">
            <Scanner onDetected={handleDetected} />
          </div>
          <p className="mt-3 text-gray-600 text-center">
            Detected:{" "}
            <span className="font-semibold text-blue-600">
              {barcode || "—"}
            </span>
          </p>
        </div>

        {/* Item Details Section */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-medium mb-4 text-gray-700">Item Details</h2>

          <button
            onClick={handleCheck}
            disabled={loading}
            className={`px-5 py-2.5 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition w-full sm:w-auto ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Checking...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" /> Check Item
              </>
            )}
          </button>

          {item && (
            <div className="mt-6 space-y-2 text-gray-700">
              <p><strong>Name:</strong> {item.name}</p>
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Stock:</strong> {item.quantity}</p>
              <p><strong>Min Stock:</strong> {item.minStock}</p>
              <p><strong>Last Updated:</strong> {item.lastUpdate}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
