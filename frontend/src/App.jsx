import { useState } from "react";
import { Search, CheckCircle, AlertCircle, Shield } from "lucide-react";

import Card from "./components/Card";
import Input from "./components/Input";
import Stat from "./components/Stat";
import RiskMeter from "./components/RiskMeter";

export default function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scan = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:5000/scan?url=${encodeURIComponent(url)}`
      );

      if (!res.ok) throw new Error("Scan failed");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to scan URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) scan();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Card>
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">
                Link Analyzer
              </h1>
              <p className="text-sm text-slate-400">
                Check link safety in seconds
              </p>
            </div>
          </div>

          {/* INPUT */}
          <div className="flex gap-3">
            <Input
              placeholder="Paste suspicious link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />

            <button
              onClick={scan}
              disabled={loading}
              className="px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl font-semibold flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Scan
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <p className="mt-4 text-sky-300 text-sm">Scanning link…</p>
          )}

          {/* RESULT */}
          {result && !loading && (
            <div className="mt-6 space-y-6">
              <RiskMeter score={result.risk || 0} />

              <div
                className={`p-4 rounded-lg border ${
                  result.risk < 30
                    ? "bg-green-500/10 border-green-500/30"
                    : result.risk < 60
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <p className="font-semibold">
                  {result.status || "Scan complete"}
                </p>
              </div>

              {result.details && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.details).map(([key, value]) => (
                    <Stat
                      key={key}
                      label={key.replace(/_/g, " ").toUpperCase()}
                      value={value}
                    />
                  ))}
                </div>
              )}
              {result.explanations && (
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="font-semibold mb-2">Why this link is risky</p>

                  {result.explanations.map((e, i) => (
                    <p key={i} className="text-sm text-slate-300">
                      • {e}
                    </p>
                  ))}
                </div>
              )}
              {result.explanations?.map((e,i)=>(
                <Stat key={i} label="Reason" value={e}/>
              ))}

            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
