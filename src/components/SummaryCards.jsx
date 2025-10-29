import React from 'react';
import clsx from 'clsx';

function StatCard({title, value, delta, status}){
  const statusClass = status === 'good' ? 'text-green-600' : status === 'bad' ? 'text-red-600' : 'text-yellow-600';
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className={clsx("text-sm mt-1", statusClass)}>{delta}</div>
    </div>
  );
}

export default function SummaryCards({ metrics, comparisons }){
  // metrics: { people_worked, persondays, avg_wage, women_percent, payments_pending_percent }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <StatCard title="Families worked" value={metrics.people_worked || '-'} delta={comparisons.people_delta_text} status={comparisons.people_status}/>
      <StatCard title="Total workdays" value={metrics.persondays || '-'} delta={comparisons.persondays_delta_text} status={comparisons.persondays_status}/>
      <StatCard title="Avg wage / day" value={metrics.avg_wage ? `₹${metrics.avg_wage}` : '-'} delta={comparisons.wage_delta_text} status={comparisons.wage_status}/>
      <StatCard title="Payments pending" value={metrics.payments_pending_percent ? `${metrics.payments_pending_percent}%` : '-'} delta={comparisons.payments_delta_text} status={comparisons.payments_status}/>
    </div>
  );
}
