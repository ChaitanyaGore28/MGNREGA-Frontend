import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export async function fetchDistricts(){
  return client.get('/districts').then(r => r.data);
}

export async function fetchDistrictMetrics(districtCode, month){
  const q = month ? `?month=${month}` : '';
  return client.get(`/district/${encodeURIComponent(districtCode)}${q}`).then(r => r.data);
}

export async function reverseGeocode(lat, lon){
  return client.get(`/locate?lat=${lat}&lon=${lon}`).then(r => r.data);
}

export default client;
