import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Layers, BookOpen, Clock, Star, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { cn, getCycleColor } from '../lib/utils';
import i18n from '../lib/i18n';

export function CurriculumPage() {
  const { t } = useTranslation();
  const [overview, setOverview] = useState<any>(null);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get('/curriculum/overview');
      if (res.success) setOverview(res.data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedGrade) {
      setSubjects([]);
      return;
    }
    (async () => {
      let url = `/curriculum/by-level/${selectedGrade.id}`;
      if (selectedSection) url += `?section_id=${selectedSection}`;
      const res = await api.get(url);
      if (res.success) setSubjects(res.data || []);
    })();
  }, [selectedGrade, selectedSection]);

  const getName = (item: any) =>
    i18n.language === 'ar' ? item.name_ar : i18n.language === 'en' ? item.name_en : item.name_fr;

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3">
          <GraduationCap className="text-primary-600" size={32} />
          {t('curriculum.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Système éducatif tunisien officiel — du primaire au baccalauréat
        </p>
      </div>

      {/* Cycles */}
      <div className="grid md:grid-cols-3 gap-4">
        {(['primaire', 'college', 'lycee'] as const).map((cycle) => (
          <div key={cycle} className={`card p-6 bg-gradient-to-br ${getCycleColor(cycle)} text-white relative overflow-hidden`}>
            <div className="absolute -end-4 -top-4 opacity-20">
              <Layers size={80} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t(`cycles.${cycle}`)}</h3>
            <p className="text-sm opacity-90 mb-4">
              {overview?.cycles[cycle]?.length || 0} niveaux scolaires
            </p>
            <div className="flex flex-wrap gap-2">
              {overview?.cycles[cycle]?.map((lvl: any) => (
                <button
                  key={lvl.id}
                  onClick={() => { setSelectedGrade(lvl); setSelectedSection(null); }}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg font-medium transition-all',
                    selectedGrade?.id === lvl.id
                      ? 'bg-white text-gray-900'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  )}
                >
                  {lvl.code}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedGrade && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold">{getName(selectedGrade)}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {t(`cycles.${selectedGrade.cycle}`)} • Code: {selectedGrade.code}
              </p>
            </div>
            {selectedGrade.cycle === 'lycee' && overview?.sections && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600">{t('curriculum.section')}:</span>
                <button
                  onClick={() => setSelectedSection(null)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg font-medium',
                    !selectedSection ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  Tous
                </button>
                {overview.sections.map((sec: any) => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSection(sec.id)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-lg font-medium',
                      selectedSection === sec.id ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
                    )}
                  >
                    {getName(sec)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="mx-auto mb-3" size={48} />
              <p>Aucune matière définie pour ce niveau{selectedSection ? '/section' : ''}.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects.map((s: any) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer group"
                  style={{ borderLeftWidth: 4, borderLeftColor: s.color }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">{getName(s)}</h4>
                    <ChevronRight className="text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" size={18} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {s.weekly_hours > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {s.weekly_hours}h/sem
                      </span>
                    )}
                    {s.coefficient > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={12} /> Coef {s.coefficient}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toutes les matières */}
      <div className="card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <BookOpen className="text-primary-600" size={20} />
          {t('curriculum.subjects')} ({overview?.subjects.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {overview?.subjects.map((s: any) => (
            <div
              key={s.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-300 transition-all"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: s.color }}>
                <BookOpen size={18} />
              </div>
              <div className="text-sm font-medium truncate">{getName(s)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
