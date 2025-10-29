// src/pages/Dashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Chart imports (we draw the chart here for full control)
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import SummaryCards from "../components/SummaryCards";
import InsightsText from "../components/InsightsText";

// Local static mock (Option A)
import sample from "../mocks/sampleDistrict.json";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Filler, Legend);

/**
 * Dashboard page (mock-mode)
 * - Builds a colored Chart.js line chart inline to ensure consistent colors
 * - Safely exports PDF by cloning DOM and replacing the chart canvas with an image
 */
export default function Dashboard() {
  const { code } = useParams(); // optional route param
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({});
  const [comparisons, setComparisons] = useState({});
  const [summary, setSummary] = useState("");
  const [trend, setTrend] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // chart ref so we can export its image
  const chartRef = useRef(null);

  useEffect(() => {
    // Simulated fetch (mock)
    setLoading(true);
    const t = setTimeout(() => {
      const data = sample;
      setMetrics(data.metrics || {});
      setComparisons(data.comparisons || {});
      // Ensure there is a space in the sample summary text if it was concatenated
      const fixedSummary = (data.summary || "").replace(/(\d)(families)/g, "$1 $2");
      setSummary(fixedSummary || "");
      setTrend(data.trend || []);
      setLastUpdated(data.lastUpdated || null);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [code]);

  function handleListen(lang = "en-IN") {
    if (!summary) return;
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(summary);
      utter.lang = lang;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  }

  // Build Chart.js data and options from trend array
  const chartData = {
    labels: trend.map((d) => d.month),
    datasets: [
      {
        label: "Workdays",
        data: trend.map((d) => d.value),
        fill: true,
        backgroundColor: "rgba(37,99,235,0.08)", // blue translucent fill
        borderColor: "#2563eb", // blue line
        pointBackgroundColor: "#1d4ed8",
        pointRadius: 4,
        tension: 0.35,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0, autoSkip: true },
      },
      y: {
        grid: { color: "#eef2f7" },
        ticks: {
          callback: (val) => {
            try {
              return new Intl.NumberFormat("en-IN").format(val);
            } catch {
              return val;
            }
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  // -----------------------
  // PDF generation: Inject temporary CSS override to replace modern colors
  // with safe rgb/hex colors, clone, replace the chart canvas with an image,
  // capture, then cleanup.
  // -----------------------
  async function downloadReport() {
    const orig = document.querySelector("#report-root");
    if (!orig) {
      alert("Report element not found.");
      return;
    }

    setIsGeneratingPdf(true);

    // inject style override to avoid modern color parsing issues
    const styleId = "pdf-capture-override";
    const existing = document.getElementById(styleId);
    if (existing) existing.remove();

    const overrideCss = `
      /* Reset for PDF capture */
      #report-root, #report-root * {
        color: #111 !important;
        background: transparent !important;
        background-color: #ffffff !important;
        border-color: #ddd !important;
        box-shadow: none !important;
        text-shadow: none !important;
        filter: none !important;
      }
      #report-root button, #report-root a {
        background: #ffffff !important;
        color: #111 !important;
        border: 1px solid #ccc !important;
      }
      #report-root .bg-white {
        background-color: #ffffff !important;
        box-shadow: none !important;
        border: 1px solid #e5e7eb !important;
      }
      #report-root svg { fill: #111 !important; stroke: #111 !important; }
      #report-root img { max-width: 100% !important; height: auto !important; }
      /* readable base font for PDF */
      #report-root { font-family: Arial, Helvetica, sans-serif !important; font-size: 12pt !important; line-height: 1.4 !important; }
    `;
    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.type = "text/css";
    styleEl.appendChild(document.createTextNode(overrideCss));
    document.head.appendChild(styleEl);

    // Create offscreen container and clone DOM
    const clone = orig.cloneNode(true);
    const off = document.createElement("div");
    off.style.position = "fixed";
    off.style.left = "-9999px";
    off.style.top = "0";
    off.style.width = orig.offsetWidth + "px";
    off.style.background = "#ffffff";
    off.style.padding = "10px";
    off.style.boxSizing = "border-box";
    off.appendChild(clone);
    document.body.appendChild(off);

    // Replace chart canvas in clone with image snapshot of live chart
    try {
      // Wait a frame
      await new Promise((res) => requestAnimationFrame(res));

      // Get live chart image from chartRef
      let chartImageDataUrl = null;
      try {
        // react-chartjs-2 exposes chart instance on ref.current
        if (chartRef && chartRef.current) {
          // chartRef.current.chartInstance or chartRef.current depending on version
          const chartInstance = chartRef.current?.canvas ? chartRef.current : chartRef.current?.chartInstance || chartRef.current;
          // Prefer toBase64Image if available
          if (chartInstance && typeof chartInstance.toBase64Image === "function") {
            chartImageDataUrl = chartInstance.toBase64Image();
          } else if (chartRef.current?.canvas?.toDataURL) {
            chartImageDataUrl = chartRef.current.canvas.toDataURL("image/png");
          } else {
            // as a fallback, locate the live canvas on the page
            const liveCanvas = document.querySelector("#report-root canvas");
            if (liveCanvas && typeof liveCanvas.toDataURL === "function") {
              chartImageDataUrl = liveCanvas.toDataURL("image/png");
            }
          }
        }
      } catch (err) {
        console.warn("Could not get chart image from ref:", err);
      }

      // In the clone, find a canvas and swap with image (if we have one)
      if (chartImageDataUrl) {
        const cloneCanvas = clone.querySelector("canvas");
        if (cloneCanvas && cloneCanvas.parentNode) {
          const img = document.createElement("img");
          img.src = chartImageDataUrl;
          img.style.width = cloneCanvas.style.width || cloneCanvas.width + "px";
          img.style.height = cloneCanvas.style.height || cloneCanvas.height + "px";
          // preserve responsive width
          img.style.maxWidth = "100%";
          cloneCanvas.parentNode.replaceChild(img, cloneCanvas);
        }
      }

      // Now capture clone with html2canvas
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
      });

      const imgData = canvas.toDataURL("image/png");
      // Use landscape A4 to allow wider chart to fit better
      const pdf = new jsPDF("landscape", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const districtDisplayName = code ? decodeURIComponent(code) : sample?.districtName || "district_report";
      pdf.save(`${districtDisplayName}_report.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Try refreshing the page or use browser Print.");
    } finally {
      // cleanup
      if (off && off.parentNode) off.parentNode.removeChild(off);
      const s = document.getElementById(styleId);
      if (s) s.parentNode.removeChild(s);
      setIsGeneratingPdf(false);
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

  const districtDisplayName = code ? decodeURIComponent(code) : sample?.districtName || "Sample District";

  const lastUpdatedText = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <div className="h-full w-screen p-10 mx-auto">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            District: <span className="text-blue-700">{districtDisplayName}</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Simple MGNREGA performance snapshot — plain language & visual summary.</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-gray-500">Last updated</div>
          <div className="text-sm font-medium text-gray-700">{lastUpdatedText}</div>
        </div>
      </header>

      {/* Wrap the content you want captured into #report-root */}
      <div id="report-root">
        <main className="space-y-4">
          {/* Top summary sentence + listen button */}
          <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <div className="text-sm text-gray-700">{summary || "No summary available."}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleListen("en-IN")}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                aria-label="Listen to summary in English"
              >
                Listen
              </button>

              <button
                onClick={() => handleListen("hi-IN")}
                className="bg-blue-50 text-blue-700 border px-3 py-2 rounded-lg text-sm hover:bg-blue-100"
                aria-label="Listen to summary in Hindi"
              >
                सुनें
              </button>

              <button
                onClick={downloadReport}
                className={`px-3 py-2 rounded-lg text-sm ${isGeneratingPdf ? "bg-gray-400 text-gray-800" : "bg-green-600 text-white hover:bg-green-700"}`}
                aria-label="Download district report as PDF"
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? "Generating..." : "Download PDF"}
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

          {/* Trend chart (inline here for full control) */}
          <section className="bg-white p-4 rounded-lg shadow h-64">
            <h3 className="font-semibold mb-3">Workdays over time</h3>
            <div className="w-full h-48">
              <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>
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
    </div>
  );
}
