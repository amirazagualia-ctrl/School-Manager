import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Award, CheckCircle2, XCircle, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export function AssessmentTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const res = await api.get(`/assessments/${id}`);
      if (res.success) {
        setAssessment(res.data);
        setTimeLeft((res.data as any).duration_minutes * 60);
      }
      const attempt = await api.post(`/assessments/${id}/attempts`);
      if (attempt.success) setAttemptId((attempt.data as any).attempt_id);
    })();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return;
    const t = setInterval(() => setTimeLeft((v) => (v! > 0 ? v! - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [timeLeft, result]);

  const submit = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    const answerArray = Object.entries(answers).map(([qid, ans]) => ({
      question_id: parseInt(qid),
      student_answer: ans
    }));
    const res = await api.post(`/assessments/attempts/${attemptId}/submit`, { answers: answerArray });
    setSubmitting(false);
    if (res.success) setResult(res.data);
  };

  if (!assessment || !attemptId) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }

  const questions = assessment.questions || [];
  const q = questions[currentQ];
  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (result) {
    const pct = result.percentage;
    const grade20 = ((result.score / result.max_score) * 20).toFixed(2);
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/app/assessments" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600">
          <ArrowLeft size={16} /> Retour
        </Link>
        <div className="card p-8 lg:p-12 text-center">
          <div className={cn(
            'w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6',
            pct >= 50 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          )}>
            {pct >= 50 ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
          </div>
          <h1 className="text-2xl font-bold mb-2">{assessment.title}</h1>
          <p className="text-gray-600 mb-6">Évaluation terminée !</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-4">
              <p className="text-xs text-gray-500">Note</p>
              <p className="text-3xl font-bold text-primary-600">{grade20}</p>
              <p className="text-xs">/20</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Pourcentage</p>
              <p className="text-3xl font-bold">{pct}%</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Points</p>
              <p className="text-3xl font-bold">{result.score}</p>
              <p className="text-xs">/{result.max_score}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <Link to="/app/assessments" className="btn-secondary">Retour aux évaluations</Link>
            <Link to="/app/tutor" className="btn-primary"><Sparkles size={18} /> Réviser avec l'IA</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="card p-4 flex items-center justify-between sticky top-20 z-10">
        <div>
          <h2 className="font-bold">{assessment.title}</h2>
          <p className="text-xs text-gray-500">Question {currentQ + 1} / {questions.length}</p>
        </div>
        {timeLeft !== null && (
          <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl font-mono font-bold', timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-700')}>
            <Clock size={18} /> {fmt(timeLeft)}
          </div>
        )}
      </div>

      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-primary-600 transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      {q && (
        <div className="card p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge bg-primary-100 text-primary-700">{q.question_type}</span>
            <span className="badge bg-amber-100 text-amber-700"><Award size={12} /> {q.points} pts</span>
          </div>
          <h3 className="text-lg font-bold mb-6">{q.question_text}</h3>

          {(q.question_type === 'qcm' || q.question_type === 'vrai_faux') && q.options && (
            <div className="space-y-2">
              {(typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map((opt: string, i: number) => {
                const selected = answers[q.id] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                    className={cn(
                      'w-full text-start p-4 rounded-xl border-2 transition-all',
                      selected
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        selected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                      )}>
                        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="font-medium">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {(q.question_type === 'reponse_courte' || q.question_type === 'redaction') && (
            <textarea
              className="input"
              rows={q.question_type === 'redaction' ? 8 : 3}
              placeholder="Votre réponse..."
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            />
          )}

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="btn-secondary"
            >
              <ChevronLeft size={18} /> Précédent
            </button>
            {currentQ < questions.length - 1 ? (
              <button onClick={() => setCurrentQ(currentQ + 1)} className="btn-primary">
                Suivant <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={submit} disabled={submitting} className="btn-primary">
                {submitting ? 'Envoi...' : <><CheckCircle2 size={18} /> Soumettre</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation des questions */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-1.5">
          {questions.map((qq: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-bold',
                currentQ === i ? 'bg-primary-600 text-white' : answers[qq.id] ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800'
              )}
            >{i + 1}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
