import { BrowserMultiFormatReader } from "@zxing/library";
import { useEffect, useRef, useState } from "react";
import { Loader2, CameraOff } from "lucide-react";

export default function Scanner({ onDetected }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let mounted = true;

    codeReader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (!mounted) return;

        if (result && result.getText) {
          onDetected(result.getText());
        }

        // Once camera feed is active, stop showing loader
        if (videoRef.current && videoRef.current.readyState >= 2 && loading) {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Scanner start failed:", err);
        setError(true);
        setLoading(false);
      });

    return () => {
      mounted = false;
      try {
        codeReader.reset();
      } catch (e) {}
    };
  }, [onDetected]);

  return (
    <div className="relative bg-gray-100 border border-gray-200 rounded-xl shadow-inner overflow-hidden w-full aspect-[4/3] sm:aspect-[16/9]">
      {/* Video Feed */}
      <video
        ref={videoRef}
        id="video"
        className="w-full h-full object-cover rounded-xl"
        playsInline
        muted
      />

      {/* Loading Overlay */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600 mb-2" />
          <p className="text-gray-700 text-sm">Initializing camera...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <CameraOff className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-gray-700 text-sm">Camera access denied or not available</p>
        </div>
      )}
    </div>
  );
}
