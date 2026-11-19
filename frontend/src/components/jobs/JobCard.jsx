import { useNavigate } from 'react-router-dom';
import SaveJobButton from './SaveJobButton';

const formatDate = value => value ? new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short' }).format(new Date(value)) : '';

export default function JobCard({ job, saved, onToggle }) {
  const navigate = useNavigate();
  const categoryName = job.category?.name || 'غير مصنف';
  const companyName = job.company?.name || 'شركة غير محددة';

  return <article className="job-card" onClick={() => navigate(`/jobs/${job._id}`)} role="link" tabIndex="0" onKeyDown={event => event.key === 'Enter' && navigate(`/jobs/${job._id}`)}><div className={`job-icon ${job.color || 'purple'}`}><i className={`fas ${job.icon || 'fa-briefcase'}`} /></div><div className="job-card-content"><div className="job-card-top"><span className="job-date">{job.date || formatDate(job.createdAt)}</span><SaveJobButton saved={saved} onToggle={() => onToggle(job._id)} /></div><h2>{job.title}</h2><p className="job-company">{companyName}</p><div className="job-meta"><span><i className="fas fa-location-dot" /> {job.city}</span><span><i className="fas fa-briefcase" /> {job.jobType}</span></div><div className="job-card-bottom"><span className="job-category">{categoryName}</span><button className="job-open-button" aria-label={`عرض وظيفة ${job.title}`} onClick={event => { event.stopPropagation(); navigate(`/jobs/${job._id}`); }}><i className="fas fa-arrow-left" /></button></div></div></article>;
}
