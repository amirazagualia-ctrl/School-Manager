import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../store/auth';
import { Logo } from '../components/Logo';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const register = useAuth((s) => s.register);
  const isLoading = useAuth((s) => s.isLoading);

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'eleve',
    preferred_language: 'fr'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 6) {
      setError('Mot de passe trop court (min 6 caractères)');
      return;
    }
    const { confirmPassword, ...data } = form;
    const res = await register(data);
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
          <h1 className="text-2xl font-bold mb-2">{t('auth.signUp')}</h1>
          <p className="text-gray-500 mb-6 text-sm">Créez votre compte gratuitement</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.role')}</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="eleve">🎓 {t('roles.eleve')}</option>
                <option value="enseignant">👨‍🏫 {t('roles.enseignant')}</option>
                <option value="parent">👨‍👩 {t('roles.parent')}</option>
                <option value="admin_ecole">👨‍💼 {t('roles.admin_ecole')}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">{t('auth.firstName')}</label>
                <input
                  type="text" required className="input"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('auth.lastName')}</label>
                <input
                  type="text" required className="input"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.email')}</label>
              <input
                type="email" required className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
              <input
                type="password" required minLength={6} className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.confirmPassword')}</label>
              <input
                type="password" required minLength={6} className="input"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary w-full !py-3" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('auth.signUp')}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
