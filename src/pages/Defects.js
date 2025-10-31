import { useState, useEffect } from "react";
import Scanner from "../components/Scanner";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export default function Defects() {
  const [scannedCode, setScannedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [lastRecord, setLastRecord] = useState(null);

  const API_URL = "/api"; // Netlify proxy endpoint

  // === Fetch item by barcode ===
  const handleDetected = async (code) => {
    if (!code) return;
    setScannedCode(code);
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}?action=getItemByBarcode&barcode=${code}`);
      const data = await res.json();

      if (!data || !data.Barcode) {
        setError("Item is not in the stock");
        setItem(null);
      } else {
        // Optional: Show warning if current stock is already low
        if (data.Stock < data.MinStock) {
          setError(`Warning: Stock for this item is below the minimum required amount (${data.MinStock})`);
        }
        setItem(data);
      }
    } catch (err) {
      console.error("Error fetching item:", err);
      setError("Error fetching item data");
    } finally {
      setLoading(false);
    }
  };

  // === Save defect record ===
  const handleSave = async () => {
    if (!item) return alert("No item selected");
    if (!quantity) return alert("Please enter quantity");
    if (Number(quantity) > Number(item.Stock || 0))
      return alert("Quantity exceeds available stock!");

    // Calculate the new stock level
    const newStock = Number(item.Stock || 0) - Number(quantity);

    // Check if new stock is below MinStock
    if (newStock < Number(item.MinStock || 0)) {
        // Changed alert to a warning message, as defects are required actions
        const confirm = window.confirm(
            `Warning: This action will put the item below its minimum stock level of ${item.MinStock}. Do you wish to continue?`
        );
        if (!confirm) return;
    }

    setSaving(true);
    const payload = {
      action: "defect",
      barcode: item.Barcode,
      quantity: Number(quantity),
      user: "Admin",
    };

    try {
      await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      setQuantity("");
      setItem(null);
      setScannedCode("");
      await loadLastRecord();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save defect record.");
    } finally {
      setSaving(false);
    }
  };

  // === Load last transaction ===
  const loadLastRecord = async () => {
    try {
      const res = await fetch(`${API_URL}?action=getLastTransaction`);
      const data = await res.json();
      setLastRecord(data);
    } catch (err) {
      console.error("Error loading last record:", err);
    }
  };

  useEffect(() => {
    loadLastRecord();
  }, []);

  // === UI ===
  return (
    <div className="p-4 flex flex-col gap-4 max-w-md mx-auto">
      {/* Manual Barcode Entry */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Enter barcode manually"
          value={scannedCode}
          onChange={(e) => setScannedCode(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={() => handleDetected(scannedCode)}
          className="bg-blue-600 text-white px-3 rounded"
        >
          Fetch
        </button>
      </div>

      {/* Scanner */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <Loader2 className="animate-spin text-white w-8 h-8" />
          </div>
        )}
        <Scanner onDetected={handleDetected} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 rounded-md p-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Item Details */}
      {item && (
        <div className="bg-white shadow-md rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Item Details</h2>
          <div className="grid grid-cols-1 gap-2">
            <input
              type="text"
              value={item.Barcode || scannedCode}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
            <input
              type="text"
              value={item.Name || ""}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
            <input
              type="text"
              value={item.Type || ""}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
            <input
              type="text"
              value={item.Category || ""}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Defect quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <span className="text-sm text-gray-600">
                / Max: {item.Stock || 0}
              </span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-yellow-600 text-white rounded-lg px-4 py-2 w-full flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Save Defect
              </>
            )}
          </button>
        </div>
      )}

      {/* Last Saved Record */}
      {lastRecord && (
        <div className="bg-gray-50 border rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Last Saved Record</h3>
          <p className="text-sm text-gray-600">
            <strong>Barcode:</strong> {lastRecord.ItemID || "-"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>User:</strong> {lastRecord.User}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Type:</strong> {lastRecord.Type}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Quantity:</strong> {lastRecord.Quantity}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Time:</strong>{" "}
            {new Date(lastRecord.Timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
