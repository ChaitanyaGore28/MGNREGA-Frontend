import React from 'react';

export default function InsightsText({ summary }) {
  // summary: plain-language string
  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <h3 className="font-semibold">Summary</h3>
      <p className="text-sm text-gray-700 mt-2">{summary}</p>
    </div>
  );
}
