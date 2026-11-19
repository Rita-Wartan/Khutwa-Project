import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './AdminUsers.css';

const formatDate = value => value ? new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) : '—';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [users, setUsers] = useState([]);
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
    api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { if (active) setUsers(data.users || []); })
      .catch(requestError => {
        if (!active) return;
        if (requestError.response?.status === 401) handleUnauthorized();
        else if (requestError.response?.status === 403) setError('ليس لديك صلاحية إدارة المستخدمين');
        else setError('تعذر تحميل المستخدمين');
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [token]);

  const handleDelete = async user => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    setDeletingId(user._id);
    setError('');
    try {
      await api.delete(`/admin/users/${user._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(current => current.filter(item => item._id !== user._id));
    } catch (requestError) {
      if (requestError.response?.status === 401) handleUnauthorized();
      else if (requestError.response?.status === 403) setError(requestError.response?.data?.message || 'ليس لديك صلاحية حذف هذا المستخدم');
      else setError(requestError.response?.data?.message || 'تعذر حذف المستخدم');
    } finally {
      setDeletingId('');
    }
  };

  return <section className="admin-users-page"><div className="admin-users-heading"><div><span className="admin-users-eyebrow">إدارة الحسابات</span><h1>إدارة المستخدمين</h1><p>عرض وإدارة حسابات الباحثين عن عمل في المنصة.</p></div><div className="admin-users-count"><strong>{users.length}</strong><span>مستخدم</span></div></div>{error && <div className="admin-users-feedback" role="alert">{error}</div>}{loading ? <div className="admin-users-state"><i className="fas fa-spinner fa-spin" /><p>جارٍ تحميل المستخدمين...</p></div> : users.length === 0 ? <div className="admin-users-state"><div className="admin-users-empty-icon"><i className="fas fa-users" /></div><p>لا يوجد مستخدمون حالياً</p></div> : <div className="admin-users-table-wrap"><table className="admin-users-table"><thead><tr><th>الاسم</th><th>البريد الإلكتروني</th><th>رقم الهاتف</th><th>الموقع</th><th>تاريخ التسجيل</th><th>الإجراءات</th></tr></thead><tbody>{users.map(user => <tr key={user._id}><td data-label="الاسم">{user.name || '—'}</td><td data-label="البريد الإلكتروني">{user.email || '—'}</td><td data-label="رقم الهاتف">{user.phone || '—'}</td><td data-label="الموقع">{user.location || '—'}</td><td data-label="تاريخ التسجيل">{formatDate(user.createdAt)}</td><td data-label="الإجراءات"><button type="button" className="admin-user-delete" disabled={deletingId === user._id} onClick={() => handleDelete(user)}>{deletingId === user._id ? 'جارٍ الحذف...' : 'حذف'}</button></td></tr>)}</tbody></table></div>}</section>;
}
