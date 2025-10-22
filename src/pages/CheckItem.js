import { useState } from "react";
import Scanner from "../components/Scanner";
import { Loader2, AlertCircle } from "lucide-react";

export default function CheckItem() {
  const [scannedCode, setScannedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  const API_URL = "/api";

  // === When barcode detected ===
  const handleDetected = async (code) => {
    if (!code) return;
    setScannedCode(code);
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}?action=getItemByBarcode&barcode=${code}`);
      const data = await res.json();

      if (!data || !data.Barcode) {
        setError("❌ Item not found in stock.");
        setItem(null);
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

  return (
    <div className="p-4 flex flex-col gap-4 max-w-md mx-auto">
      {/* Scanner */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <Loader2 className="animate-spin text-white w-8 h-8" />
          </div>
        )}
        <Scanner onDetected={handleDetected} />
      </div>

      {/* Manual barcode input (optional fallback) */}
      <input
        type="text"
        placeholder="Enter barcode manually"
        value={scannedCode}
        onChange={(e) => setScannedCode(e.target.value)}
        onBlur={() => handleDetected(scannedCode)}
        className="border p-2 rounded w-full"
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Item Details (read-only) */}
      {item && (
        <div className="bg-white shadow-md rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Item Details</h2>
          <div className="grid grid-cols-1 gap-2">
            <input
              type="text"
              placeholder="Barcode"
              value={item.Barcode || scannedCode}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
            <input
              type="text"
              placeholder="Name"
              value={item.Name || ""}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
            <input
              type="text"
              placeholder="Type"
              value={item.Type || ""}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
            <input
              type="text"
              placeholder="Category"
              value={item.Category || ""}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
            <input
              type="number"
              placeholder="Min Stock"
              value={item.MinStock || ""}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
            <input
              type="number"
              placeholder="Current Quantity"
              value={item.Quantity || ""}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
            <input
              type="text"
              placeholder="Created At"
              value={
                item.CreatedAt
                  ? new Date(item.CreatedAt).toLocaleString()
                  : ""
              }
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}