import { useState } from "react";
import Scanner from "../components/Scanner";
import axios from "axios";
import { API_URL } from "../api";
import { CheckCircle, Loader2 } from "lucide-react";

export default function Defects() {
  const [barcode, setBarcode] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDetected = (code) => setBarcode(code);

  const handleSave = async () => {
    if (!barcode) return alert("No barcode scanned");
    if (!desc.trim()) return alert("Please enter defect description");

    setLoading(true);
    try {
      await axios.post(API_URL, {
        action: "defect",
        barcode,
        description: desc,
        user: "WebUser",
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setBarcode("");
      setDesc("");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">🛠 Record Defects</h1>

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

        {/* Details Section */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-medium mb-4 text-gray-700">Defect Details</h2>

          <label className="block text-gray-600 mb-2">Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full h-28 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
            placeholder="Describe the defect..."
          />

          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Saving...
                </>
              ) : (
                "Save Defect"
              )}
            </button>

            {success && (
              <div className="flex items-center mt-4 text-green-600 font-medium">
                <CheckCircle className="w-5 h-5 mr-2" /> Defect recorded!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
