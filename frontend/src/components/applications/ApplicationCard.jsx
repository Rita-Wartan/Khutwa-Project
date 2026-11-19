import { useNavigate } from 'react-router-dom';
import ApplicationStatusBadge from './ApplicationStatusBadge';

const formatApplicationDate = value => value
  ? new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
  : '—';

export default function ApplicationCard({ application, onWithdraw }) {
  const navigate = useNavigate();
  const job = application.job || {};
  const company = job.company || {};
  const logoUrl = company.logo?.url;
  const logoText = company.name?.charAt(0) || 'K';

  return (
    <article className="application-card">
      <div className="application-card-header">
        <div className="application-company-logo">{logoUrl ? <img src={logoUrl} alt="" /> : logoText}</div>
        <div className="application-heading">
          <span className="application-company-name">{company.name}</span>
          <h3>{job.title}</h3>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>

      <div className="application-card-meta">
        <span><i className="fas fa-location-dot" /> {job.city || '—'}</span>
        <span><i className="fas fa-briefcase" /> {job.jobType || '—'}</span>
        {job.jobLevel ? <span><i className="fas fa-chart-simple" /> {job.jobLevel}</span> : null}
      </div>

      <div className="application-card-footer">
        <span className="application-date">تاريخ التقديم: {formatApplicationDate(application.createdAt)}</span>
        <div className="application-actions">
          <button className="application-view-button" type="button" onClick={() => navigate(`/jobs/${job._id}`)}>
            عرض الوظيفة
          </button>
          {application.status === 'pending' && <button className="application-withdraw-button" type="button" onClick={() => onWithdraw(application)}>
            إلغاء الطلب
          </button>}
        </div>
      </div>
    </article>
  );
}
