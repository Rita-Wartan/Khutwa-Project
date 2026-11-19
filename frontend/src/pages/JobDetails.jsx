import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import SaveJobButton from '../components/jobs/SaveJobButton';
import useSavedJobs from '../hooks/useSavedJobs';
import { useAuth } from '../context/AuthContext';
import './JobDetails.css';
import './ApplicationForm.css';

const formatDate = value => value ? new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) : '—';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [applied, setApplied] = useState(false);
  const [applicationChecked, setApplicationChecked] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applicationSubmitting, setApplicationSubmitting] = useState(false);
  const feedbackTimer = useRef(null);
  const { isSaved, toggleSaved } = useSavedJobs();
  const { token } = useAuth();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.get(`/jobs/${id}`)
      .then(({ data }) => { if (active) setJob(data.job); })
      .catch(requestError => { if (active) setError(requestError.response?.status === 404 ? 'الوظيفة غير موجودة' : 'تعذر تحميل تفاصيل الوظيفة.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (!token) {
      setApplicationChecked(true);
      return undefined;
    }

    let active = true;
    setApplicationChecked(false);
    api.get('/applications/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        const alreadyApplied = (data.applications || []).some(application => {
          const applicationJobId = application.job?._id || application.job?.id || application.job;
          return String(applicationJobId) === String(id);
        });
        if (active) setApplied(alreadyApplied);
      })
      .catch(requestError => {
        if (active && requestError.response?.status === 401) navigate('/login', { replace: true });
      })
      .finally(() => { if (active) setApplicationChecked(true); });

    return () => { active = false; };
  }, [id, navigate, token]);

  useEffect(() => () => {
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
  }, []);

  if (loading) return <PageState sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} title="جارٍ تحميل تفاصيل الوظيفة..." icon="fa-spinner fa-spin" />;
  if (error || !job) return <PageState sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} title={error || 'الوظيفة غير موجودة'} icon="fa-briefcase" action={() => navigate('/jobs')} />;

  const categoryName = job.category?.name || 'غير مصنف';
  const companyName = job.company?.name || 'شركة غير محددة';
  const companyLogo = job.company?.logo?.url;
  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedback(null), 2800);
  };
  const handleApply = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!applied) {
      setFeedback(null);
      setShowApplicationForm(true);
    }
  };

  const handleApplicationSubmit = async event => {
    event.preventDefault();
    setApplicationSubmitting(true);
    setFeedback(null);

    try {
      await api.post('/applications', { job: job._id, coverLetter }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplied(true);
      setShowApplicationForm(false);
      setCoverLetter('');
      showFeedback('تم إرسال طلب التوظيف بنجاح', 'success');
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate('/login');
        return;
      }
      const duplicate = requestError.response?.status === 409 || requestError.response?.data?.message === 'Already applied';
      if (duplicate) setApplied(true);
      showFeedback(duplicate ? 'لقد تقدمت لهذه الوظيفة مسبقاً' : 'تعذر إرسال طلب التوظيف حالياً', duplicate ? 'warning' : 'error');
    } finally {
      setApplicationSubmitting(false);
    }
  };

  return (
    <div className="jobs-page">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AnnouncementBar />
      <Header onMenu={() => setSidebarOpen(true)} />
      <main className="job-details-page">
        <section className="job-details-hero"><div><Link className="job-breadcrumb" to="/jobs">الوظائف المتاحة</Link><span> / تفاصيل الوظيفة</span><h1>اكتشف خطوتك المهنية القادمة</h1><p>فرصة مميزة بانتظارك مع فريق يصنع الفرق.</p></div></section>
        <div className="job-details-layout">
          <div className="job-details-main">
            <div className="job-summary-card"><div className="details-company-logo purple">{companyLogo ? <img src={companyLogo} alt="" /> : companyName.charAt(0)}</div><div className="summary-heading"><span className="job-category">{categoryName}</span><h2>{job.title}</h2><p>{companyName}</p></div><SaveJobButton saved={isSaved(job._id)} onToggle={() => toggleSaved(job._id)} /><div className="summary-meta"><span><i className="fas fa-location-dot" />{job.city}</span><span><i className="fas fa-briefcase" />{job.jobType || '—'}</span><span><i className="fas fa-chart-simple" />{job.jobLevel || '—'}</span><span><i className="fas fa-clock" />{job.experience || '—'}</span>{job.showSalary === true && job.salary !== undefined && <span><i className="fas fa-money-bill-wave" />{job.salary}</span>}<span><i className="fas fa-calendar-day" />{formatDate(job.createdAt)}</span></div></div>
            <section className="details-content-card"><h2><i className="fas fa-file-lines" /> الوصف الوظيفي</h2><p>{job.description}</p></section>
            <section className="details-content-card"><h2><i className="fas fa-list-check" /> متطلبات الوظيفة</h2><ul>{(job.requirements || []).map((requirement, index) => <li key={`${requirement}-${index}`}><i className="fas fa-check" />{requirement}</li>)}</ul></section>
          </div>
          <aside className="apply-card"><span className="apply-label">هل أنت مستعد للخطوة التالية؟</span><h2>ابدأ رحلتك المهنية اليوم</h2><p>قدّم على هذه الوظيفة وكن أقرب إلى فرصتك الجديدة.</p>
            {showApplicationForm && !applied && <form className="application-form" onSubmit={handleApplicationSubmit}><label htmlFor="cover-letter">رسالة تعريفية</label><textarea id="cover-letter" value={coverLetter} onChange={event => setCoverLetter(event.target.value)} placeholder="اكتب رسالة تعريفية (اختياري)" rows="5" /><div className="application-form-actions"><button className="application-form-submit" type="submit" disabled={applicationSubmitting}>{applicationSubmitting ? 'جارٍ الإرسال...' : 'إرسال الطلب'}</button><button className="application-form-cancel" type="button" onClick={() => setShowApplicationForm(false)} disabled={applicationSubmitting}>إلغاء</button></div></form>}
            <button className={`apply-button ${applied ? 'applied' : ''}`} onClick={handleApply} disabled={applied || !applicationChecked}>{applied ? <><i className="fas fa-check" /> تم التقديم</> : <>تقدم الآن <i className="fas fa-arrow-left" /></> }</button>{feedback && <div className={`apply-feedback ${feedback.type}`}>{feedback.message}</div>}<div className="apply-note"><i className="fas fa-shield-halved" /> التقديم الآمن سيكون متاحاً قريباً</div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PageState({ sidebarOpen, setSidebarOpen, title, icon, action }) {
  return <div className="jobs-page"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><AnnouncementBar /><Header onMenu={() => setSidebarOpen(true)} /><main className="job-not-found"><i className={`fas ${icon}`} /><h1>{title}</h1>{action && <><p>عذراً، لم نتمكن من العثور على هذه الفرصة الوظيفية.</p><button onClick={action}>العودة إلى الوظائف</button></>}</main><Footer /></div>;
}
