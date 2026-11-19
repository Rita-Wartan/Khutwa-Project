import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './AdminCompanies.css';

const formatDate = value => value ? new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) : '—';

export default function AdminCompanies() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const handleUnauthorized = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  useEffect(() => {
    if (!token) {
      handleUnauthorized();
      return undefined;
    }

    let active = true;
    api.get('/admin/companies', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { if (active) setCompanies(data.companies || []); })
      .catch(requestError => {
        if (!active) return;
        if (requestError.response?.status === 401) handleUnauthorized();
        else if (requestError.response?.status === 403) setError('ليس لديك صلاحية إدارة الشركات');
        else setError('تعذر تحميل الشركات');
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [token]);

  const handleDelete = async company => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الشركة؟')) return;

    setDeletingId(company._id);
    setError('');
    try {
      await api.delete(`/admin/companies/${company._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCompanies(current => current.filter(item => item._id !== company._id));
    } catch (requestError) {
      if (requestError.response?.status === 401) handleUnauthorized();
      else if (requestError.response?.status === 403) setError(requestError.response?.data?.message || 'ليس لديك صلاحية حذف هذه الشركة');
      else setError(requestError.response?.data?.message || 'تعذر حذف الشركة');
    } finally {
      setDeletingId('');
    }
  };

  return <section className="admin-companies-page"><div className="admin-companies-heading"><div><span className="admin-companies-eyebrow">إدارة الحسابات</span><h1>إدارة الشركات</h1><p>عرض وإدارة الشركات المسجلة في منصة خطوة.</p></div><div className="admin-companies-count"><strong>{companies.length}</strong><span>شركة</span></div></div>{error && <div className="admin-companies-feedback" role="alert">{error}</div>}{loading ? <div className="admin-companies-state"><i className="fas fa-spinner fa-spin" /><p>جارٍ تحميل الشركات...</p></div> : companies.length === 0 ? <div className="admin-companies-state"><div className="admin-companies-empty-icon"><i className="fas fa-building" /></div><p>لا توجد شركات مسجلة حالياً</p></div> : <div className="admin-companies-table-wrap"><table className="admin-companies-table"><thead><tr><th>اسم الشركة</th><th>البريد الإلكتروني</th><th>رقم الهاتف</th><th>الموقع</th><th>الموقع الإلكتروني</th><th>تاريخ التسجيل</th><th>الإجراءات</th></tr></thead><tbody>{companies.map(company => <tr key={company._id}><td data-label="اسم الشركة">{company.name || '—'}</td><td data-label="البريد الإلكتروني">{company.email || '—'}</td><td data-label="رقم الهاتف">{company.phone || '—'}</td><td data-label="الموقع">{company.location || '—'}</td><td data-label="الموقع الإلكتروني">{company.website || '—'}</td><td data-label="تاريخ التسجيل">{formatDate(company.createdAt)}</td><td data-label="الإجراءات"><button type="button" className="admin-company-delete" disabled={deletingId === company._id} onClick={() => handleDelete(company)}>{deletingId === company._id ? 'جارٍ الحذف...' : 'حذف'}</button></td></tr>)}</tbody></table></div>}</section>;
}
