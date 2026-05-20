import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../store/auth';
import { Logo } from '../components/Logo';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const isLoading = useAuth((s) => s.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) navigate('/app/dashboard');
    else setError(res.error || 'Erreur');
  };

  const demoAccounts = [
    { role: '🎓 Élève', email: 'eleve@edu.tn' },
    { role: '👨‍🏫 Enseignant', email: 'prof.math@edu.tn' },
    { role: '👨‍👩 Parent', email: 'parent@edu.tn' },
    { role: '👨‍💼 Admin école', email: 'admin@edu.tn' },
    { role: '🏛️ Ministère', email: 'ministere@edu.tn' }
  ];

  const quickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo123!');
    setError('');
    const res = await login(demoEmail, 'Demo123!');
    if (res.success) navigate('/app/dashboard');
    else setError(res.error || 'Erreur');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-primary-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950/30">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8">
          <Logo size="lg" />
        </Link>

        <div className="card p-8 shadow-xl">
          <h1 className="text-2xl font-bold mb-2">{t('auth.welcomeBack')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            {t('auth.signIn')} pour accéder à votre tableau de bord
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input ps-10"
                  placeholder="vous@exemple.tn"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input ps-10 pe-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full !py-3" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('auth.signIn')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 mb-3 text-center">🚀 Comptes de démonstration (password: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Demo123!</code>)</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc.email)}
                  disabled={isLoading}
                  className="text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-start"
                >
                  <div className="font-semibold">{acc.role}</div>
                  <div className="text-gray-500 truncate">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
