import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import CompanyLayout from '../../../layouts/company/CompanyLayout';
import './CompanyProfile.css';

const editableFields = ['name', 'phone', 'location', 'website', 'description'];

export default function CompanyProfile() {
  const navigate = useNavigate();
  const { token, user: authUser, authenticate, logout } = useAuth();
  const [company, setCompany] = useState(null);
  const [values, setValues] = useState({ name: '', phone: '', location: '', website: '', description: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    const loadCompany = async () => {
      try {
        const { data } = await api.get('/company/profile', { headers: { Authorization: `Bearer ${token}` } });
        if (!active) return;
        setCompany(data.company);
        setValues(current => ({ ...current, ...Object.fromEntries(editableFields.map(field => [field, data.company[field] || ''])) }));
      } catch (requestError) {
        if (!active) return;
        if (requestError.response?.status === 401) {
          logout();
          navigate('/company/login', { replace: true });
        } else {
          setError(requestError.response?.data?.message || 'تعذر تحميل ملف الشركة.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCompany();
    return () => { active = false; };
  }, [token, logout, navigate]);

  const handleChange = event => {
    const { name, value } = event.target;
    setValues(current => ({ ...current, [name]: value }));
    setError('');
    setSuccess('');
  };

  const startEditing = () => {
    setValues(current => ({ ...current, ...Object.fromEntries(editableFields.map(field => [field, company?.[field] || ''])) }));
    setEditing(true);
    setSuccess('');
  };

  const cancelEditing = () => {
    setEditing(false);
    setValues(current => ({ ...current, ...Object.fromEntries(editableFields.map(field => [field, company?.[field] || ''])) }));
  };

  const saveProfile = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put('/company/profile', { ...values, logo: company?.logo }, { headers: { Authorization: `Bearer ${token}` } });
      setCompany(data.company);
      setValues(current => ({ ...current, ...Object.fromEntries(editableFields.map(field => [field, data.company[field] || ''])) }));
      authenticate(token, data.company);
      setEditing(false);
      setSuccess('تم حفظ تعديلات ملف الشركة بنجاح.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'تعذر حفظ التعديلات.');
    } finally {
      setSaving(false);
    }
  };

  return <CompanyLayout><section className="company-profile-page"><div className="company-profile-heading"><div><span className="company-profile-eyebrow">هوية الشركة</span><h1>ملف الشركة</h1><p>اعرض معلومات شركتك وحدّثها لتظهر بصورة احترافية.</p></div>{!editing && <button className="company-profile-primary" type="button" onClick={startEditing}><i className="fas fa-pen" /> تعديل الملف الشخصي</button>}</div>{loading ? <div className="company-profile-state">جارٍ تحميل ملف الشركة...</div> : error && !company ? <div className="company-profile-state company-profile-error">{error}</div> : <form className="company-profile-card" onSubmit={saveProfile}><div className="company-profile-identity"><div className="company-profile-logo">{company?.logo?.url ? <img src={company.logo.url} alt="شعار الشركة" /> : <span>{(company?.name || 'ش').charAt(0)}</span>}</div><div><h2>{company?.name}</h2><p>{company?.email}</p>{company?.logo?.filename && <small><i className="fas fa-image" /> {company.logo.filename}</small>}</div></div><div className="company-profile-fields"><CompanyField label="اسم الشركة" name="name" value={values.name} editing={editing} onChange={handleChange} icon="fa-building" /><CompanyField label="البريد الإلكتروني" value={company?.email || authUser?.email || ''} icon="fa-envelope" /><CompanyField label="رقم الهاتف" name="phone" value={values.phone} editing={editing} onChange={handleChange} icon="fa-phone" /><CompanyField label="الموقع" name="location" value={values.location} editing={editing} onChange={handleChange} icon="fa-location-dot" /><CompanyField label="الموقع الإلكتروني" name="website" value={values.website} editing={editing} onChange={handleChange} icon="fa-globe" type="url" link={!editing} /><div className="company-profile-field company-profile-field-full"><span>وصف الشركة</span>{editing ? <textarea name="description" value={values.description} onChange={handleChange} rows="5" /> : <p>{company?.description || 'لم تتم إضافة وصف للشركة بعد.'}</p>}</div></div>{error && <div className="company-profile-feedback company-profile-error">{error}</div>}{success && <div className="company-profile-feedback company-profile-success">{success}</div>}{editing && <div className="company-profile-actions"><button className="company-profile-secondary" type="button" onClick={cancelEditing}>إلغاء</button><button className="company-profile-primary" type="submit" disabled={saving}>{saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</button></div>}</form>}</section></CompanyLayout>;
}

function CompanyField({ label, name, value, editing, onChange, icon, type = 'text', link = false }) {
  return <label className="company-profile-field"><span>{label}</span><div className={`company-profile-input ${!editing ? 'readonly' : ''}`}><i className={`fas ${icon}`} />{editing ? <input type={type} name={name} value={value} onChange={onChange} /> : link && value ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer">{value}</a> : <p>{value || '—'}</p>}</div></label>;
}
