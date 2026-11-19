import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import './Auth.css';

export default function Login() {
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
    setServerError('');
    try {
      const { data } = await api.post('/auth/login', values);
      authenticate(data.token, data.user);
      navigate('/');
    } catch (error) {
      setServerError(error.response?.data?.message || 'تعذر تسجيل الدخول. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="auth-page"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><AnnouncementBar /><Header onMenu={() => setSidebarOpen(true)} /><main className="auth-main"><section className="auth-shell"><div className="auth-copy"><span className="auth-eyebrow">أهلاً بك مجدداً</span><h1>تسجيل الدخول</h1><p>ادخل إلى حسابك لمتابعة الوظائف المتاحة والوظائف المتقدم عليها وسجل الطلبات الخاصة بك.</p></div><form className="auth-card" onSubmit={handleSubmit} noValidate><div className="auth-card-header"><h2>تسجيل الدخول</h2><p>استخدم بريدك الإلكتروني وكلمة المرور للمتابعة.</p></div><label className="auth-field"><span>البريد الإلكتروني</span><div className="auth-input-wrap"><i className="fas fa-envelope" /><input type="email" name="email" value={values.email} onChange={handleChange} placeholder="name@example.com" autoComplete="email" /></div>{errors.email && <small className="auth-error">{errors.email}</small>}</label><label className="auth-field"><span>كلمة المرور</span><div className="auth-input-wrap"><i className="fas fa-lock" /><input type={showPassword ? 'text' : 'password'} name="password" value={values.password} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" /><button className="auth-toggle" type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}><i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} /></button></div>{errors.password && <small className="auth-error">{errors.password}</small>}</label>{serverError && <div className="auth-error auth-server-error">{serverError}</div>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}</button><p className="auth-switch">ليس لديك حساب؟ <Link to="/register">إنشاء حساب</Link></p></form></section></main><Footer /></div>;
}
