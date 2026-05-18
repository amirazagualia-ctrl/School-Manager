import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, Users, GraduationCap, School, ClipboardCheck, TrendingUp,
  Sparkles, Bot, ArrowRight, Award, Target
} from 'lucide-react';
import { useAuth } from '../store/auth';
import { api } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from 'recharts';

export function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const [stats, setStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get('/dashboard/stats');
      if (res.success) setStats(res.data);
      if (user?.role === 'eleve') {
        const rec = await api.get('/ai/recommendations');
        if (rec.success) setRecommendations(rec.data || []);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header welcome */}
      <div className="card p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute -top-8 -end-8 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-12 -start-12 w-64 h-64 bg-white/5 rounded-full" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {t('dashboard.welcome')}, {user?.first_name} 👋
          </h1>
          <p className="opacity-90">
            {t(`roles.${user?.role}`)} •{' '}
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats selon rôle */}
      {user?.role === 'ministere' && <MinistereStats stats={stats} />}
      {user?.role === 'admin_ecole' && <AdminStats stats={stats} />}
      {user?.role === 'enseignant' && <TeacherStats stats={stats} />}
      {user?.role === 'eleve' && <StudentStats stats={stats} recommendations={recommendations} />}
      {user?.role === 'parent' && <ParentStats stats={stats} />}

      {/* CTAs communs */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/app/courses" className="card p-6 hover:shadow-lg transition-all group">
          <BookOpen className="text-blue-600 mb-3" size={32} />
          <h3 className="font-bold mb-1">{t('nav.courses')}</h3>
          <p className="text-sm text-gray-500">Cours interactifs disponibles</p>
          <ArrowRight className="mt-3 text-primary-600 group-hover:translate-x-1 transition-transform" size={18} />
        </Link>
        <Link to="/app/curriculum" className="card p-6 hover:shadow-lg transition-all group">
          <GraduationCap className="text-emerald-600 mb-3" size={32} />
          <h3 className="font-bold mb-1">{t('nav.curriculum')}</h3>
          <p className="text-sm text-gray-500">Programme officiel tunisien</p>
          <ArrowRight className="mt-3 text-primary-600 group-hover:translate-x-1 transition-transform" size={18} />
        </Link>
        <Link to="/app/tutor" className="card p-6 hover:shadow-lg transition-all group bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <Bot className="mb-3" size={32} />
          <h3 className="font-bold mb-1">{t('nav.tutor')}</h3>
          <p className="text-sm opacity-90">Ostadh - votre assistant IA</p>
          <ArrowRight className="mt-3 group-hover:translate-x-1 transition-transform" size={18} />
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value ?? 0}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function MinistereStats({ stats }: any) {
  const s = stats?.stats || {};
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={School} label="Écoles" value={s.schools_count} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Users} label="Élèves" value={s.students_count} color="bg-green-100 text-green-600" />
        <StatCard icon={GraduationCap} label="Enseignants" value={s.teachers_count} color="bg-purple-100 text-purple-600" />
        <StatCard icon={BookOpen} label="Cours" value={s.courses_count} color="bg-orange-100 text-orange-600" />
      </div>
      {stats?.byGov && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-bold mb-4">Écoles par gouvernorat</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.byGov}>
                <XAxis dataKey="governorate" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6">
            <h3 className="font-bold mb-4">Cours par matière</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.bySubject} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name_fr" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {stats.bySubject?.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color || '#0f766e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}

function AdminStats({ stats }: any) {
  const s = stats?.stats || {};
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={Users} label="Élèves" value={s.students_count} color="bg-blue-100 text-blue-600" />
      <StatCard icon={GraduationCap} label="Enseignants" value={s.teachers_count} color="bg-purple-100 text-purple-600" />
      <StatCard icon={School} label="Classes" value={s.classes_count} color="bg-green-100 text-green-600" />
      <StatCard icon={BookOpen} label="Cours" value={s.courses_count} color="bg-orange-100 text-orange-600" />
    </div>
  );
}

function TeacherStats({ stats }: any) {
  const s = stats?.stats || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard icon={School} label="Mes classes" value={s.classes_count} color="bg-blue-100 text-blue-600" />
      <StatCard icon={BookOpen} label="Mes cours" value={s.courses_count} color="bg-green-100 text-green-600" />
      <StatCard icon={ClipboardCheck} label="Évaluations" value={s.assessments_count} color="bg-purple-100 text-purple-600" />
    </div>
  );
}

function StudentStats({ stats, recommendations }: any) {
  const s = stats?.stats || {};
  const subjectData = stats?.subjectAvgs || [];
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Cours commencés" value={s.courses_started} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Award} label="Cours terminés" value={s.courses_completed} color="bg-green-100 text-green-600" />
        <StatCard icon={ClipboardCheck} label="Évaluations" value={s.attempts_count} color="bg-purple-100 text-purple-600" />
        <StatCard icon={Target} label="Moyenne IA" value={s.avg_score ? Math.round(s.avg_score) + '%' : '—'} color="bg-orange-100 text-orange-600" />
      </div>

      {subjectData.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-600" />
            Mes moyennes par matière
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={subjectData}>
              <XAxis dataKey="name_fr" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 20]} />
              <Tooltip formatter={(v: any) => Number(v).toFixed(2) + '/20'} />
              <Bar dataKey="average" radius={[8, 8, 0, 0]}>
                {subjectData.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color || '#0f766e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-600" size={20} />
            Recommandations IA pour vous
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec: any, i: number) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: rec.subject.color || '#0f766e' }}>
                    <BookOpen size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{rec.subject.name_fr}</h4>
                    <p className="text-xs text-gray-500">{rec.reason}</p>
                  </div>
                </div>
                {rec.courses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {rec.courses.map((c: any) => (
                      <Link key={c.id} to={`/app/courses/${c.id}`} className="text-xs px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium">
                        {c.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ParentStats({ stats }: any) {
  const children = stats?.children || [];
  if (children.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Users className="mx-auto text-gray-400 mb-3" size={48} />
        <p className="text-gray-600">Aucun enfant associé à votre compte. Contactez votre école.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      {children.map((c: any) => (
        <Link to={`/app/students/${c.id}`} key={c.id} className="card p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
              {c.first_name[0]}{c.last_name[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{c.first_name} {c.last_name}</h3>
              {c.avg_score && (
                <p className="text-sm text-gray-500">Moyenne générale: {Number(c.avg_score).toFixed(2)}/20</p>
              )}
            </div>
            <ArrowRight className="text-primary-600" />
          </div>
        </Link>
      ))}
    </div>
  );
}
