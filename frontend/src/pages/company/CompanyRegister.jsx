import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import AnnouncementBar from '../../components/AnnouncementBar';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import './CompanyAuth.css';

const initialValues = { name: '', email: '', password: '', country: 'SY', phone: '', location: '', website: '', description: '' };
const countryCodes = { SY: '+963', SA: '+966', AE: '+971' };

export default function CompanyRegister() {
  const navigate = useNavigate();
  const { authenticate } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(initialValues);
  const [logo, setLogo] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = event => {
    const { name, value } = event.target;
    setValues(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const validateContact = () => {
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = 'الاسم مطلوب';
    if (!values.email.trim()) nextErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) nextErrors.email = 'أدخل بريداً إلكترونياً صالحاً';
    if (!values.password) nextErrors.password = 'كلمة المرور مطلوبة';
    if (!values.phone.trim()) nextErrors.phone = 'رقم الهاتف مطلوب';
    else if (!/^\d{6,15}$/.test(values.phone.replace(/\s/g, ''))) nextErrors.phone = 'أدخل رقم هاتف صحيحاً';
    return nextErrors;
  };

  const validateCompany = () => {
    const nextErrors = {};
    if (!values.location.trim()) nextErrors.location = 'الموقع مطلوب';
    if (!values.description.trim()) nextErrors.description = 'وصف الشركة مطلوب';
    if (values.website.trim() && !/^https?:\/\/[^\s]+$/i.test(values.website.trim())) nextErrors.website = 'أدخل رابطاً يبدأ بـ https:// أو http://';
    return nextErrors;
  };

  const goNext = event => {
    event.preventDefault();
    const nextErrors = validateContact();
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) setStep(2);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const nextErrors = validateCompany();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setServerError('');
    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: `${countryCodes[values.country]} ${values.phone}`,
        location: values.location,
        website: values.website,
        description: values.description,
        logo: logo ? { filename: logo.name, url: '' } : undefined,
      };
      const { data } = await api.post('/company/register', payload);
      authenticate(data.token, data.company);
      navigate('/company/dashboard');
    } catch (error) {
      setServerError(error.response?.data?.message || 'تعذر إنشاء حساب الشركة. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="auth-page company-auth-page"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><AnnouncementBar /><Header onMenu={() => setSidebarOpen(true)} /><main className="auth-main"><section className="auth-shell company-auth-shell"><div className="auth-copy"><span className="auth-eyebrow">انضم إلى شبكة أصحاب العمل</span><h1>إنشاء حساب شركة</h1><p>عرّف شركتك للباحثين عن عمل وابدأ ببناء فريقك القادم.</p></div><form className="auth-card auth-card-wide company-auth-card" onSubmit={step === 1 ? goNext : handleSubmit} noValidate><div className="auth-card-header"><h2>إنشاء حساب الشركة</h2><p>أكمل الخطوتين لإعداد ملف شركتك.</p></div><div className="company-stepper"><div className={step === 1 ? 'active' : 'complete'}><b>1</b><span>بيانات الاتصال</span></div><span className="company-step-line" /><div className={step === 2 ? 'active' : ''}><b>2</b><span>بيانات الشركة</span></div></div>{step === 1 ? <div className="auth-grid"><label className="auth-field"><span>الاسم</span><div className="auth-input-wrap"><i className="fas fa-user" /><input name="name" value={values.name} onChange={handleChange} autoComplete="name" /></div>{errors.name && <small className="auth-error">{errors.name}</small>}</label><label className="auth-field"><span>البريد الإلكتروني</span><div className="auth-input-wrap"><i className="fas fa-envelope" /><input type="email" name="email" value={values.email} onChange={handleChange} autoComplete="email" /></div>{errors.email && <small className="auth-error">{errors.email}</small>}</label><label className="auth-field"><span>كلمة المرور</span><div className="auth-input-wrap"><i className="fas fa-lock" /><input type="password" name="password" value={values.password} onChange={handleChange} autoComplete="new-password" /></div>{errors.password && <small className="auth-error">{errors.password}</small>}</label><label className="auth-field"><span>رقم الهاتف</span><div className="company-phone-wrap"><select name="country" value={values.country} onChange={handleChange} aria-label="رمز الدولة"><option value="SY">🇸🇾 +963</option><option value="SA">🇸🇦 +966</option><option value="AE">🇦🇪 +971</option></select><input type="tel" name="phone" value={values.phone} onChange={handleChange} placeholder="912345678" autoComplete="tel" /></div>{errors.phone && <small className="auth-error">{errors.phone}</small>}</label></div> : <div className="auth-grid"><label className="auth-field"><span>الموقع</span><div className="auth-input-wrap"><i className="fas fa-location-dot" /><input name="location" value={values.location} onChange={handleChange} placeholder="دمشق، سوريا" /></div>{errors.location && <small className="auth-error">{errors.location}</small>}</label><label className="auth-field"><span>الموقع الإلكتروني</span><div className="auth-input-wrap"><i className="fas fa-globe" /><input type="url" name="website" value={values.website} onChange={handleChange} placeholder="https://company.com" /></div>{errors.website && <small className="auth-error">{errors.website}</small>}</label><label className="auth-field auth-field-full"><span>وصف الشركة</span><div className="auth-input-wrap auth-textarea-wrap"><i className="fas fa-building" /><textarea name="description" value={values.description} onChange={handleChange} rows="4" /></div>{errors.description && <small className="auth-error">{errors.description}</small>}</label><label className="auth-field auth-field-full"><span>شعار الشركة</span><div className="auth-upload company-logo-upload"><input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={event => setLogo(event.target.files?.[0] || null)} /><div className="auth-upload-box"><i className="fas fa-image" /><span>{logo ? logo.name : 'اختر شعار الشركة'}</span></div></div><small className="auth-help">JPG, JPEG, PNG, WEBP</small></label></div>}{serverError && <div className="auth-error auth-server-error">{serverError}</div>}<div className="company-form-actions">{step === 2 && <button className="company-secondary-button" type="button" onClick={() => { setStep(1); setErrors({}); }}>السابق</button>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? 'جارٍ إنشاء الحساب...' : step === 1 ? 'التالي' : 'إنشاء حساب الشركة'}</button></div>{step === 1 && <p className="auth-switch">لديك حساب شركة؟ <Link to="/company/login">تسجيل الدخول</Link></p>}</form></section></main><Footer /></div>;
}
