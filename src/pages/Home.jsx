import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DistrictSelector from '../components/DistrictSelector';

export default function Home(){
  const [selected, setSelected] = useState(null);
  const nav = useNavigate();

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Our Work, Our District</h1>
        <p className="text-sm text-gray-600">Select your district to view MGNREGA performance</p>
      </header>

      <DistrictSelector onSelect={d => setSelected(d)} />

      <div className="mt-4 flex gap-2">
        <button
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
          onClick={() => selected && nav(`/district/${encodeURIComponent(selected.code || selected._id || selected.name)}`)}
        >
          View Performance
        </button>
        <button
          className="bg-white border px-4 py-2 rounded-lg"
          onClick={() => {
            if(!navigator.geolocation){ alert('Geolocation not supported'); return; }
            navigator.geolocation.getCurrentPosition(pos => {
              const { latitude, longitude } = pos.coords;
              // call reverse geocode on backend
              window.fetch(`${import.meta.env.VITE_API_BASE}/locate?lat=${latitude}&lon=${longitude}`)
                .then(r => r.json())
                .then(data => {
                  if(data && data.districtCode) {
                    nav(`/district/${encodeURIComponent(data.districtCode)}`);
                  } else alert('Could not locate district');
                }).catch(()=>alert('Locate error'));
            }, ()=>alert('Permission denied'));
          }}
        >
          Locate me
        </button>
      </div>

      <section className="mt-6 p-4 bg-white rounded-lg shadow">
        <h2 className="font-semibold">About</h2>
        <p className="text-sm text-gray-600 mt-2">This dashboard shows simple MGNREGA metrics for your district. Data comes from government sources and is cached for reliability.</p>
      </section>
    </div>
  );
}
