import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, BookOpen, GraduationCap, ClipboardCheck, Bot, Users,
  Settings, LogOut, Menu, X, School, Bell, Globe
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../store/auth';
import { Logo } from './Logo';
import { cn, getInitials, getRoleColor } from '../lib/utils';
import i18n from '../lib/i18n';

export function Layout() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  // Liens de navigation selon le rôle
  const navLinks = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), roles: ['eleve', 'enseignant', 'admin_ecole', 'parent', 'ministere'] },
    { to: '/app/curriculum', icon: GraduationCap, label: t('nav.curriculum'), roles: ['eleve', 'enseignant', 'admin_ecole', 'parent', 'ministere'] },
    { to: '/app/courses', icon: BookOpen, label: t('nav.courses'), roles: ['eleve', 'enseignant', 'admin_ecole', 'parent', 'ministere'] },
    { to: '/app/assessments', icon: ClipboardCheck, label: t('nav.assessments'), roles: ['eleve', 'enseignant', 'admin_ecole', 'parent', 'ministere'] },
    { to: '/app/tutor', icon: Bot, label: t('nav.tutor'), roles: ['eleve', 'enseignant', 'parent'] },
    { to: '/app/students', icon: Users, label: t('nav.students'), roles: ['enseignant', 'admin_ecole', 'ministere'] },
    { to: '/app/students', icon: Users, label: t('nav.children'), roles: ['parent'] },
    { to: '/app/schools', icon: School, label: t('nav.schools'), roles: ['ministere'] }
  ].filter((l) => l.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 h-screen w-72 bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 z-50 transition-transform',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 rtl:translate-x-full lg:rtl:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <Link to="/app/dashboard" onClick={() => setSidebarOpen(false)}>
              <Logo size="sm" />
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* User badge */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-md">
                {user && getInitials(user.first_name, user.last_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">
                  {user?.first_name} {user?.last_name}
                </div>
                <span className={cn('badge mt-0.5', getRoleColor(user?.role || ''))}>
                  {t(`roles.${user?.role}`)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navLinks.map((link) => {
              const active = location.pathname.startsWith(link.to);
              const Icon = link.icon;
              return (
                <Link
                  key={link.to + link.label}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    active
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
            <Link
              to="/app/settings"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings size={18} />
              {t('nav.settings')}
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={18} />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-2">
              {/* Sélecteur de langue */}
              <div className="relative group">
                <button className="btn-ghost !p-2">
                  <Globe size={20} />
                </button>
                <div className="absolute end-0 mt-2 w-40 card p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {[
                    { code: 'fr', label: 'Français', flag: '🇫🇷' },
                    { code: 'ar', label: 'العربية', flag: '🇹🇳' },
                    { code: 'en', label: 'English', flag: '🇬🇧' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={cn(
                        'w-full text-start px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2',
                        i18n.language === lang.code && 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      )}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-ghost !p-2 relative">
                <Bell size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
