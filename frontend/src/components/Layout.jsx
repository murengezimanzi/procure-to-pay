import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  UserCircle 
} from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300",
          isActive 
            ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200" 
            : "text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-md"
        )
      }
    >
      <Icon className={({ isActive }) => clsx("w-5 h-5", isActive ? "text-white" : "text-current")} />
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      {/* Decorative Background Blob */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="w-72 hidden md:flex flex-col m-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/50 relative z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 text-indigo-900 font-extrabold text-2xl tracking-tight">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            P2P Portal
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          {user?.role === 'STAFF' && (
            <NavItem to="/create" icon={PlusCircle} label="New Request" />
          )}
        </nav>

        <div className="p-4 border-t border-slate-100/50">
          <div className="bg-white/50 rounded-2xl p-4 border border-white mb-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                 <UserCircle className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.username}</p>
                <p className="text-xs text-indigo-500 font-medium truncate">{user?.role_display || user?.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative">
        <header className="h-20 flex items-center justify-between px-8 md:px-12 sticky top-0 z-10 bg-[#F8FAFC]/80 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-slate-800">
            Overview
          </h1>
          <div className="md:hidden">
            {/* Mobile menu trigger */}
          </div>
        </header>

        <div className="px-8 md:px-12 pb-12 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}