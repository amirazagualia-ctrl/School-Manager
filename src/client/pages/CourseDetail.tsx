import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { marked } from 'marked';
import {
  ArrowLeft, BookOpen, Clock, Eye, User, PlayCircle, FileText, Video,
  CheckCircle2, Lock, Sparkles, Code as CodeIcon, ListChecks
} from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

marked.setOptions({ gfm: true, breaks: true });

export function CourseDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get(`/courses/${id}`);
      if (res.success) {
        setCourse(res.data);
        if (res.data.lessons?.length > 0) setCurrentLesson(res.data.lessons[0]);
      }
      setLoading(false);
    })();
  }, [id]);

  const markProgress = async (lesson: any, status: 'en_cours' | 'termine') => {
    await api.post(`/courses/${id}/progress`, {
      lesson_id: lesson.id,
      status,
      progress_percentage: status === 'termine' ? 100 : 50,
      time_spent_seconds: 60
    });
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  if (!course) return <div className="card p-8 text-center">Cours introuvable</div>;

  return (
    <div className="space-y-6">
      <Link to="/app/courses" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600">
        <ArrowLeft size={16} /> Retour aux cours
      </Link>

      <div
        className="card p-6 lg:p-8 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${course.subject_color}, ${course.subject_color}cc)` }}
      >
        <div className="absolute -end-8 -bottom-8 opacity-20">
          <BookOpen size={200} />
        </div>
        <div className="relative max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge bg-white/20 backdrop-blur">{course.subject_name}</span>
            <span className="badge bg-white/20 backdrop-blur">{course.grade_name}</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold mb-3">{course.title}</h1>
          <p className="opacity-90 mb-4">{course.description}</p>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="flex items-center gap-1.5"><User size={16} /> {course.author_name}</span>
            <span className="flex items-center gap-1.5"><Clock size={16} /> {course.duration_minutes} min</span>
            <span className="flex items-center gap-1.5"><Eye size={16} /> {course.views_count} vues</span>
            <span className="flex items-center gap-1.5"><BookOpen size={16} /> {course.lessons?.length || 0} leçons</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar des leçons */}
        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-24">
            <h3 className="font-bold mb-3">{t('courses.lessons')}</h3>
            <div className="space-y-1">
              {course.lessons?.map((lesson: any, i: number) => {
                const isActive = currentLesson?.id === lesson.id;
                const Icon = lesson.content_type === 'video' ? Video : lesson.content_type === 'quiz' ? Sparkles : FileText;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(lesson)}
                    className={cn(
                      'w-full text-start p-3 rounded-xl transition-all flex items-center gap-3',
                      isActive ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                    )}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{i + 1}. {lesson.title}</div>
                      <div className={cn('text-xs', isActive ? 'text-white/80' : 'text-gray-500')}>
                        {lesson.duration_minutes} min
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenu de la leçon */}
        <div className="lg:col-span-2">
          {currentLesson ? (
            <div className="card p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{currentLesson.title}</h2>
                <span className="badge bg-primary-100 text-primary-700">
                  {currentLesson.content_type}
                </span>
              </div>

              {currentLesson.content_type === 'text' && (
                <div
                  className="prose prose-base dark:prose-invert max-w-none prose-headings:text-primary-700 dark:prose-headings:text-primary-300"
                  dangerouslySetInnerHTML={{ __html: marked.parse(currentLesson.content || '') as string }}
                />
              )}
              {currentLesson.content_type === 'video' && (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  {currentLesson.video_url ? (
                    <video src={currentLesson.video_url} controls className="w-full h-full rounded-xl" />
                  ) : (
                    <div className="text-center text-gray-500">
                      <Video size={48} className="mx-auto mb-2" />
                      <p>Vidéo non disponible</p>
                    </div>
                  )}
                </div>
              )}
              {currentLesson.content_type === 'quiz' && (
                <div className="text-center py-12">
                  <Sparkles size={48} className="mx-auto text-purple-500 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Quiz de fin de chapitre</h3>
                  <p className="text-gray-500 mb-4">Testez vos connaissances</p>
                  <Link to={`/app/assessments`} className="btn-primary">
                    <PlayCircle size={18} /> Commencer le quiz
                  </Link>
                </div>
              )}
              {currentLesson.content_type === 'interactive' && (
                <InteractiveLessonRenderer content={currentLesson.content} />
              )}

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => markProgress(currentLesson, 'termine')}
                  className="btn-primary"
                >
                  <CheckCircle2 size={18} /> Marquer comme terminée
                </button>
                <Link to="/app/tutor" className="btn-secondary">
                  <Sparkles size={18} /> Demander à l'IA
                </Link>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center text-gray-500">
              <Lock size={48} className="mx-auto mb-3" />
              <p>Sélectionnez une leçon pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INTERACTIVE LESSON RENDERER
// Rend visuellement les différents types de leçons interactives
// stockées sous forme de JSON dans le champ `content`.
// Types supportés : exercise, matching, code, essay, punnett, counting
// ============================================================
function InteractiveLessonRenderer({ content }: { content: string | null }) {
  const data = useMemo(() => {
    if (!content) return null;
    try {
      return JSON.parse(content);
    } catch {
      return { _raw: content };
    }
  }, [content]);

  if (!data) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center text-gray-500">
        <Sparkles size={36} className="mx-auto mb-2" />
        <p>Contenu interactif non disponible</p>
      </div>
    );
  }

  // Fallback brut (contenu non-JSON)
  if (data._raw) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-purple-600" />
          <h3 className="font-bold">Activité interactive</h3>
        </div>
        <pre className="text-sm bg-white dark:bg-gray-900 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
          {data._raw}
        </pre>
      </div>
    );
  }

  // ----- Type EXERCISE -----
  if (data.type === 'exercise') {
    return <ExerciseRenderer data={data} />;
  }

  // ----- Type MATCHING (associer) -----
  if (data.type === 'matching') {
    return <MatchingRenderer data={data} />;
  }

  // ----- Type CODE -----
  if (data.type === 'code') {
    return <CodeRenderer data={data} />;
  }

  // ----- Type ESSAY (dissertation) -----
  if (data.type === 'essay') {
    return <EssayRenderer data={data} />;
  }

  // ----- Type PUNNETT (échiquier) -----
  if (data.type === 'punnett') {
    return <PunnettRenderer data={data} />;
  }

  // ----- Type COUNTING (compter des objets) -----
  if (data.type === 'counting') {
    return <CountingRenderer data={data} />;
  }

  // Fallback générique
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="text-purple-600" />
        <h3 className="font-bold">Activité : {data.type || 'interactive'}</h3>
      </div>
      {data.instructions && <p className="mb-3 text-gray-700 dark:text-gray-300">{data.instructions}</p>}
      <pre className="text-xs bg-white dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

