import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import CompanyLayout from '../../../layouts/company/CompanyLayout';
import './CompanyDashboard.css';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [jobsCount, setJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      logout();
      navigate('/company/login', { replace: true });
      return undefined;
    }

    let active = true;
    const headers = { Authorization: `Bearer ${token}` };

    const loadStatistics = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/jobs/company/my-jobs', { headers });
        const jobs = data.jobs || [];
        const applicantResponses = await Promise.all(
          jobs.map(job => api.get(`/applications/job/${job._id}`, { headers }))
        );
        const applicants = applicantResponses.flatMap(({ data: applicantData }) => applicantData.applicants || []);

        if (!active) return;
        setJobsCount(jobs.length);
        setApplicationsCount(applicants.length);
        setPendingCount(applicants.filter(application => application.status === 'pending').length);
        setAcceptedCount(applicants.filter(application => application.status === 'accepted').length);
      } catch (requestError) {
        if (!active) return;
        if (requestError.response?.status === 401 || requestError.response?.status === 403) {
          logout();
          navigate('/company/login', { replace: true });
        } else {
          setError(requestError.response?.data?.message || 'تعذر تحميل إحصائيات الشركة. يرجى المحاولة مرة أخرى.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStatistics();
    return () => { active = false; };
  }, [token, logout, navigate]);

  const statistics = [
    { label: 'عدد الوظائف المنشورة', value: jobsCount, icon: 'fa-briefcase', tone: 'purple' },
    { label: 'طلبات التقديم', value: applicationsCount, icon: 'fa-file-lines', tone: 'orange' },
    { label: 'قيد المراجعة', value: pendingCount, icon: 'fa-clock', tone: 'blue' },
    { label: 'المقبولين', value: acceptedCount, icon: 'fa-user-check', tone: 'green' },
  ];

  return <CompanyLayout><section className="company-dashboard-welcome"><div><span className="company-dashboard-eyebrow">نظرة عامة</span><h1>مرحباً بك في لوحة تحكم الشركة <span>👋</span></h1><p>تابع نشاط شركتك واستعد لبناء فريقك القادم.</p></div><div className="company-welcome-decoration"><i className="fas fa-chart-line" /></div></section>{error && <p role="alert">{error}</p>}<section className="company-stat-grid" aria-label="إحصائيات الشركة">{statistics.map(stat => <article className="company-stat-card" key={stat.label}><div className={`company-stat-icon ${stat.tone}`}><i className={`fas ${stat.icon}`} /></div><div><span>{stat.label}</span><strong>{loading ? '0' : stat.value}</strong></div><i className="fas fa-arrow-up-right-dots company-stat-arrow" /></article>)}</section><section className="company-dashboard-empty"><div className="company-empty-icon"><i className="fas fa-rocket" /></div><h2>ابدأ رحلة التوظيف</h2><p>ستظهر هنا أحدث أنشطة شركتك عند بدء نشر الوظائف واستقبال الطلبات.</p><button type="button" onClick={() => {}}>إضافة وظيفة </button></section></CompanyLayout>;
}
