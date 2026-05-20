import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, Sparkles, Plus, Clock, Award, Play, X, Save } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { cn } from '../lib/utils';

export function AssessmentsPage() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [showAiGen, setShowAiGen] = useState(false);
  const [loading, setLoading] = useState(true);

  const canCreate = ['enseignant', 'admin_ecole', 'ministere'].includes(user?.role || '');

  const load = async () => {
    const res = await api.get('/assessments');
    if (res.success) setAssessments(res.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const typeColors: Record<string, string> = {
    quiz: 'bg-blue-100 text-blue-700',
    devoir: 'bg-purple-100 text-purple-700',
    examen: 'bg-red-100 text-red-700',
    controle: 'bg-amber-100 text-amber-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3">
            <ClipboardCheck className="text-primary-600" size={32} />
            {t('assessments.title')}
          </h1>
          <p className="text-gray-600">Quiz, devoirs et examens — avec correction IA</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowAiGen(true)} className="btn-primary">
            <Sparkles size={18} /> Générer avec IA
          </button>
        )}
      </div>

      {showAiGen && <AiQuestionGenerator onClose={() => { setShowAiGen(false); load(); }} />}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : assessments.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardCheck className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500">Aucune évaluation disponible</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((a: any) => (
            <div key={a.id} className="card p-5 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn('badge', typeColors[a.type] || 'bg-gray-100')}>
                  {t(`assessments.${a.type}` as any)}
                </span>
                {a.is_ai_generated === 1 && (
                  <span className="badge bg-purple-100 text-purple-700">
                    <Sparkles size={10} /> IA
                  </span>
                )}
              </div>
              <h3 className="font-bold mb-2 line-clamp-2">{a.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{a.description || '—'}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Clock size={12} /> {a.duration_minutes}min</span>
                <span className="flex items-center gap-1"><Award size={12} /> {a.total_points} pts</span>
                <span>{a.questions_count} questions</span>
              </div>
              <Link to={`/app/assessments/${a.id}/take`} className="btn-primary w-full">
                <Play size={16} /> {t('assessments.start')}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AiQuestionGenerator({ onClose }: any) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    subject_id: '',
    grade_level_id: '',
    topic: '',
    count: 5,
    difficulty: 'moyen',
    type: 'quiz' as 'quiz' | 'devoir' | 'examen' | 'controle',
    language: 'fr'
  });
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [step, setStep] = useState<'config' | 'preview'>('config');

  useEffect(() => {
    (async () => {
      const [s, g] = await Promise.all([
        api.get('/curriculum/subjects'),
        api.get('/curriculum/grade-levels')
      ]);
      if (s.success) setSubjects(s.data || []);
      if (g.success) setGrades(g.data || []);
    })();
  }, []);

  const generate = async () => {
    if (!form.title || !form.subject_id || !form.grade_level_id || !form.topic) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    setGenerating(true);
    const subjectName = subjects.find((s: any) => s.id === parseInt(form.subject_id))?.name_fr || '';
    const gradeName = grades.find((g: any) => g.id === parseInt(form.grade_level_id))?.name_fr || '';
    const res = await api.post('/ai/generate-questions', {
      subject: subjectName,
      grade: gradeName,
      topic: form.topic,
      count: form.count,
      difficulty: form.difficulty,
      language: form.language,
      types: ['qcm', 'vrai_faux']
    });
    setGenerating(false);
    if (res.success && res.data) {
      setPreview(res.data);
      setStep('preview');
    } else {
      alert('Erreur: ' + (res.error || 'Génération échouée'));
    }
  };

  const saveAssessment = async () => {
    const res = await api.post('/assessments', {
      title: form.title,
      description: `Évaluation IA sur "${form.topic}"`,
      subject_id: parseInt(form.subject_id),
      grade_level_id: parseInt(form.grade_level_id),
      type: form.type,
      duration_minutes: form.count * 3,
      total_points: form.count * 2,
      is_published: true,
      is_ai_generated: true
    });
    if (res.success && res.data) {
      await api.post(`/assessments/${(res.data as any).id}/questions`, {
        questions: preview.questions.map((q: any, i: number) => ({
          ...q,
          options: Array.isArray(q.options) ? JSON.stringify(q.options) : q.options,
          order_index: i
        }))
      });
      alert('Évaluation créée avec succès !');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-purple-600" /> Génération IA d'évaluation
          </h2>
          <button onClick={onClose} className="btn-ghost !p-2"><X size={20} /></button>
        </div>

        {step === 'config' && (
          <div className="p-6 space-y-4">
            <input className="input" placeholder="Titre de l'évaluation" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid sm:grid-cols-2 gap-3">
              <select className="input" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })}>
                <option value="">Matière...</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name_fr}</option>)}
              </select>
              <select className="input" value={form.grade_level_id} onChange={(e) => setForm({ ...form, grade_level_id: e.target.value })}>
                <option value="">Niveau...</option>
                {grades.map((g: any) => <option key={g.id} value={g.id}>{g.name_fr}</option>)}
              </select>
            </div>
            <input className="input" placeholder="Sujet précis (ex: Fonctions du second degré)" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Nb questions</label>
                <input type="number" min={1} max={20} className="input" value={form.count} onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) || 5 })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Difficulté</label>
                <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="facile">Facile</option>
                  <option value="moyen">Moyen</option>
                  <option value="difficile">Difficile</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Langue</label>
                <select className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <button onClick={generate} disabled={generating} className="btn-primary w-full !py-3">
              {generating ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Génération en cours...</> : <><Sparkles size={18} /> Générer les questions</>}
            </button>
            <p className="text-xs text-center text-gray-500">L'IA génère des questions alignées sur le programme officiel tunisien</p>
          </div>
        )}

        {step === 'preview' && preview && (
          <div className="p-6 space-y-4">
            {preview._mode === 'demo' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                ⚠️ Mode démo - Configurez OPENAI_API_KEY dans .dev.vars pour obtenir de vraies questions générées par IA.
              </div>
            )}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {preview.questions?.map((q: any, i: number) => (
                <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="font-medium mb-2">{i + 1}. {q.question_text}</div>
                  {q.options && (
                    <div className="space-y-1 text-sm">
                      {(Array.isArray(q.options) ? q.options : JSON.parse(q.options)).map((opt: string, j: number) => (
                        <div key={j} className={cn('px-3 py-1.5 rounded-lg', opt === q.correct_answer ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-50 dark:bg-gray-800')}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.explanation && <p className="text-xs text-gray-500 mt-2 italic">💡 {q.explanation}</p>}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('config')} className="btn-secondary">Modifier</button>
              <button onClick={saveAssessment} className="btn-primary flex-1"><Save size={18} /> Créer l'évaluation</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
