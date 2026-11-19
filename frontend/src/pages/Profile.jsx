import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import './Profile.css';

const editableFields = ['name', 'phone', 'location', 'bio', 'portfolio'];

export default function Profile() {
  const { token, user: authUser, authenticate, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [values, setValues] = useState({ name: '', phone: '', location: '', bio: '', portfolio: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated || authUser?.role !== 'jobseeker') return undefined;

    let active = true;
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/users/profile', { headers: { Authorization: `Bearer ${token}` } });
        if (!active) return;
        setProfile(data.user);
        setValues(current => ({ ...current, ...Object.fromEntries(editableFields.map(field => [field, data.user[field] || ''])) }));
      } catch (requestError) {
        if (!active) return;
        if (requestError.response?.status === 401) {
          logout();
        } else {
          setError(requestError.response?.data?.message || 'تعذر تحميل الملف الشخصي.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProfile();
    return () => { active = false; };
  }, [token, authUser, isAuthenticated, logout]);

  if (!isAuthenticated || authUser?.role !== 'jobseeker') return <Navigate to="/login" replace />;

  const handleChange = event => {
    const { name, value } = event.target;
    setValues(current => ({ ...current, [name]: value }));
    setError('');
    setSuccess('');
  };

  const startEditing = () => {
    setValues(current => ({ ...current, ...Object.fromEntries(editableFields.map(field => [field, profile?.[field] || ''])) }));
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const cancelEditing = () => {
    setEditing(false);
    setValues(current => ({ ...current, ...Object.fromEntries(editableFields.map(field => [field, profile?.[field] || ''])) }));
  };

  const saveProfile = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put('/users/profile', values, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(data.user);
      setValues(current => ({ ...current, ...Object.fromEntries(editableFields.map(field => [field, data.user[field] || ''])) }));
      authenticate(token, data.user);
      setEditing(false);
      setSuccess('تم حفظ التعديلات بنجاح.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'تعذر حفظ التعديلات.');
    } finally {
      setSaving(false);
    }
  };

  return <div className="profile-page"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><AnnouncementBar /><Header onMenu={() => setSidebarOpen(true)} /><main className="profile-main"><div className="profile-heading"><div><span className="profile-eyebrow">ملفي المهني</span><h1>الملف الشخصي</h1><p>راجع معلوماتك المهنية وحدّثها لتبقى جاهزاً للفرص القادمة.</p></div>{!editing && <button className="profile-primary-button" type="button" onClick={startEditing}><i className="fas fa-pen" /> تعديل الملف الشخصي</button>}</div>{loading ? <div className="profile-state">جارٍ تحميل الملف الشخصي...</div> : error && !profile ? <div className="profile-state profile-state-error">{error}</div> : <form className="profile-card" onSubmit={saveProfile}><div className="profile-card-top"><div className="profile-avatar">{(profile?.name || 'م').charAt(0)}</div><div><h2>{profile?.name}</h2><span>{profile?.role === 'jobseeker' ? 'باحث عن عمل' : profile?.role}</span></div></div><div className="profile-fields"><ProfileField label="الاسم" name="name" value={values.name} editing={editing} onChange={handleChange} icon="fa-user" /><ProfileField label="البريد الإلكتروني" value={profile?.email || ''} editing={false} icon="fa-envelope" /><ProfileField label="رقم الهاتف" name="phone" value={values.phone} editing={editing} onChange={handleChange} icon="fa-phone" /><ProfileField label="الموقع" name="location" value={values.location} editing={editing} onChange={handleChange} icon="fa-location-dot" /><ProfileField label="رابط معرض الأعمال" name="portfolio" value={values.portfolio} editing={editing} onChange={handleChange} icon="fa-link" type="url" /><div className="profile-field profile-field-full"><span>نبذة شخصية</span>{editing ? <textarea name="bio" value={values.bio} onChange={handleChange} rows="4" /> : <p>{profile?.bio || 'لم تتم إضافة نبذة شخصية بعد.'}</p>}</div><div className="profile-field profile-field-full"><span>السيرة الذاتية</span><div className="profile-cv">{profile?.cv?.filename ? <><i className="fas fa-file-lines" /><span>{profile.cv.filename}</span>{profile.cv.url && <a href={profile.cv.url} target="_blank" rel="noreferrer">عرض السيرة الذاتية</a>}</> : <small>لم تتم إضافة سيرة ذاتية بعد.</small>}</div></div></div>{error && <div className="profile-feedback profile-feedback-error">{error}</div>}{success && <div className="profile-feedback profile-feedback-success">{success}</div>}{editing && <div className="profile-actions"><button className="profile-secondary-button" type="button" onClick={cancelEditing}>إلغاء</button><button className="profile-primary-button" type="submit" disabled={saving}>{saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</button></div>}</form>}</main><Footer /></div>;
}

function ProfileField({ label, name, value, editing, onChange, icon, type = 'text' }) {
  return <label className="profile-field"><span>{label}</span><div className={`profile-input ${!editing ? 'profile-input-readonly' : ''}`}><i className={`fas ${icon}`} />{editing ? <input type={type} name={name} value={value} onChange={onChange} /> : <p>{value || '—'}</p>}</div></label>;
}
