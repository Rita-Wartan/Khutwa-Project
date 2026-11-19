import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import CompanyLayout from '../../layouts/company/CompanyLayout';
import './MyJobs.css';
import './MyJobsEdit.css';

const formatDate = value => value ? new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) : '—';

export default function MyJobs() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/jobs/company/my-jobs', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { if (active) setJobs(data.jobs || []); })
      .catch(requestError => {
        if (!active) return;
        if (requestError.response?.status === 401 || requestError.response?.status === 403) {
          logout();
          navigate('/company/login', { replace: true });
        } else setError(requestError.response?.data?.message || 'تعذر تحميل الوظائف.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, logout, navigate]);

  const handleDelete = async job => {
    if (!window.confirm(`هل أنت متأكد من حذف وظيفة "${job.title}"؟`)) return;
    setDeletingId(job._id);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/jobs/${job._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setJobs(current => current.filter(item => item._id !== job._id));
      setSuccess('تم حذف الوظيفة بنجاح.');
    } catch (requestError) {
      if (requestError.response?.status === 401 || requestError.response?.status === 403) {
        logout();
        navigate('/company/login', { replace: true });
      } else setError(requestError.response?.data?.message || 'تعذر حذف الوظيفة.');
    } finally {
      setDeletingId('');
    }
  };

  return <CompanyLayout><section className="my-jobs-page"><div className="my-jobs-heading"><div><span className="my-jobs-eyebrow">إدارة فرصك</span><h1>وظائفي</h1><p>تابع الوظائف التي نشرتها شركتك من مكان واحد.</p></div><button className="my-jobs-add-button" type="button" onClick={() => navigate('/company/jobs/create')}><i className="fas fa-plus" /> إضافة وظيفة</button></div>{success && <div className="my-jobs-feedback success">{success}</div>}{error && <div className="my-jobs-feedback error">{error}</div>}{loading ? <div className="my-jobs-state"><i className="fas fa-spinner fa-spin" /><h2>جارٍ تحميل الوظائف</h2></div> : jobs.length === 0 ? <div className="my-jobs-state"><div className="my-jobs-empty-icon"><i className="fas fa-briefcase" /></div><h2>لا توجد وظائف منشورة بعد</h2><p>ابدأ بنشر أول وظيفة للوصول إلى المرشحين المناسبين.</p><button className="my-jobs-add-button" type="button" onClick={() => navigate('/company/jobs/create')}>نشر وظيفة جديدة</button></div> : <div className="my-jobs-grid">{jobs.map(job => <JobItem key={job._id} job={job} deleting={deletingId === job._id} onDelete={handleDelete} />)}</div>}</section></CompanyLayout>;
}

function JobItem({ job, deleting, onDelete }) {
  const navigate = useNavigate();
  const categoryName = job.category?.name || 'غير مصنف';
  return <article className="my-job-card"><div className="my-job-card-header"><div className="my-job-icon"><i className="fas fa-briefcase" /></div><div><h2>{job.title}</h2><span>{categoryName}</span></div><span className="my-job-status">منشورة</span></div><div className="my-job-meta"><span><i className="fas fa-location-dot" /> {job.city || '—'}</span><span><i className="fas fa-map-location-dot" /> {job.location || '—'}</span><span><i className="fas fa-clock" /> {job.jobType || '—'}</span><span><i className="fas fa-layer-group" /> {job.jobLevel || '—'}</span><span><i className="fas fa-chart-simple" /> {job.experience || '—'}</span>{job.showSalary === true && <span><i className="fas fa-money-bill-wave" /> {job.salary ?? '—'}</span>}</div><div className="my-job-card-footer"><span><i className="fas fa-calendar-day" /> نُشرت في {formatDate(job.createdAt)}</span><div className="my-job-actions"><button className="my-job-delete my-job-edit" type="button" onClick={() => navigate(`/company/jobs/edit/${job._id}`)}><i className="fas fa-pen" /> تعديل</button><button className="my-job-delete" type="button" disabled={deleting} onClick={() => onDelete(job)}><i className="fas fa-trash" /> {deleting ? 'جارٍ الحذف...' : 'حذف'}</button></div></div></article>;
}
