import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import CompanyLayout from '../../layouts/company/CompanyLayout';
import './Applicants.css';

const statusLabels = {
  pending: 'قيد المراجعة',
  accepted: 'تم القبول',
  rejected: 'مرفوض',
};

export default function Applicants() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUnauthorized = () => {
    logout();
    navigate('/company/login', { replace: true });
  };

  useEffect(() => {
    if (!token) {
      handleUnauthorized();
      return undefined;
    }

    let active = true;
    api.get('/jobs/company/my-jobs', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (!active) return;
        const nextJobs = data.jobs || [];
        setJobs(nextJobs);
        setSelectedJobId(nextJobs[0]?._id || '');
      })
      .catch(requestError => {
        if (!active) return;
        if (requestError.response?.status === 401 || requestError.response?.status === 403) handleUnauthorized();
        else setError(requestError.response?.data?.message || 'تعذر تحميل وظائف الشركة.');
      })
      .finally(() => { if (active) setLoadingJobs(false); });

    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (!token || !selectedJobId) {
      setApplicants([]);
      return undefined;
    }

    let active = true;
    setLoadingApplicants(true);
    setError('');
    api.get(`/applications/job/${selectedJobId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { if (active) setApplicants(data.applicants || []); })
      .catch(requestError => {
        if (!active) return;
        if (requestError.response?.status === 401) handleUnauthorized();
        else if (requestError.response?.status === 403) setError('ليس لديك صلاحية عرض متقدمي هذه الوظيفة.');
        else setError(requestError.response?.data?.message || 'تعذر تحميل المتقدمين.');
      })
      .finally(() => { if (active) setLoadingApplicants(false); });

    return () => { active = false; };
  }, [selectedJobId, token]);

  const updateStatus = async (applicationId, status) => {
    setUpdatingId(applicationId);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put(`/applications/${applicationId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplicants(current => current.map(application => application._id === applicationId ? (data.application || { ...application, status }) : application));
      setSuccess('تم تحديث حالة الطلب');
    } catch (requestError) {
      if (requestError.response?.status === 401) handleUnauthorized();
      else if (requestError.response?.status === 403) setError('ليس لديك صلاحية تحديث هذا الطلب.');
      else setError(requestError.response?.data?.message || 'تعذر تحديث حالة الطلب.');
    } finally {
      setUpdatingId('');
    }
  };

  const selectedJob = jobs.find(job => job._id === selectedJobId);

  return (
    <CompanyLayout>
      <section className="applicants-page">
        <div className="applicants-heading">
          <div><span className="applicants-eyebrow">إدارة المرشحين</span><h1>المتقدمون</h1><p>راجع طلبات التوظيف واختر المرشحين المناسبين لفريقك.</p></div>
        </div>
        {success && <div className="applicants-feedback success">{success}</div>}
        {error && <div className="applicants-feedback error">{error}</div>}
        {loadingJobs ? <div className="applicants-state"><i className="fas fa-spinner fa-spin" /><h2>جارٍ تحميل الوظائف...</h2></div> : jobs.length === 0 ? <div className="applicants-state"><div className="applicants-state-icon"><i className="fas fa-briefcase" /></div><h2>لا توجد وظائف منشورة</h2><p>انشر وظيفة أولاً لتبدأ باستقبال طلبات التوظيف.</p></div> : <div className="applicants-layout">
          <aside className="applicants-jobs-panel"><div className="applicants-panel-title"><h2>وظائفك</h2><span>{jobs.length}</span></div><div className="applicants-job-list">{jobs.map(job => <button className={`applicants-job-option ${job._id === selectedJobId ? 'active' : ''}`} type="button" key={job._id} onClick={() => setSelectedJobId(job._id)}><span className="applicants-job-icon"><i className="fas fa-briefcase" /></span><span><strong>{job.title}</strong><small>{job.category?.name || 'غير مصنف'}</small></span>{job._id === selectedJobId && <i className="fas fa-chevron-left" />}</button>)}</div></aside>
          <section className="applicants-results"><div className="applicants-results-heading"><div><span>طلبات الوظيفة</span><h2>{selectedJob?.title}</h2></div><strong>{applicants.length} متقدم</strong></div>{loadingApplicants ? <div className="applicants-state"><i className="fas fa-spinner fa-spin" /><h2>جارٍ تحميل المتقدمين...</h2></div> : applicants.length === 0 ? <div className="applicants-state compact"><div className="applicants-state-icon"><i className="fas fa-users" /></div><h2>لا يوجد متقدمون لهذه الوظيفة</h2></div> : <div className="applicants-list">{applicants.map(application => <ApplicantCard key={application._id} application={application} updating={updatingId === application._id} onUpdate={updateStatus} />)}</div>}</section>
        </div>}
      </section>
    </CompanyLayout>
  );
}

function ApplicantCard({ application, updating, onUpdate }) {
  const applicant = application.user || {};
  const cv = applicant.cv;
  return <article className="applicant-card"><div className="applicant-card-header"><div className="applicant-avatar">{(applicant.name || 'م').charAt(0)}</div><div><h3>{applicant.name || 'متقدم بدون اسم'}</h3><span className="applicant-status">{statusLabels[application.status] || statusLabels.pending}</span></div></div><div className="applicant-info"><span><i className="fas fa-envelope" />{applicant.email || '—'}</span><span><i className="fas fa-phone" />{applicant.phone || '—'}</span><span><i className="fas fa-location-dot" />{applicant.location || '—'}</span></div><div className="applicant-cover-letter"><strong>رسالة تعريفية</strong><p>{application.coverLetter || 'لم يضف المتقدم رسالة تعريفية.'}</p></div>{applicant.portfolio && <a className="applicant-cv" href={applicant.portfolio} target="_blank" rel="noreferrer"><i className="fas fa-globe" /> عرض Portfolio</a>}{cv?.filename && <div className="applicant-cv"><i className="fas fa-file-lines" /> CV: {cv.filename}</div>}{cv?.url && <a className="applicant-cv" href={cv.url} target="_blank" rel="noreferrer"><i className="fas fa-file-arrow-down" /> تحميل السيرة الذاتية</a>}{application.status === 'pending' && <div className="applicant-actions"><button type="button" className="applicant-accept" disabled={updating} onClick={() => onUpdate(application._id, 'accepted')}><i className="fas fa-check" /> قبول</button><button type="button" className="applicant-reject" disabled={updating} onClick={() => onUpdate(application._id, 'rejected')}><i className="fas fa-xmark" /> رفض</button></div>}</article>;
}
