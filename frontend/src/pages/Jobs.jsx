import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import JobCard from '../components/jobs/JobCard';
import useSavedJobs from '../hooks/useSavedJobs';
import './Jobs.css';

export default function Jobs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isSaved, toggleSaved } = useSavedJobs();

  useEffect(() => {
    let active = true;
    api.get('/jobs')
      .then(({ data }) => { if (active) setJobs(data.jobs || []); })
      .catch(() => { if (active) setError('تعذر تحميل الوظائف حالياً. حاول مرة أخرى.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredJobs = useMemo(() => jobs.filter(job => {
    const categoryName = job.category?.name || '';
    const companyName = job.company?.name || '';
    return `${job.title} ${companyName} ${job.city || ''}`.toLowerCase().includes(query.toLowerCase())
      && (!category || categoryName === category)
      && (!type || job.jobType === type);
  }), [jobs, query, category, type]);

  const categories = [...new Set(jobs.map(job => job.category?.name).filter(Boolean))];
  const types = [...new Set(jobs.map(job => job.jobType).filter(Boolean))];

  return <div className="jobs-page"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><AnnouncementBar /><Header onMenu={() => setSidebarOpen(true)} /><main className="jobs-main"><div className="jobs-heading"><span className="jobs-eyebrow">فرصتك تبدأ بخطوة</span><h1>الوظائف المتاحة</h1><p>اكتشف فرصاً مهنية مميزة تساعدك على بناء مستقبلك بثقة.</p></div><div className="jobs-layout"><aside className="jobs-filters"><div className="filter-title"><i className="fas fa-sliders" /> تصفية النتائج</div><label>ابحث عن وظيفة<input value={query} onChange={event => setQuery(event.target.value)} placeholder="المسمى أو الشركة" /></label><label>القسم<select value={category} onChange={event => setCategory(event.target.value)}><option value="">كل الأقسام</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label><label>نوع العمل<select value={type} onChange={event => setType(event.target.value)}><option value="">كل الأنواع</option>{types.map(item => <option key={item}>{item}</option>)}</select></label><button className="clear-filters" onClick={() => { setQuery(''); setCategory(''); setType(''); }}>مسح الفلاتر</button></aside><section className="jobs-results"><div className="results-top"><div><strong>{filteredJobs.length}</strong> وظيفة متاحة</div><select aria-label="ترتيب النتائج"><option>الأحدث أولاً</option><option>الأقدم أولاً</option></select></div>{loading ? <div className="empty-jobs"><i className="fas fa-spinner fa-spin" /><h2>جارٍ تحميل الوظائف</h2></div> : error ? <div className="empty-jobs"><i className="fas fa-triangle-exclamation" /><h2>{error}</h2></div> : filteredJobs.length ? <div className="job-grid">{filteredJobs.map(job => <JobCard key={job._id} job={job} saved={isSaved(job._id)} onToggle={toggleSaved} />)}</div> : <div className="empty-jobs"><i className="fas fa-search" /><h2>لم نجد وظائف مطابقة</h2><p>جرّب تغيير كلمات البحث أو الفلاتر.</p></div>}</section></div></main><Footer /></div>;
}
