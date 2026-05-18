import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, BookOpen, Clock, Eye, User, PlayCircle, FileText, Video,
  CheckCircle2, Lock, Sparkles
} from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

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
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed">{currentLesson.content}</p>
                </div>
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
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-purple-600" />
                    <h3 className="font-bold">Exercice interactif</h3>
                  </div>
                  <pre className="text-sm bg-white dark:bg-gray-900 p-4 rounded-lg overflow-auto">
                    {currentLesson.content}
                  </pre>
                  <p className="text-sm mt-3 text-gray-600">
                    💡 Utilisez le tuteur IA pour vous aider avec cet exercice.
                  </p>
                </div>
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
