import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [dashboardStatistics, setDashboardStatistics] = useState({ users: 0, jobseekers: 0, companies: 0, jobs: 0, applications: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      logout();
      navigate('/admin/login', { replace: true });
      return undefined;
    }

    let active = true;
    api.get('/admin/statistics', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (active) setDashboardStatistics(data.statistics || {});
      })
      .catch(requestError => {
        if (!active) return;
        if (requestError.response?.status === 401 || requestError.response?.status === 403) {
          logout();
          navigate('/admin/login', { replace: true });
        } else {
          setError('تعذر تحميل إحصائيات لوحة التحكم');
        }
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [token, logout, navigate]);

  const statistics = [
    { label: 'إجمالي المستخدمين', value: dashboardStatistics.users, icon: 'fa-users', tone: 'purple' },
    { label: 'الباحثون عن عمل', value: dashboardStatistics.jobseekers, icon: 'fa-user', tone: 'orange' },
    { label: 'الشركات', value: dashboardStatistics.companies, icon: 'fa-building', tone: 'blue' },
    { label: 'الوظائف المنشورة', value: dashboardStatistics.jobs, icon: 'fa-briefcase', tone: 'green' },
    { label: 'طلبات التقديم', value: dashboardStatistics.applications, icon: 'fa-file-lines', tone: 'purple' },
  ];

  return <section className="admin-dashboard-page"><section className="admin-dashboard-welcome"><div><span className="admin-dashboard-eyebrow">نظرة عامة</span><h1>مرحباً بك في لوحة تحكم الإدارة 👋</h1><p>تابع نشاط منصة خطوة وإدارة المستخدمين والوظائف من مكان واحد.</p></div><div className="admin-welcome-decoration"><i className="fas fa-chart-line" /></div></section>{error && <p className="admin-dashboard-error" role="alert">{error}</p>}<section className="admin-stat-grid" aria-label="إحصائيات المنصة">{statistics.map(stat => <article className="admin-stat-card" key={stat.label}><div className={`admin-stat-icon ${stat.tone}`}><i className={`fas ${stat.icon}`} /></div><div><span>{stat.label}</span><strong>{loading ? 'جارٍ تحميل الإحصائيات...' : stat.value}</strong></div><i className="fas fa-arrow-up-right-dots admin-stat-arrow" /></article>)}</section><section className="admin-recent-activity"><div className="admin-section-heading"><div><span>متابعة المنصة</span><h2>آخر النشاطات</h2></div><i className="fas fa-clock-rotate-left" /></div><div className="admin-activity-empty"><div className="admin-empty-icon"><i className="fas fa-inbox" /></div><p>ستظهر آخر نشاطات المنصة هنا</p></div></section></section>;
}
