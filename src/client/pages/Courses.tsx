import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, Plus, Clock, Eye, BarChart3, Filter } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { cn } from '../lib/utils';

export function CoursesPage() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const canManage = ['enseignant', 'admin_ecole', 'ministere'].includes(user?.role || '');

  useEffect(() => {
    (async () => {
      const [subRes, gradeRes] = await Promise.all([
        api.get('/curriculum/subjects'),
        api.get('/curriculum/grade-levels')
      ]);
      if (subRes.success) setSubjects(subRes.data || []);
      if (gradeRes.success) setGrades(gradeRes.data || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (subjectFilter) params.append('subject_id', subjectFilter);
      if (gradeFilter) params.append('grade_level_id', gradeFilter);
      const res = await api.get(`/courses?${params}`);
      if (res.success) setCourses(res.data || []);
      setLoading(false);
    })();
  }, [search, subjectFilter, gradeFilter]);

  const difficultyColor = (d: string) => {
    if (d === 'facile') return 'bg-green-100 text-green-700';
    if (d === 'moyen') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="text-primary-600" size={32} />
            {t('courses.title')}
          </h1>
          <p className="text-gray-600">Explorez les cours interactifs</p>
        </div>
        {canManage && (
          <Link to="/app/courses/manage" className="btn-primary">
            <Plus size={18} /> {t('courses.create')}
          </Link>
        )}
      </div>

      {/* Filtres */}
      <div className="card p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input ps-10"
            />
          </div>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="input">
            <option value="">Toutes les matières</option>
            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name_fr}</option>
            ))}
          </select>
          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="input">
            <option value="">Tous les niveaux</option>
            {grades.map((g: any) => (
              <option key={g.id} value={g.id}>{g.name_fr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <BookOpen className="mx-auto mb-3" size={48} />
          <p>{t('courses.noCourses')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c: any) => (
            <Link to={`/app/courses/${c.id}`} key={c.id} className="card overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-32 relative" style={{ background: `linear-gradient(135deg, ${c.subject_color}, ${c.subject_color}aa)` }}>
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <span className="badge bg-white/20 text-white backdrop-blur">
                    {c.subject_name}
                  </span>
                  <BookOpen className="text-white/30 self-end" size={48} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">{c.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">{c.description}</p>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className={cn('badge', difficultyColor(c.difficulty))}>
                    {t(`courses.difficulty${c.difficulty[0].toUpperCase() + c.difficulty.slice(1)}` as any)}
                  </span>
                  <span className="badge bg-gray-100 text-gray-700">{c.grade_name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="flex items-center gap-1"><Clock size={12} /> {c.duration_minutes}min</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {c.views_count}</span>
                  <span className="flex items-center gap-1"><BarChart3 size={12} /> {c.lessons_count} leçons</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
