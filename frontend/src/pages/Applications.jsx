import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ApplicationCard from '../components/applications/ApplicationCard';
import ApplicationsEmptyState from '../components/applications/ApplicationsEmptyState';
import WithdrawApplicationModal from '../components/applications/WithdrawApplicationModal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Applications.css';

export default function Applications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return undefined;
    }

    let active = true;
    setLoading(true);
    api.get('/applications/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (active) setApplications(data.applications || []);
      })
      .catch(requestError => {
        if (!active) return;
        if (requestError.response?.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        setError('تعذر تحميل طلبات التوظيف حالياً. حاول مرة أخرى.');
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [logout, navigate, token]);

  const counts = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(application => application.status === 'pending').length,
    accepted: applications.filter(application => application.status === 'accepted').length,
    rejected: applications.filter(application => application.status === 'rejected').length,
  }), [applications]);

  const countLabel =
    counts.total === 0
      ? 'لا توجد طلبات توظيف حتى الآن'
      : counts.total === 1
        ? 'لديك 1 طلب توظيف'
        : `لديك ${counts.total} طلبات توظيف`;

  const handleWithdraw = async () => {
    if (!selectedApplication) {
      return;
    }

    try {
      await api.delete(`/applications/${selectedApplication._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(current => current.filter(application => application._id !== selectedApplication._id));
      setSelectedApplication(null);
      setFeedback('تم إلغاء الطلب بنجاح');
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setFeedback('تعذر إلغاء الطلب حالياً. حاول مرة أخرى.');
    }
  };

  return (
    <div className="applications-page">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AnnouncementBar />
      <Header onMenu={() => setSidebarOpen(true)} />
      <main className="applications-main">
        <section className="applications-hero">
          <div className="applications-hero-content">
            <span className="applications-eyebrow">متابعة طلباتك المهنية</span>
            <h1>الوظائف المتقدم عليها</h1>
            <p>تابع طلبات التوظيف التي قمت بإرسالها وحالة كل طلب من مكان واحد.</p>
          </div>
        </section>

        <section className="applications-summary">
          <div className="applications-summary-lead">
            <h2>{countLabel}</h2>
           
          </div>
          <div className="applications-summary-grid">
            <article className="applications-summary-card">
              <span>إجمالي الطلبات</span>
              <strong>{counts.total}</strong>
            </article>
            <article className="applications-summary-card">
              <span>قيد المراجعة</span>
              <strong>{counts.pending}</strong>
            </article>
            <article className="applications-summary-card">
              <span>مقبولة / مرفوضة</span>
              <strong>{counts.accepted + counts.rejected}</strong>
            </article>
          </div>
        </section>

        {loading ? (
          <section className="applications-empty"><div className="applications-empty-icon"><i className="fas fa-spinner fa-spin" /></div><h2>جارٍ تحميل الطلبات...</h2></section>
        ) : error ? (
          <section className="applications-empty"><div className="applications-empty-icon"><i className="fas fa-circle-exclamation" /></div><h2>{error}</h2></section>
        ) : applications.length ? (
          <section className="applications-grid">
            {applications.map(application => (
              <ApplicationCard
                key={application._id}
                application={application}
                onWithdraw={setSelectedApplication}
              />
            ))}
          </section>
        ) : (
          <ApplicationsEmptyState />
        )}
      </main>
      <Footer />
      <WithdrawApplicationModal
        open={Boolean(selectedApplication)}
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onConfirm={handleWithdraw}
      />
      {feedback && <div className="apply-feedback success">{feedback}</div>}
    </div>
  );
}
