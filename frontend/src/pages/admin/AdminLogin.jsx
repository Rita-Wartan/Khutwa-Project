import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../Auth.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { token, user, authenticate } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user?.role === 'admin') navigate('/admin/dashboard', { replace: true });
  }, [token, user, navigate]);

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
    const credentials = { email: values.email.trim(), password: values.password };

    try {
      let data;
      try {
        ({ data } = await api.post('/auth/login', credentials));
      } catch (normalLoginError) {
        ({ data } = await api.post('/company/login', credentials));
      }

      const loggedInUser = data.user || data.company;
      if (loggedInUser?.role !== 'admin') {
        setServerError('ليس لديك صلاحية دخول لوحة التحكم');
        return;
      }

      authenticate(data.token, loggedInUser);
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      setServerError(error.response?.data?.message || 'تعذر تسجيل الدخول. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="auth-page"><main className="auth-main"><section className="auth-shell"><div className="auth-copy"><span className="auth-eyebrow">Khutwa Admin</span><h1>بوابة الإدارة</h1><p>أدخل بيانات حساب المسؤول للوصول إلى لوحة التحكم.</p></div><form className="auth-card" onSubmit={handleSubmit} noValidate><div className="auth-card-header"><h2>تسجيل الدخول</h2><p>استخدم بريد المسؤول وكلمة المرور للمتابعة.</p></div><label className="auth-field"><span>البريد الإلكتروني</span><div className="auth-input-wrap"><i className="fas fa-envelope" /><input type="email" name="email" value={values.email} onChange={handleChange} placeholder="admin@khutwa.com" autoComplete="email" /></div>{errors.email && <small className="auth-error">{errors.email}</small>}</label><label className="auth-field"><span>كلمة المرور</span><div className="auth-input-wrap"><i className="fas fa-lock" /><input type={showPassword ? 'text' : 'password'} name="password" value={values.password} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" /><button className="auth-toggle" type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}><i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} /></button></div>{errors.password && <small className="auth-error">{errors.password}</small>}</label>{serverError && <div className="auth-error auth-server-error">{serverError}</div>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}</button></form></section></main></div>;
}
