import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCompany } from '../../contexts/CompanyContext';
import { LayoutDashboard, FileText, Users, Settings, LogOut, Building2, Plus, FileUser, CreditCard } from 'lucide-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

export const DashboardLayout = () => {
  const { user } = useAuth();
  const { companies, currentCompany, setCurrentCompany } = useCompany();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: FileText, label: 'Utility Bills', path: '/bills/new' },
    { icon: FileText, label: 'Pay Slips', path: '/payslips/new' },
    { icon: FileUser, label: 'Resume Builder', path: '/resumes/new' },
    { icon: CreditCard, label: 'Identity/License', path: '/licenses/new' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans print:bg-white print:h-auto">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col print:hidden">
        <div className="p-6 flex items-center gap-2 font-bold text-xl text-indigo-600">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <FileText size={20} />
          </div>
          Invoicer
        </div>

        {/* Company Switcher */}
        <div className="px-4 mb-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Workspace</div>
          <select 
            className="w-full bg-slate-100 border-transparent rounded-md text-sm p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={currentCompany?.id || ''}
            onChange={(e) => {
              const comp = companies.find(c => c.id === e.target.value);
              if (comp) setCurrentCompany(comp);
            }}
          >
            {companies.length === 0 && <option value="">No Companies</option>}
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {companies.length === 0 && (
            <button onClick={() => navigate('/settings')} className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 py-1">
              <Plus size={14} /> Create Company
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto print:overflow-visible print:bg-white">
        <div className="p-8 max-w-6xl mx-auto print:p-0 print:max-w-none">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
