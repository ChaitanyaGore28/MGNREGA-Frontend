// src/components/SummaryCards.jsx
import React from "react";

// Helper: format numbers safely with Indian commas
const fmtNum = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "-";
  return new Intl.NumberFormat("en-IN").format(n);
};

export default function SummaryCards({ metrics = {}, comparisons = {} }) {
  const cards = [
    {
      title: "Families worked",
      value: metrics.people_worked,
      delta: comparisons.people_delta_text,
      status: comparisons.people_status,
    },
    {
      title: "Total workdays",
      value: metrics.persondays,
      delta: comparisons.persondays_delta_text,
      status: comparisons.persondays_status,
    },
    {
      title: "Avg wage / day",
      value: metrics.avg_wage,
      prefix: "₹",
      delta: comparisons.wage_delta_text,
      status: comparisons.wage_status,
    },
    {
      title: "Payments pending",
      value: metrics.payments_pending_percent,
      suffix: "%",
      delta: comparisons.payments_delta_text,
      status: comparisons.payments_status,
    },
  ];

  const getColor = (status) => {
    if (status === "good") return "text-green-600";
    if (status === "bad") return "text-red-600";
    return "text-gray-700";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border p-4 flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="text-lg font-semibold text-gray-800 mb-1">{card.title}</div>
            <div className="text-3xl font-extrabold text-gray-900">
              {card.prefix || ""}
              {fmtNum(card.value)}
              {card.suffix || ""}
            </div>
          </div>

          <div className={`mt-2 text-sm font-medium ${getColor(card.status)}`}>
            {card.delta || "-"}
          </div>
        </div>
      ))}
    </div>
  );
}
