import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import './Auth.css';

const initialValues = { name: '', email: '', password: '', phone: '', location: '', bio: '', portfolio: '' };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^(https?:\/\/)?([^\s.]+\.)+[^\s]{2,}$/i;

export default function Register() {
  const navigate = useNavigate();
  const { authenticate } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [cvFile, setCvFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = event => {
    const { name, value } = event.target;
    setValues(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = 'الاسم الكامل مطلوب';
    if (!values.email.trim()) nextErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!emailPattern.test(values.email.trim())) nextErrors.email = 'أدخل بريداً إلكترونياً صالحاً';
    if (!values.password) nextErrors.password = 'كلمة المرور مطلوبة';
    if (!values.phone.trim()) nextErrors.phone = 'رقم الهاتف مطلوب';
    if (!values.location.trim()) nextErrors.location = 'الموقع مطلوب';
    if (values.portfolio.trim() && !urlPattern.test(values.portfolio.trim())) nextErrors.portfolio = 'أدخل رابطاً صحيحاً';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setServerError('');
    try {
      const payload = { ...values, cv: cvFile ? { filename: cvFile.name, url: '' } : undefined };
      const { data } = await api.post('/auth/register', payload);
      authenticate(data.token, data.user);
      navigate('/');
    } catch (error) {
      setServerError(error.response?.data?.message || 'تعذر إنشاء الحساب. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="auth-page"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><AnnouncementBar /><Header onMenu={() => setSidebarOpen(true)} /><main className="auth-main"><section className="auth-shell"><div className="auth-copy"><span className="auth-eyebrow">أنشئ ملفك المهني</span><h1>إنشاء حساب</h1><p>أضف معلوماتك الأساسية وسيرتك الذاتية وروابط أعمالك لتكون جاهزاً لفرص التوظيف المقبلة.</p></div><form className="auth-card auth-card-wide" onSubmit={handleSubmit} noValidate><div className="auth-card-header"><h2>إنشاء حساب جديد</h2><p>املأ البيانات التالية لتجهيز ملفك المهني.</p></div><div className="auth-grid"><label className="auth-field"><span>الاسم الكامل</span><div className="auth-input-wrap"><i className="fas fa-user" /><input name="name" value={values.name} onChange={handleChange} autoComplete="name" /></div>{errors.name && <small className="auth-error">{errors.name}</small>}</label><label className="auth-field"><span>البريد الإلكتروني</span><div className="auth-input-wrap"><i className="fas fa-envelope" /><input type="email" name="email" value={values.email} onChange={handleChange} autoComplete="email" placeholder="name@example.com" /></div>{errors.email && <small className="auth-error">{errors.email}</small>}</label><label className="auth-field"><span>كلمة المرور</span><div className="auth-input-wrap"><i className="fas fa-lock" /><input type={showPassword ? 'text' : 'password'} name="password" value={values.password} onChange={handleChange} autoComplete="new-password" placeholder="••••••••" /><button className="auth-toggle" type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}><i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} /></button></div>{errors.password && <small className="auth-error">{errors.password}</small>}</label><label className="auth-field"><span>رقم الهاتف</span><div className="auth-input-wrap"><i className="fas fa-phone" /><input type="tel" name="phone" value={values.phone} onChange={handleChange} autoComplete="tel" /></div>{errors.phone && <small className="auth-error">{errors.phone}</small>}</label><label className="auth-field"><span>الموقع</span><div className="auth-input-wrap"><i className="fas fa-location-dot" /><input name="location" value={values.location} onChange={handleChange} autoComplete="address-level2" /></div>{errors.location && <small className="auth-error">{errors.location}</small>}</label><label className="auth-field auth-field-full"><span>نبذة شخصية</span><div className="auth-input-wrap auth-textarea-wrap"><i className="fas fa-pen-to-square" /><textarea name="bio" value={values.bio} onChange={handleChange} rows="4" /></div></label><label className="auth-field"><span>السيرة الذاتية</span><div className="auth-upload"><input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={event => setCvFile(event.target.files?.[0] || null)} /><div className="auth-upload-box"><i className="fas fa-file-arrow-up" /><span>{cvFile ? cvFile.name : 'اختر ملف CV أو اتركه فارغاً'}</span></div></div><small className="auth-help">الأنواع المدعومة: PDF, DOC, DOCX</small></label><label className="auth-field"><span>رابط معرض الأعمال</span><div className="auth-input-wrap"><i className="fas fa-link" /><input type="url" name="portfolio" value={values.portfolio} onChange={handleChange} placeholder="https://myportfolio.com" autoComplete="url" /></div>{errors.portfolio && <small className="auth-error">{errors.portfolio}</small>}</label></div>{serverError && <div className="auth-error auth-server-error">{serverError}</div>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}</button><p className="auth-switch">لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link></p></form></section></main><Footer /></div>;
}
