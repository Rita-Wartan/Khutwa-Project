import axios from 'axios';

const api = axios.create({
  baseURL: 'https://khutwa-project-oayv.vercel.app/api',
  headers: { 'Content-Type': 'application/json' },
});

export default api;