// ----- EXERCISE renderer -----
function ExerciseRenderer({ data }: any) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="text-purple-600" />
        <h3 className="font-bold">🎯 Exercice guidé</h3>
      </div>
      {data.problem && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-4">
          <p className="font-medium">{data.problem}</p>
          {data.hint && <p className="text-sm text-gray-500 mt-2">💡 Indice : {data.hint}</p>}
        </div>
      )}
      {data.instructions && !data.problem && (
        <p className="mb-4 text-gray-700 dark:text-gray-300">{data.instructions}</p>
      )}
      {Array.isArray(data.steps) && data.steps.length > 0 && (
        <div className="space-y-3">
          {data.steps.map((step: any, i: number) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-4 rounded-xl">
              <p className="text-sm font-medium mb-2">
                <span className="text-purple-600 font-bold">Étape {i + 1} :</span> {step.q}
              </p>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Ta réponse..."
                  value={answers[i] || ''}
                  onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                />
                <button
                  onClick={() => setRevealed({ ...revealed, [i]: true })}
                  className="btn-secondary text-sm"
                >
                  Vérifier
                </button>
              </div>
              {revealed[i] && (
                <div className="mt-2 text-sm">
                  {String(answers[i] || '').trim().toLowerCase() === String(step.a).trim().toLowerCase() ? (
                    <p className="text-green-700 dark:text-green-400">✅ Correct ! La réponse est bien <strong>{step.a}</strong></p>
                  ) : (
                    <p className="text-amber-700 dark:text-amber-400">💡 La réponse attendue est <strong>{step.a}</strong></p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {data.solution && !data.steps && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-purple-700 font-medium">Afficher la solution</summary>
          <div className="mt-2 p-3 bg-white dark:bg-gray-900 rounded-lg text-sm">{data.solution}</div>
        </details>
      )}
      <p className="text-xs mt-4 text-gray-500">
        💡 Tu peux aussi demander de l'aide au tuteur IA (Ostadh) !
      </p>
    </div>
  );
}

// ----- MATCHING renderer -----
function MatchingRenderer({ data }: any) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const pairs = data.pairs || [];
  const rights = pairs.map((p: any) => p.right);
  // Mélanger les "right" pour l'affichage
  const shuffledRights = useMemo(() => [...rights].sort(() => Math.random() - 0.5), []);

  const check = () => setChecked(true);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <ListChecks className="text-blue-600" />
        <h3 className="font-bold">🔗 Associe les éléments</h3>
      </div>
      {data.instructions && <p className="mb-4 text-gray-700 dark:text-gray-300">{data.instructions}</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        {pairs.map((pair: any, i: number) => {
          const userAnswer = selected[pair.left];
          const isCorrect = checked && userAnswer === pair.right;
          const isWrong = checked && userAnswer && userAnswer !== pair.right;
          return (
            <div
              key={i}
              className={cn(
                'p-3 bg-white dark:bg-gray-900 rounded-xl border-2 transition',
                isCorrect ? 'border-green-500' : isWrong ? 'border-red-500' : 'border-transparent'
              )}
            >
              <div className="font-medium mb-2 text-lg">{pair.left}</div>
              <select
                className="input"
                value={selected[pair.left] || ''}
                onChange={(e) => setSelected({ ...selected, [pair.left]: e.target.value })}
              >
                <option value="">— Choisir —</option>
                {shuffledRights.map((r: string, j: number) => (
                  <option key={j} value={r}>{r}</option>
                ))}
              </select>
              {isCorrect && <p className="text-xs text-green-700 mt-1">✅ Correct</p>}
              {isWrong && <p className="text-xs text-red-700 mt-1">❌ Réponse : {pair.right}</p>}
            </div>
          );
        })}
      </div>
      <button onClick={check} className="btn-primary mt-4">
        <CheckCircle2 size={16} /> Vérifier mes réponses
      </button>
    </div>
  );
}

// ----- CODE renderer -----
function CodeRenderer({ data }: any) {
  const [code, setCode] = useState(data.starter || '');
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <CodeIcon className="text-green-600" />
        <h3 className="font-bold">💻 Exercice de programmation ({data.language || 'python'})</h3>
      </div>
      {data.prompt && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-4">
          <p className="font-medium">{data.prompt}</p>
        </div>
      )}
      <textarea
        className="input font-mono text-sm bg-gray-900 text-green-300"
        rows={10}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />
      <div className="flex gap-2 mt-3">
        <button onClick={() => setCode(data.starter || '')} className="btn-secondary text-sm">
          Réinitialiser
        </button>
        {data.solution && (
          <button onClick={() => setShowSolution(!showSolution)} className="btn-secondary text-sm">
            {showSolution ? 'Cacher' : 'Voir'} la solution
          </button>
        )}
      </div>
      {showSolution && data.solution && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-1">Solution :</div>
          <pre className="font-mono text-sm bg-gray-900 text-green-300 p-3 rounded-lg overflow-auto">
            {data.solution}
          </pre>
        </div>
      )}
    </div>
  );
}

// ----- ESSAY renderer -----
function EssayRenderer({ data }: any) {
  const [draft, setDraft] = useState('');
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="text-amber-600" />
        <h3 className="font-bold">✍️ Sujet de dissertation</h3>
      </div>
      {data.subject && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-4">
          <p className="font-medium text-lg">{data.subject}</p>
        </div>
      )}
      {Array.isArray(data.plan_suggestion) && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">📋 Plan suggéré :</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {data.plan_suggestion.map((p: string, i: number) => <li key={i}>{p}</li>)}
          </ol>
        </div>
      )}
      <label className="block text-sm font-medium mb-2">Ton brouillon :</label>
      <textarea
        className="input"
        rows={8}
        placeholder="Rédige ta dissertation ici. Tu pourras ensuite la soumettre à la correction IA depuis la page Évaluations."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <p className="text-xs text-gray-500 mt-2">
        💡 Soumets ton texte au tuteur IA pour avoir une première correction.
      </p>
    </div>
  );
}

