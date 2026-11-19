import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Applications from './pages/Applications';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanyLogin from './pages/company/CompanyLogin';
import CompanyRegister from './pages/company/CompanyRegister';
import CompanyDashboard from './pages/company/dashboard/CompanyDashboard';
import CompanyProtectedRoute from './routes/CompanyProtectedRoute';
import CompanyProfile from './pages/company/profile/CompanyProfile';
import AddJob from './pages/company/AddJob';
import MyJobs from './pages/company/MyJobs';
import Profile from './pages/Profile';
import Applicants from './pages/company/Applicants';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminJobs from './pages/admin/AdminJobs';
import AdminProtectedRoute from './routes/AdminProtectedRoute';
import AdminLayout from './layouts/admin/AdminLayout';

export default function App() { return <BrowserRouter><Routes><Route path="/" element={<Home />} /><Route path="/jobs" element={<Jobs />} /><Route path="/jobs/:id" element={<JobDetails />} /><Route path="/applications" element={<Applications />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/profile" element={<Profile />} /><Route path="/company/login" element={<CompanyLogin />} /><Route path="/company/register" element={<CompanyRegister />} /><Route path="/company/dashboard" element={<CompanyProtectedRoute><CompanyDashboard /></CompanyProtectedRoute>} /><Route path="/company/profile" element={<CompanyProtectedRoute><CompanyProfile /></CompanyProtectedRoute>} /><Route path="/company/jobs/create" element={<CompanyProtectedRoute><AddJob /></CompanyProtectedRoute>} /><Route path="/company/jobs/edit/:id" element={<CompanyProtectedRoute><AddJob /></CompanyProtectedRoute>} /><Route path="/company/jobs" element={<CompanyProtectedRoute><MyJobs /></CompanyProtectedRoute>} /><Route path="/company/applicants" element={<CompanyProtectedRoute><Applicants /></CompanyProtectedRoute>} /><Route path="/admin/login" element={<AdminLogin />} /><Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminProtectedRoute>} /><Route path="/admin/users" element={<AdminProtectedRoute><AdminLayout><AdminUsers /></AdminLayout></AdminProtectedRoute>} /><Route path="/admin/companies" element={<AdminProtectedRoute><AdminLayout><AdminCompanies /></AdminLayout></AdminProtectedRoute>} /><Route path="/admin/jobs" element={<AdminProtectedRoute><AdminLayout><AdminJobs /></AdminLayout></AdminProtectedRoute>} /></Routes></BrowserRouter>; }
