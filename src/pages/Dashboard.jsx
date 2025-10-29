// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// <-- Update these imports if your component paths differ -->
import SummaryCards from "../components/SummaryCards";
import InsightsText from "../components/InsightsText";
import TrendChart from "../components/TrendChart";

// Local static mock (Option A)
import sample from "../mocks/sampleDistrict.json";

/**
 * Dashboard page (mock-mode)
 * - Uses sample JSON from src/mocks/sampleDistrict.json
 * - If a route param `:code` exists (like /district/nagpur) we display it in the header.
 * - Replace sample with fetchDistrictMetrics() later when backend is ready.
 */
export default function Dashboard() {
  const { code } = useParams(); // optional route param
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({});
  const [comparisons, setComparisons] = useState({});
  const [summary, setSummary] = useState("");
  const [trend, setTrend] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Simulate immediate fetch using the static sample file (Option A)
    // In future: replace with real API call: fetchDistrictMetrics(code)
    setLoading(true);

    // Small timeout to simulate network delay and allow loading UI
    const t = setTimeout(() => {
      const data = sample;
      setMetrics(data.metrics || {});
      setComparisons(data.comparisons || {});
      setSummary(data.summary || "");
      setTrend(data.trend || []);
      setLastUpdated(data.lastUpdated || null);
      setLoading(false);
    }, 250);

    return () => clearTimeout(t);
  }, [code]);

  function handleListen() {
    // Simple browser TTS (reads the one-line summary)
    if (!summary) return;
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(summary);
      // optional: set voice or lang e.g., utter.lang = 'hi-IN';
      window.speechSynthesis.cancel(); // stop any previous
      window.speechSynthesis.speak(utter);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="loader mb-3" />
          <div className="text-gray-600">Loading district data…</div>
        </div>
      </div>
    );
  }

  // Fallback name: if route param exists, show it, else use sample name if available
  const districtDisplayName = code ? decodeURIComponent(code) : (sample?.districtName || "Sample District");

  return (
    <div className="h-full w-screen p-10 mx-auto">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">District: <span className="text-blue-700">{districtDisplayName}</span></h1>
          <p className="text-sm text-gray-600 mt-1">Simple MGNREGA performance snapshot — plain language & visual summary.</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-gray-500">Last updated</div>
          <div className="text-sm font-medium text-gray-700">{lastUpdated ? new Date(lastUpdated).toLocaleString() : "N/A"}</div>
        </div>
      </header>

      <main className="space-y-4">
        {/* Top summary sentence + listen button */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <div className="text-sm text-gray-700">
              {summary || "No summary available."}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleListen}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
              aria-label="Listen to summary"
            >
              Listen
            </button>

            <Link to="/" className="bg-white border px-3 py-2 rounded-lg text-sm text-gray-700">
              ← Back
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <section>
          <SummaryCards metrics={metrics} comparisons={comparisons} />
        </section>

        {/* Insights text */}
        <section>
          <InsightsText summary={summary} />
        </section>

        {/* Trend chart */}
        <section>
          <TrendChart dataPoints={trend} />
        </section>

        {/* Small help / action */}
        <section className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">What to do with this data</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Share this report with your Panchayat officer or local NGO.</li>
            <li>If payments are pending, ask the local office for a status update.</li>
            <li>Use the "Back" button to check other districts.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
