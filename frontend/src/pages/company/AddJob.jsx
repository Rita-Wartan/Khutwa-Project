import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import CompanyLayout from '../../layouts/company/CompanyLayout';
import './AddJob.css';

const initialValues = { title: '', category: '', description: '', city: '', location: '', salary: '', showSalary: false, jobType: '', jobLevel: '', experience: '' };
const requirementOptions = ['React', 'JavaScript', 'CSS'];

export default function AddJob() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [categories, setCategories] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [requirementInput, setRequirementInput] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);

  useEffect(() => {
    let active = true;
    api.get('/categories')
      .then(({ data }) => { if (active) setCategories(data.categories || []); })
      .catch(() => { if (active) setServerError('تعذر تحميل الأقسام. حاول مرة أخرى.'); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isEditMode) return undefined;
    let active = true;
    api.get(`/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (!active) return;
        const job = data.job;
        setValues({
          title: job.title || '',
          category: job.category?._id || job.category || '',
          description: job.description || '',
          city: job.city || '',
          location: job.location || '',
          salary: job.salary ?? '',
          showSalary: job.showSalary === true,
          jobType: job.jobType || '',
          jobLevel: job.jobLevel || '',
          experience: job.experience || '',
        });
        setRequirements(Array.isArray(job.requirements) ? job.requirements : []);
      })
      .catch(error => {
        if (!active) return;
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          navigate('/company/login', { replace: true });
        } else setServerError(error.response?.data?.message || 'تعذر تحميل بيانات الوظيفة.');
      })
      .finally(() => { if (active) setPageLoading(false); });
    return () => { active = false; };
  }, [id, isEditMode, token, logout, navigate]);

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    setValues(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors(current => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const addRequirement = value => {
    const next = value.trim();
    if (next && !requirements.includes(next)) setRequirements(current => [...current, next]);
    setRequirementInput('');
  };

  const removeRequirement = requirement => setRequirements(current => current.filter(item => item !== requirement));

  const validate = () => {
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = 'المسمى الوظيفي مطلوب';
    if (!values.description.trim()) nextErrors.description = 'وصف الوظيفة مطلوب';
    if (!values.city.trim()) nextErrors.city = 'المدينة مطلوبة';
    if (!values.jobType) nextErrors.jobType = 'نوع العمل مطلوب';
    if (!values.experience) nextErrors.experience = 'الخبرة مطلوبة';
    return nextErrors;
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setServerError('');
    try {
      const payload = { ...values, salary: values.salary === '' ? undefined : Number(values.salary), requirements, category: values.category };
      if (isEditMode) await api.put(`/jobs/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      else await api.post('/jobs', payload, { headers: { Authorization: `Bearer ${token}` } });

      setValues(initialValues);
      setRequirements([]);
      setSuccess(isEditMode ? 'تم تحديث الوظيفة بنجاح' : 'تم نشر الوظيفة بنجاح');
      window.setTimeout(() => navigate(isEditMode ? '/company/jobs' : '/company/dashboard'), 900);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        navigate('/company/login', { replace: true });
      } else setServerError(error.response?.data?.message || 'تعذر حفظ الوظيفة. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const submitLabel = loading ? (isEditMode ? 'جارٍ الحفظ...' : 'جارٍ النشر...') : (isEditMode ? 'حفظ التعديلات' : 'نشر الوظيفة');

  return <CompanyLayout><section className="add-job-page"><div className="add-job-heading"><div><span className="add-job-eyebrow">{isEditMode ? 'تحديث فرصة' : 'فرصة جديدة'}</span><h1>{isEditMode ? 'تعديل الوظيفة' : 'إضافة وظيفة'}</h1><p>{isEditMode ? 'حدّث تفاصيل الوظيفة المنشورة وحافظ على معلوماتها دقيقة.' : 'أضف تفاصيل الوظيفة للوصول إلى المرشحين المناسبين.'}</p></div></div>{success && <div className="add-job-feedback success">{success}</div>}{serverError && <div className="add-job-feedback error">{serverError}</div>}{pageLoading ? <div className="add-job-card add-job-loading">جارٍ تحميل بيانات الوظيفة...</div> : <form className="add-job-card" onSubmit={handleSubmit} noValidate><section className="add-job-section"><div className="add-job-section-title"><span>01</span><div><h2>معلومات الوظيفة</h2><p>اكتب وصفاً واضحاً ومفيداً للمتقدمين.</p></div></div><div className="add-job-grid"><Field label="المسمى الوظيفي" name="title" value={values.title} onChange={handleChange} error={errors.title} required placeholder="مثال: مطور Frontend" /><SelectField label="القسم" name="category" value={values.category} onChange={handleChange} options={categories} placeholder="اختر القسم" /><label className="add-job-field add-job-field-full"><span>وصف الوظيفة <b>*</b></span><textarea name="description" value={values.description} onChange={handleChange} rows="6" placeholder="اكتب تفاصيل الوظيفة والمسؤوليات الأساسية..." />{errors.description && <small>{errors.description}</small>}</label><div className="add-job-field add-job-field-full"><span>متطلبات الوظيفة</span><div className="requirements-input"><input value={requirementInput} onChange={event => setRequirementInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addRequirement(requirementInput); } }} placeholder="أضف مهارة أو متطلباً ثم اضغط إضافة" /><button type="button" onClick={() => addRequirement(requirementInput)}>إضافة</button></div><div className="requirement-chips">{requirements.map(requirement => <span key={requirement}>{requirement}<button type="button" onClick={() => removeRequirement(requirement)} aria-label={`حذف ${requirement}`}>×</button></span>)}</div><div className="requirement-suggestions">{requirementOptions.filter(item => !requirements.includes(item)).map(item => <button type="button" key={item} onClick={() => addRequirement(item)}>+ {item}</button>)}</div></div></div></section><section className="add-job-section"><div className="add-job-section-title"><span>02</span><div><h2>معلومات الموقع</h2><p>حدد مكان وطبيعة العمل.</p></div></div><div className="add-job-grid"><Field label="المدينة" name="city" value={values.city} onChange={handleChange} error={errors.city} required placeholder="مثال: دمشق" /><SelectField label="مكان العمل" name="location" value={values.location} onChange={handleChange} options={['Remote', 'Office', 'Hybrid']} placeholder="اختر مكان العمل" /></div></section><section className="add-job-section"><div className="add-job-section-title"><span>03</span><div><h2>تفاصيل الوظيفة</h2><p>أضف معلومات المستوى والراتب.</p></div></div><div className="add-job-grid"><Field label="الراتب" name="salary" type="number" value={values.salary} onChange={handleChange} placeholder="مثال: 1200" /><label className="add-job-check"><input type="checkbox" name="showSalary" checked={values.showSalary} onChange={handleChange} /><span>إظهار الراتب</span></label><SelectField label="نوع العمل" name="jobType" value={values.jobType} onChange={handleChange} options={['Full Time', 'Part Time', 'Internship', 'Remote']} placeholder="اختر نوع العمل" error={errors.jobType} required /><SelectField label="المستوى الوظيفي" name="jobLevel" value={values.jobLevel} onChange={handleChange} options={['Entry Level', 'Mid Level', 'Senior']} placeholder="اختر المستوى" /><SelectField label="الخبرة" name="experience" value={values.experience} onChange={handleChange} options={['0-1 Years', '2-3 Years', '3-5 Years', '5+ Years']} placeholder="اختر الخبرة" error={errors.experience} required /></div></section><div className="add-job-actions"><button type="button" className="add-job-cancel" onClick={() => navigate(isEditMode ? '/company/jobs' : '/company/dashboard')}>إلغاء</button><button type="submit" className="add-job-submit" disabled={loading}>{submitLabel}<i className="fas fa-arrow-left" /></button></div></form>}</section></CompanyLayout>;
}

function Field({ label, name, value, onChange, error, required, type = 'text', placeholder }) {
  return <label className="add-job-field"><span>{label} {required && <b>*</b>}</span><input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} />{error && <small>{error}</small>}</label>;
}

function SelectField({ label, name, value, onChange, options, placeholder, error, required }) {
  return <label className="add-job-field"><span>{label} {required && <b>*</b>}</span><select name={name} value={value} onChange={onChange}><option value="">{placeholder}</option>{options.map(option => { const optionValue = typeof option === 'string' ? option : option._id; const optionLabel = typeof option === 'string' ? option : option.name; return <option key={optionValue} value={optionValue}>{optionLabel}</option>; })}</select>{error && <small>{error}</small>}</label>;
}
