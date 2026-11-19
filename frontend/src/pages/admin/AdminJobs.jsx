import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './AdminJobs.css';

const formatDate = value => value ? new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) : '—';

export default function AdminJobs() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const handleUnauthorized = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  useEffect(() => {
    if (!token) {
      handleUnauthorized();
      return undefined;
    }

    let active = true;
    api.get('/admin/jobs', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { if (active) setJobs(data.jobs || []); })
      .catch(requestError => {
        if (!active) return;
        if (requestError.response?.status === 401) handleUnauthorized();
        else if (requestError.response?.status === 403) setError('ليس لديك صلاحية إدارة الوظائف');
        else setError('تعذر تحميل الوظائف');
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [token]);

  const handleDelete = async job => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return;

    setDeletingId(job._id);
    setError('');
    try {
      await api.delete(`/admin/jobs/${job._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setJobs(current => current.filter(item => item._id !== job._id));
    } catch (requestError) {
      if (requestError.response?.status === 401) handleUnauthorized();
      else if (requestError.response?.status === 403) setError(requestError.response?.data?.message || 'ليس لديك صلاحية حذف هذه الوظيفة');
      else setError(requestError.response?.data?.message || 'تعذر حذف الوظيفة');
    } finally {
      setDeletingId('');
    }
  };

  return <section className="admin-jobs-page"><div className="admin-jobs-heading"><div><span className="admin-jobs-eyebrow">إدارة فرص العمل</span><h1>إدارة الوظائف</h1><p>عرض وإدارة جميع الوظائف المنشورة على منصة خطوة.</p></div><div className="admin-jobs-count"><strong>{jobs.length}</strong><span>وظيفة</span></div></div>{error && <div className="admin-jobs-feedback" role="alert">{error}</div>}{loading ? <div className="admin-jobs-state"><i className="fas fa-spinner fa-spin" /><p>جارٍ تحميل الوظائف...</p></div> : jobs.length === 0 ? <div className="admin-jobs-state"><div className="admin-jobs-empty-icon"><i className="fas fa-briefcase" /></div><p>لا توجد وظائف منشورة حالياً</p></div> : <div className="admin-jobs-table-wrap"><table className="admin-jobs-table"><thead><tr><th>عنوان الوظيفة</th><th>الشركة</th><th>التصنيف</th><th>المدينة</th><th>نوع العمل</th><th>المستوى</th><th>تاريخ النشر</th><th>الإجراءات</th></tr></thead><tbody>{jobs.map(job => <tr key={job._id}><td data-label="عنوان الوظيفة">{job.title || '—'}</td><td data-label="الشركة">{job.company?.name || '—'}</td><td data-label="التصنيف">{job.category?.name || '—'}</td><td data-label="المدينة">{job.city || '—'}</td><td data-label="نوع العمل">{job.jobType || '—'}</td><td data-label="المستوى">{job.jobLevel || '—'}</td><td data-label="تاريخ النشر">{formatDate(job.createdAt)}</td><td data-label="الإجراءات"><button type="button" className="admin-job-delete" disabled={deletingId === job._id} onClick={() => handleDelete(job)}>{deletingId === job._id ? 'جارٍ الحذف...' : 'حذف'}</button></td></tr>)}</tbody></table></div>}</section>;
}
