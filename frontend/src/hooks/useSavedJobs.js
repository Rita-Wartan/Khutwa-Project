import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'khutwa-saved-jobs';
const normalizeId = id => String(id ?? '');
const readSaved = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').map(normalizeId).filter(Boolean); } catch { return []; } };

export default function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState(readSaved);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(savedJobs)); }, [savedJobs]);
  const toggleSaved = useCallback(id => setSavedJobs(current => { const normalizedId = normalizeId(id); return current.includes(normalizedId) ? current.filter(item => item !== normalizedId) : [...current, normalizedId]; }), []);
  return { savedJobs, isSaved: id => savedJobs.includes(normalizeId(id)), toggleSaved };
}
