import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement, PointElement, CategoryScale, LinearScale, Tooltip
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

export default function TrendChart({ dataPoints = [] }){
  // dataPoints: [{ month: '2024-04', value: 12000 }, ...]
  const labels = dataPoints.map(d => d.month);
  const data = {
    labels,
    datasets: [
      {
        label: 'Workdays',
        data: dataPoints.map(d => d.value),
        tension: 0.3,
        fill: false,
      }
    ]
  };
  const options = {
    plugins: { legend: { display: false } },
    scales: { x: { display: true }, y: { display: true } },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow h-48">
      <h4 className="font-medium mb-2">Workdays over time</h4>
      <Line data={data} options={options} />
    </div>
  );
}
