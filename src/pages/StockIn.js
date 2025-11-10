import { useState, useEffect } from "react";
import Scanner from "../components/Scanner";
import { Loader2, CheckCircle } from "lucide-react";

export default function StockIn() {
  const [scannedCode, setScannedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [lastRecord, setLastRecord] = useState(null);
  const [minStockEditable, setMinStockEditable] = useState(true);

  const API_URL = "/api";

  // === When barcode detected ===
  const handleDetected = async (code) => {
  if (!code) return;
  setScannedCode(code);
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}?action=getItemByBarcode&barcode=${code}`);
    const data = await res.json();

    if (!data || Object.keys(data).length === 0) {
      // Item not found — treat as new item
      setItem({
        barcode: code,
        name: "",
        type: "",
        category: "",
        minstock: "",
      });
      setMinStockEditable(true);
    } else {
      // Existing item
      setItem(data);
      setMinStockEditable(false);
    }
  } catch (err) {
    console.error("Error fetching item:", err);
  } finally {
    setLoading(false);
  }
};

  // === Save stock-in ===
  const handleSave = async () => {
    if (!item || !quantity) return alert("Please fill item details and quantity");

    setSaving(true);
    const payload = {
      action: "addStockIn",
      barcode: item.barcode,
      name: item.name,
      type: item.type,
      category: item.category,
      minstock: item.minstock,
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

      {/* Item Form */}
      {item && (
        <div className="bg-white shadow-md rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Item Details</h2>
          <div className="grid grid-cols-1 gap-2">
            <input
              type="text"
              placeholder="Barcode"
              value={item.barcode || scannedCode}
              readOnly
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Name"
              value={item.name || ""}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Type"
              value={item.type || ""}
              onChange={(e) => setItem({ ...item, type: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Category"
              value={item.category || ""}
              onChange={(e) => setItem({ ...item, category: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <input
              type="number"
              placeholder="Min Stock"
              value={item.minstock || ""}
              disabled={!minStockEditable}
              onChange={(e) => setItem({ ...item, minstock: e.target.value })}
              className={`border p-2 rounded w-full ${
                !minStockEditable ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
            <input
              type="number"
              placeholder="Quantity to Add"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white rounded-lg px-4 py-2 w-full flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Save Stock-In
              </>
            )}
          </button>
        </div>
      )}

      {/* Last Saved Record */}
      {lastRecord && (
        <div className="bg-gray-50 border rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-2">
            Last Saved Record
          </h3>
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
