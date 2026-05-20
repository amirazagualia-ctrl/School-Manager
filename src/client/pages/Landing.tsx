import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap, BookOpen, Bot, BarChart3, Users, Shield, Sparkles,
  ArrowRight, Globe, Calculator, Languages, Atom
} from 'lucide-react';
import { Logo } from '../components/Logo';
import i18n from '../lib/i18n';

export function LandingPage() {
  const { t } = useTranslation();

  const features = [
    { icon: BookOpen, title: 'Cours interactifs', desc: 'Plus de 100+ cours alignés sur le programme officiel tunisien', color: 'from-blue-500 to-cyan-500' },
    { icon: Bot, title: 'Tuteur IA Ostadh', desc: 'Un assistant pédagogique disponible 24/7 pour répondre à toutes les questions', color: 'from-purple-500 to-pink-500' },
    { icon: BarChart3, title: 'Suivi de progression', desc: 'Tableau de bord détaillé pour suivre l\'évolution de chaque élève', color: 'from-amber-500 to-orange-500' },
    { icon: Users, title: 'Multi-utilisateurs', desc: 'Élèves, enseignants, parents, administrateurs et ministère', color: 'from-green-500 to-emerald-500' },
    { icon: Sparkles, title: 'Évaluations IA', desc: 'QCM et corrections automatiques générés par intelligence artificielle', color: 'from-rose-500 to-red-500' },
    { icon: Globe, title: 'Trilingue', desc: 'Disponible en arabe, français et anglais avec support RTL', color: 'from-indigo-500 to-violet-500' }
  ];

  const levels = [
    { name: 'Primaire', range: '1ère - 6ème année', icon: '🎒', color: 'from-amber-400 to-orange-500' },
    { name: 'Collège', range: '7ème - 9ème de base', icon: '📘', color: 'from-blue-500 to-indigo-600' },
    { name: 'Lycée', range: '1ère - 4ème + Bac', icon: '🎓', color: 'from-emerald-500 to-teal-600' }
  ];

  const subjects = [
    { icon: Calculator, name: 'Mathématiques', color: 'bg-cyan-100 text-cyan-700' },
    { icon: Languages, name: 'Langues (Ar/Fr/En)', color: 'bg-purple-100 text-purple-700' },
    { icon: Atom, name: 'Sciences', color: 'bg-orange-100 text-orange-700' },
    { icon: BookOpen, name: 'Lettres & Philo', color: 'bg-amber-100 text-amber-700' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-primary-100/40 dark:from-gray-950 dark:via-primary-950/20 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-950/70 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="text-sm bg-transparent px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <option value="fr">🇫🇷 FR</option>
              <option value="ar">🇹🇳 AR</option>
              <option value="en">🇬🇧 EN</option>
            </select>
            <Link to="/login" className="btn-ghost">{t('auth.signIn')}</Link>
            <Link to="/register" className="btn-primary">{t('auth.signUp')}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
              <Sparkles size={16} />
              Propulsé par l'IA
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
              L'éducation tunisienne <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">réinventée</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 text-balance">
              Plateforme complète de gestion scolaire et d'apprentissage interactif. Du primaire au baccalauréat, avec un assistant IA pour accompagner chaque élève.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary !px-6 !py-3">
                Commencer gratuitement <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary !px-6 !py-3">
                {t('auth.signIn')}
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2"><Shield size={16} className="text-green-600" /> Sécurisé</div>
              <div className="flex items-center gap-2"><GraduationCap size={16} className="text-primary-600" /> Programme officiel</div>
              <div className="flex items-center gap-2"><Bot size={16} className="text-purple-600" /> IA intégrée</div>
            </div>
          </div>

          <div className="relative">
            <div className="card p-6 shadow-2xl shadow-primary-200 dark:shadow-primary-950/50 rotate-1 hover:rotate-0 transition-transform">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {levels.map((lvl) => (
                  <div key={lvl.name} className={`bg-gradient-to-br ${lvl.color} text-white rounded-xl p-3 text-center`}>
                    <div className="text-2xl">{lvl.icon}</div>
                    <div className="text-xs font-bold mt-1">{lvl.name}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {subjects.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${s.color} dark:bg-gray-800`}>
                    <s.icon size={20} />
                    <span className="font-medium text-sm flex-1">{s.name}</span>
                    <span className="text-xs">→</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Bot size={20} /> <span className="font-bold">Ostadh AI</span>
                </div>
                <p className="text-sm opacity-90">"Bonjour ! Je peux t'aider à comprendre les fonctions du second degré..."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Une plateforme pensée pour tous les acteurs de l'éducation tunisienne</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card p-6 hover:shadow-lg transition-all group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="card p-10 lg:p-16 bg-gradient-to-br from-primary-600 to-primary-800 text-white text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">Rejoignez Madrasa TN</h2>
          <p className="text-lg lg:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            La première plateforme éducative tunisienne avec IA. Élèves, parents, enseignants : tous connectés pour la réussite.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all">
            Créer un compte gratuit <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-500">
        <p>© 2026 Madrasa TN — Plateforme éducative pour la Tunisie 🇹🇳</p>
      </footer>
    </div>
  );
}