// ----- PUNNETT renderer (génétique) -----
function PunnettRenderer({ data }: any) {
  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: 2 }, () => Array(2).fill(''))
  );
  const [checked, setChecked] = useState(false);
  const expected = data.expected || [];

  return (
    <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="text-green-600" />
        <h3 className="font-bold">🧬 Échiquier de Punnett</h3>
      </div>
      {data.instructions && <p className="mb-4 text-gray-700 dark:text-gray-300">{data.instructions}</p>}
      <div className="inline-block bg-white dark:bg-gray-900 p-4 rounded-xl">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="w-12 h-12"></th>
              {(data.parent1 || ['?', '?']).map((p: string, i: number) => (
                <th key={i} className="w-16 h-16 border-2 border-gray-300 bg-gray-100 dark:bg-gray-800 font-bold text-lg">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data.parent2 || ['?', '?']).map((p: string, i: number) => (
              <tr key={i}>
                <th className="w-12 h-12 border-2 border-gray-300 bg-gray-100 dark:bg-gray-800 font-bold text-lg">{p}</th>
                {grid[i].map((cell, j) => {
                  const correct = checked && expected[i]?.[j] && cell === expected[i][j];
                  const wrong = checked && cell && cell !== expected[i]?.[j];
                  return (
                    <td
                      key={j}
                      className={cn(
                        'w-16 h-16 border-2 text-center',
                        correct ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : wrong ? 'border-red-500 bg-red-50 dark:bg-red-900/30' : 'border-gray-300'
                      )}
                    >
                      <input
                        className="w-full h-full text-center font-bold text-lg bg-transparent outline-none"
                        value={cell}
                        maxLength={4}
                        onChange={(e) => {
                          const ng = grid.map((r) => [...r]);
                          ng[i][j] = e.target.value;
                          setGrid(ng);
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => setChecked(true)} className="btn-primary mt-4 block">
        <CheckCircle2 size={16} /> Vérifier
      </button>
    </div>
  );
}

// ----- COUNTING renderer -----
function CountingRenderer({ data }: any) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  return (
    <div className="bg-gradient-to-br from-pink-50 to-yellow-50 dark:from-pink-900/20 dark:to-yellow-900/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="text-pink-600" />
        <h3 className="font-bold">🔢 Compte les objets</h3>
      </div>
      {data.instructions && <p className="mb-4">{data.instructions}</p>}
      <div className="space-y-4">
        {(data.items || []).map((item: any, i: number) => {
          const userVal = parseInt(answers[i] || '');
          const isCorrect = checked && userVal === item.count;
          return (
            <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-900 p-4 rounded-xl">
              <div className="text-4xl">
                {Array.from({ length: item.count }, () => item.emoji).join(' ')}
              </div>
              <input
                type="number"
                className="input w-24"
                placeholder="?"
                value={answers[i] || ''}
                onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
              />
              {checked && (
                <span className={isCorrect ? 'text-green-600' : 'text-amber-600'}>
                  {isCorrect ? '✅ Bravo !' : `💡 ${item.count}`}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={() => setChecked(true)} className="btn-primary mt-4">
        <CheckCircle2 size={16} /> Vérifier
      </button>
    </div>
  );
}
