import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus, BookOpen, Edit2, Trash2, Eye, Sparkles, Save, X, FileText, Video, Code, CheckSquare, ArrowLeft
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';

export function CourseManagePage() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const [courses, setCourses] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [editingLessons, setEditingLessons] = useState<any | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    const res = await api.get('/courses?published=false');
    if (res.success) setCourses(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const [sub, gr] = await Promise.all([
        api.get('/curriculum/subjects'),
        api.get('/curriculum/grade-levels')
      ]);
      if (sub.success) setSubjects(sub.data || []);
      if (gr.success) setGrades(gr.data || []);
      await loadCourses();
    })();
  }, []);

  const handleSave = async (data: any) => {
    if (data.id) {
      await api.put(`/courses/${data.id}`, data);
    } else {
      await api.post('/courses', { ...data, is_published: false });
    }
    setEditing(null);
    await loadCourses();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce cours ?')) return;
    await api.delete(`/courses/${id}`);
    await loadCourses();
  };

  const togglePublish = async (course: any) => {
    await api.put(`/courses/${course.id}`, { is_published: course.is_published ? 0 : 1 });
    await loadCourses();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  if (editingLessons) {
    return <LessonsEditor course={editingLessons} onClose={() => { setEditingLessons(null); loadCourses(); }} />;
  }

  if (editing) {
    return (
      <CourseEditor
        course={editing}
        subjects={subjects}
        grades={grades}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">📚 Gestion des cours interactifs</h1>
          <p className="text-gray-600">Créez et gérez vos cours interactifs</p>
        </div>
        <button onClick={() => setEditing({})} className="btn-primary">
          <Plus size={18} /> {t('courses.create')}
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500 mb-4">Aucun cours créé</p>
          <button onClick={() => setEditing({})} className="btn-primary">
            <Plus size={18} /> Créer mon premier cours
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-sm">
              <tr>
                <th className="text-start px-4 py-3 font-medium">Cours</th>
                <th className="text-start px-4 py-3 font-medium hidden md:table-cell">Niveau</th>
                <th className="text-start px-4 py-3 font-medium hidden md:table-cell">Leçons</th>
                <th className="text-start px-4 py-3 font-medium">Statut</th>
                <th className="text-end px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {courses.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: c.subject_color }}>
                        <BookOpen size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{c.title}</div>
                        <div className="text-xs text-gray-500">{c.subject_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell">{c.grade_name}</td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell">{c.lessons_count || 0}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(c)}
                      className={`badge ${c.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {c.is_published ? 'Publié' : 'Brouillon'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditingLessons(c)} className="btn-ghost !p-2" title="Gérer les leçons">
                        <FileText size={16} />
                      </button>
                      <Link to={`/app/courses/${c.id}`} className="btn-ghost !p-2" title="Voir">
                        <Eye size={16} />
                      </Link>
                      <button onClick={() => setEditing(c)} className="btn-ghost !p-2" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="btn-ghost !p-2 text-red-600" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CourseEditor({ course, subjects, grades, onSave, onCancel }: any) {
  const [form, setForm] = useState({
    id: course.id,
    title: course.title || '',
    title_ar: course.title_ar || '',
    description: course.description || '',
    subject_id: course.subject_id || '',
    grade_level_id: course.grade_level_id || '',
    difficulty: course.difficulty || 'moyen',
    duration_minutes: course.duration_minutes || 30,
    language: course.language || 'fr'
  });

  return (
    <div className="space-y-6">
      <button onClick={onCancel} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600">
        <ArrowLeft size={16} /> Retour
      </button>
      <div className="card p-6 lg:p-8">
        <h2 className="text-xl font-bold mb-6">{course.id ? 'Modifier le cours' : 'Nouveau cours'}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Titre *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Titre arabe</label>
            <input className="input" value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} dir="rtl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Langue</label>
            <select className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Matière *</label>
            <select className="input" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: parseInt(e.target.value) })}>
              <option value="">Sélectionner...</option>
              {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name_fr}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Niveau *</label>
            <select className="input" value={form.grade_level_id} onChange={(e) => setForm({ ...form, grade_level_id: parseInt(e.target.value) })}>
              <option value="">Sélectionner...</option>
              {grades.map((g: any) => <option key={g.id} value={g.id}>{g.name_fr}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Difficulté</label>
            <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option value="facile">Facile</option>
              <option value="moyen">Moyen</option>
              <option value="difficile">Difficile</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Durée (min)</label>
            <input type="number" className="input" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={() => onSave(form)} className="btn-primary">
            <Save size={18} /> Enregistrer
          </button>
          <button onClick={onCancel} className="btn-secondary">
            <X size={18} /> Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

function LessonsEditor({ course, onClose }: any) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const load = async () => {
    const res = await api.get(`/courses/${course.id}`);
    if (res.success) setLessons(res.data.lessons || []);
  };
  useEffect(() => { load(); }, [course.id]);

  const save = async (data: any) => {
    if (data.id) await api.put(`/courses/lessons/${data.id}`, data);
    else await api.post(`/courses/${course.id}/lessons`, data);
    setEditingLesson(null);
    await load();
  };

  const del = async (id: number) => {
    if (!confirm('Supprimer cette leçon ?')) return;
    await api.delete(`/courses/lessons/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <button onClick={onClose} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600">
        <ArrowLeft size={16} /> Retour à la liste
      </button>
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{course.title}</h2>
            <p className="text-sm text-gray-500 mt-1">Gestion des leçons</p>
          </div>
          <button onClick={() => setEditingLesson({ order_index: lessons.length })} className="btn-primary">
            <Plus size={18} /> Ajouter une leçon
          </button>
        </div>

        {editingLesson && (
          <LessonForm
            lesson={editingLesson}
            onSave={save}
            onCancel={() => setEditingLesson(null)}
          />
        )}

        <div className="space-y-2 mt-4">
          {lessons.length === 0 && !editingLesson ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto mb-2" size={36} />
              <p>Aucune leçon. Cliquez sur "Ajouter une leçon" pour commencer.</p>
            </div>
          ) : (
            lessons.map((lesson: any, i: number) => {
              const Icon = lesson.content_type === 'video' ? Video : lesson.content_type === 'interactive' ? Code : lesson.content_type === 'quiz' ? CheckSquare : FileText;
              return (
                <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{i + 1}. {lesson.title}</div>
                    <div className="text-xs text-gray-500">{lesson.content_type} • {lesson.duration_minutes} min</div>
                  </div>
                  <button onClick={() => setEditingLesson(lesson)} className="btn-ghost !p-2"><Edit2 size={16} /></button>
                  <button onClick={() => del(lesson.id)} className="btn-ghost !p-2 text-red-600"><Trash2 size={16} /></button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function LessonForm({ lesson, onSave, onCancel }: any) {
  const [form, setForm] = useState({
    id: lesson.id,
    title: lesson.title || '',
    content_type: lesson.content_type || 'text',
    content: lesson.content || '',
    video_url: lesson.video_url || '',
    duration_minutes: lesson.duration_minutes || 10,
    order_index: lesson.order_index ?? 0
  });
  return (
    <div className="border border-primary-200 dark:border-primary-800 rounded-xl p-4 bg-primary-50/30 dark:bg-primary-900/10 space-y-3 mb-4">
      <h3 className="font-bold text-sm">{lesson.id ? 'Modifier la leçon' : 'Nouvelle leçon'}</h3>
      <input className="input" placeholder="Titre de la leçon" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <div className="grid sm:grid-cols-3 gap-3">
        <select className="input" value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>
          <option value="text">📄 Texte</option>
          <option value="video">🎥 Vidéo</option>
          <option value="interactive">⚡ Interactif</option>
          <option value="quiz">📝 Quiz</option>
          <option value="pdf">📕 PDF</option>
        </select>
        <input type="number" className="input" placeholder="Durée (min)" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })} />
        <input type="number" className="input" placeholder="Ordre" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} />
      </div>
      {form.content_type === 'video' && (
        <input className="input" placeholder="URL de la vidéo" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
      )}
      <textarea className="input" rows={5} placeholder="Contenu de la leçon..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      <div className="flex gap-2">
        <button onClick={() => onSave(form)} className="btn-primary"><Save size={16} /> Enregistrer</button>
        <button onClick={onCancel} className="btn-secondary"><X size={16} /> Annuler</button>
      </div>
    </div>
  );
}
