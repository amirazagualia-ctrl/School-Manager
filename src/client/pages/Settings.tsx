import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Globe, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../store/auth';
import { api } from '../lib/api';
import i18n from '../lib/i18n';

export function SettingsPage() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updateUser);
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    first_name_ar: user?.first_name_ar || '',
    last_name_ar: user?.last_name_ar || '',
    phone: user?.phone || '',
    preferred_language: user?.preferred_language || 'fr'
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await api.put(`/users/${user?.id}`, form);
    setSaving(false);
    if (res.success) {
      updateUser(form as any);
      i18n.changeLanguage(form.preferred_language);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">{t('nav.settings')}</h1>
        <p className="text-gray-600">Gérez votre profil et préférences</p>
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <User className="text-primary-600" size={20} /> Informations personnelles
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('auth.firstName')}</label>
            <input className="input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('auth.lastName')}</label>
            <input className="input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الاسم بالعربية</label>
            <input className="input" value={form.first_name_ar} onChange={(e) => setForm({ ...form, first_name_ar: e.target.value })} dir="rtl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">اللقب بالعربية</label>
            <input className="input" value={form.last_name_ar} onChange={(e) => setForm({ ...form, last_name_ar: e.target.value })} dir="rtl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Téléphone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+216 XX XXX XXX" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input className="input bg-gray-50" value={user?.email} disabled />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Globe className="text-primary-600" size={20} /> Langue préférée
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { code: 'fr', label: 'Français', flag: '🇫🇷' },
            { code: 'ar', label: 'العربية', flag: '🇹🇳' },
            { code: 'en', label: 'English', flag: '🇬🇧' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setForm({ ...form, preferred_language: lang.code as any })}
              className={`p-4 rounded-xl border-2 transition-all ${form.preferred_language === lang.code ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <div className="text-3xl mb-1">{lang.flag}</div>
              <div className="font-medium text-sm">{lang.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary">
          <Save size={18} /> {saving ? 'Enregistrement...' : t('common.save')}
        </button>
        {saved && (
          <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle2 size={18} /> Enregistré
          </span>
        )}
      </div>
    </div>
  );
}
