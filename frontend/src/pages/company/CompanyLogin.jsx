import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import AnnouncementBar from '../../components/AnnouncementBar';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import './CompanyAuth.css';

export default function CompanyLogin() {
  const navigate = useNavigate();
  const { authenticate } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [values, setValues] = useState({ email: '', password: '' });
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
    if (!values.email.trim()) nextErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) nextErrors.email = 'أدخل بريداً إلكترونياً صالحاً';
    if (!values.password) nextErrors.password = 'كلمة المرور مطلوبة';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const { data } = await api.post('/company/login', values);
      authenticate(data.token, data.company);
      navigate('/company/dashboard');
    } catch (error) {
      setServerError(error.response?.data?.message || 'تعذر تسجيل دخول الشركة. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="auth-page company-auth-page"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><AnnouncementBar /><Header onMenu={() => setSidebarOpen(true)} /><main className="auth-main"><section className="auth-shell company-auth-shell"><div className="auth-copy"><span className="auth-eyebrow">بوابة الشركات</span><h1>تسجيل دخول الشركة</h1><p>أدر فرصك الوظيفية وتواصل مع المواهب المناسبة عبر حساب شركتك في خطوة.</p></div><form className="auth-card company-auth-card" onSubmit={handleSubmit} noValidate><div className="auth-card-header"><h2>تسجيل دخول الشركة</h2><p>أدخل بيانات حساب شركتك للمتابعة.</p></div><label className="auth-field"><span>البريد الإلكتروني</span><div className="auth-input-wrap"><i className="fas fa-envelope" /><input type="email" name="email" value={values.email} onChange={handleChange} autoComplete="email" placeholder="company@example.com" /></div>{errors.email && <small className="auth-error">{errors.email}</small>}</label><label className="auth-field"><span>كلمة المرور</span><div className="auth-input-wrap"><i className="fas fa-lock" /><input type={showPassword ? 'text' : 'password'} name="password" value={values.password} onChange={handleChange} autoComplete="current-password" placeholder="••••••••" /><button className="auth-toggle" type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}><i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} /></button></div>{errors.password && <small className="auth-error">{errors.password}</small>}</label>{serverError && <div className="auth-error auth-server-error">{serverError}</div>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل دخول الشركة'}</button><p className="auth-switch">ليس لديك حساب شركة؟ <Link to="/company/register">إنشاء حساب</Link></p></form></section></main><Footer /></div>;
}
