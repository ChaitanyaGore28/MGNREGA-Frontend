import React, {useEffect, useState} from 'react';
import { fetchDistricts } from '../api/apiClient';

export default function DistrictSelector({ onSelect }){
  const [districts, setDistricts] = useState([]);
  const [value, setValue] = useState('');

  useEffect(()=> {
    let mounted = true;
    fetchDistricts().then(data => {
      if(!mounted) return;
      setDistricts(data || []);
    }).catch(()=>{ /* fallback */ setDistricts([{ code: 'nagpur', name: 'Nagpur' }, { code:'pune', name:'Pune' }]); });
    return ()=> mounted = false;
  }, []);

  return (
    <div className="bg-white p-3 rounded-lg shadow">
      <label className="block text-sm font-medium mb-2">Select District</label>
      <select
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          const sel = districts.find(d => (d.code || d._id || d.name) === e.target.value);
          onSelect(sel);
        }}
        className="w-full border rounded-md p-2"
      >
        <option value="">-- choose district --</option>
        {districts.map(d => {
          const id = d.code || d._id || d.name;
          return <option key={id} value={id}>{d.name}</option>;
        })}
      </select>
    </div>
  );
}
