import { useEffect, useState } from "react";
import { api } from "../util";
import UploadScan from "./UploadScan";

export default function Dashboard({ onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await api("/results/");
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 flex flex-col items-center">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-4xl space-y-8">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight">
          🧠 Brain Tumor Detection Dashboard
        </h2>

        <p className="text-center text-gray-500">
          Upload a new scan or view your previous detection results.
        </p>

        <div className="flex justify-center">
          <UploadScan onDone={refresh} />
        </div>

        <hr className="border-gray-200" />

        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Previous Results
        </h3>

        {loading ? (
          <div className="text-center text-gray-500 animate-pulse">
            Loading results...
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500">
            No results yet. Try uploading a scan.
          </p>
        ) : (
          <ul className="grid md:grid-cols-2 gap-4">
            {items.map((r) => (
              <li
                key={r.id}
                className="p-4 bg-gray-50 rounded-xl shadow hover:shadow-lg transition cursor-pointer border border-gray-100 hover:border-indigo-400"
                onClick={() => onSelect(r.id)}
              >
                <h4 className="text-lg font-semibold text-indigo-700">
                  Result #{r.id}
                </h4>
                <p className="text-gray-700 mt-1">
                  <span className="font-medium">Prediction:</span>{" "}
                  {r.predicted_label}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Confidence:</span>{" "}
                  {(r.confidence * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Click to view full details
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
