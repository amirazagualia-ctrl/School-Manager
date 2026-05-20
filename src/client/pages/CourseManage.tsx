import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { marked } from 'marked';
import {
  Plus, BookOpen, Edit2, Trash2, Eye, Sparkles, Save, X, FileText, Video, Code,
  CheckSquare, ArrowLeft, Wand2, Eye as EyeIcon, EyeOff, Filter, Search,
  Layers, Clock, GraduationCap, Loader2
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { cn, getCycleColor } from '../lib/utils';

marked.setOptions({ gfm: true, breaks: true });

type Lesson = {
  id?: number;
  title: string;
  content_type: 'text' | 'video' | 'interactive' | 'quiz' | 'pdf';
  content?: string | null;
  video_url?: string | null;
  duration_minutes: number;
  order_index: number;
};

// ============================================================
// PAGE PRINCIPALE
// ============================================================
export function CourseManagePage() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const [courses, setCourses] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [editingLessons, setEditingLessons] = useState<any | null>(null);
  const [aiWizardOpen, setAiWizardOpen] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCycle, setFilterCycle] = useState<string>('');

  const loadCourses = async () => {
    const res = await api.get('/courses?published=false');
    if (res.success) setCourses(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const [sub, gr, sec] = await Promise.all([
        api.get('/curriculum/subjects'),
        api.get('/curriculum/grade-levels'),
        api.get('/curriculum/sections')
      ]);
      if (sub.success) setSubjects(sub.data || []);
      if (gr.success) setGrades(gr.data || []);
      if (sec.success) setSections(sec.data || []);
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

  // Filtrage
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.title?.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q)) return false;
      }
      if (filterCycle) {
        const grade = grades.find((g) => g.id === c.grade_level_id);
        if (!grade || grade.cycle !== filterCycle) return false;
      }
      return true;
    });
  }, [courses, search, filterCycle, grades]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  if (editingLessons) {
    return <LessonsEditor course={editingLessons} onClose={() => { setEditingLessons(null); loadCourses(); }} />;
  }

  if (editing) {
    return (
      <CourseEditor
        course={editing}
        subjects={subjects}
        grades={grades}
        sections={sections}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  if (aiWizardOpen) {
    return (
      <AICourseWizard
        subjects={subjects}
        grades={grades}
        sections={sections}
        onCancel={() => setAiWizardOpen(false)}
        onDone={(course: any) => {
          setAiWizardOpen(false);
          loadCourses();
          // Optionnel : ouvrir directement les leçons du cours créé
          if (course) setEditingLessons(course);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">📚 Gestion des cours interactifs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Créez, modifiez et publiez vos cours conformes au programme tunisien
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setAiWizardOpen(true)}
            className="btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Wand2 size={18} /> Générer avec l'IA
          </button>
          <button onClick={() => setEditing({})} className="btn-primary">
            <Plus size={18} /> Nouveau cours
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox icon={BookOpen} label="Total cours" value={courses.length} color="primary" />
        <StatBox icon={EyeIcon} label="Publiés" value={courses.filter((c) => c.is_published).length} color="green" />
        <StatBox icon={EyeOff} label="Brouillons" value={courses.filter((c) => !c.is_published).length} color="yellow" />
        <StatBox icon={Layers} label="Total leçons" value={courses.reduce((s, c) => s + (c.lessons_count || 0), 0)} color="purple" />
      </div>

      {/* Filtres */}
      <div className="card p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input ps-10"
            placeholder="Rechercher un cours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['', 'primaire', 'college', 'lycee'].map((cycle) => (
            <button
              key={cycle || 'all'}
              onClick={() => setFilterCycle(cycle)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition border',
                filterCycle === cycle
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300'
              )}
            >
              {cycle === '' ? 'Tous' : cycle === 'primaire' ? '🎒 Primaire' : cycle === 'college' ? '📚 Collège' : '🎓 Lycée'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {filteredCourses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500 mb-4">
            {search || filterCycle ? 'Aucun cours ne correspond aux filtres' : 'Aucun cours créé'}
          </p>
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
              {filteredCourses.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: c.subject_color }}
                      >
                        <BookOpen size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{c.title}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>{c.subject_name}</span>
                          {c.duration_minutes > 0 && (
                            <>
                              <span>•</span>
                              <Clock size={11} /> <span>{c.duration_minutes} min</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell">{c.grade_name}</td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell">
                    <span className="badge bg-blue-100 text-blue-700">{c.lessons_count || 0} leçons</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(c)}
                      className={cn(
                        'badge cursor-pointer',
                        c.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      )}
                      title="Cliquer pour changer le statut"
                    >
                      {c.is_published ? '✓ Publié' : '◯ Brouillon'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingLessons(c)}
                        className="btn-ghost !p-2"
                        title="Gérer les leçons"
                      >
                        <FileText size={16} />
                      </button>
                      <Link to={`/app/courses/${c.id}`} className="btn-ghost !p-2" title="Aperçu">
                        <Eye size={16} />
                      </Link>
                      <button onClick={() => setEditing(c)} className="btn-ghost !p-2" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="btn-ghost !p-2 text-red-600"
                        title="Supprimer"
                      >
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

// ============================================================
// STAT BOX
// ============================================================
function StatBox({ icon: Icon, label, value, color }: any) {
  const colors: Record<string, string> = {
    primary: 'from-primary-500 to-primary-600',
    green: 'from-green-500 to-emerald-600',
    yellow: 'from-yellow-500 to-orange-500',
    purple: 'from-purple-500 to-pink-600'
  };
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br text-white flex items-center justify-center', colors[color])}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

// ============================================================
// COURSE EDITOR (création/édition d'un cours)
// ============================================================
function CourseEditor({ course, subjects, grades, sections, onSave, onCancel }: any) {
  const [form, setForm] = useState({
    id: course.id,
    title: course.title || '',
    title_ar: course.title_ar || '',
    title_en: course.title_en || '',
    description: course.description || '',
    subject_id: course.subject_id || '',
    grade_level_id: course.grade_level_id || '',
    section_id: course.section_id || '',
    difficulty: course.difficulty || 'moyen',
    duration_minutes: course.duration_minutes || 30,
    language: course.language || 'fr',
    cover_image: course.cover_image || ''
  });
  const [saving, setSaving] = useState(false);

  const selectedGrade = grades.find((g: any) => g.id === Number(form.grade_level_id));
  const isLycee = selectedGrade?.cycle === 'lycee';

  const handleSubmit = async () => {
    if (!form.title || !form.subject_id || !form.grade_level_id) {
      alert('Titre, matière et niveau sont requis');
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
      >
        <ArrowLeft size={16} /> Retour à la liste
      </button>
      <div className="card p-6 lg:p-8">
        <h2 className="text-xl font-bold mb-1">{course.id ? '✏️ Modifier le cours' : '✨ Nouveau cours'}</h2>
        <p className="text-sm text-gray-500 mb-6">
          Renseignez les informations de base. Vous pourrez ajouter les leçons interactives à l'étape suivante.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Titre principal */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Titre du cours *</label>
            <input
              className="input"
              placeholder="Ex: Les fonctions du second degré"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Titres traduits */}
          <div>
            <label className="block text-sm font-medium mb-2">Titre arabe</label>
            <input
              className="input"
              placeholder="العنوان بالعربية"
              value={form.title_ar}
              onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Titre anglais</label>
            <input
              className="input"
              placeholder="English title"
              value={form.title_en}
              onChange={(e) => setForm({ ...form, title_en: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Décrivez les objectifs et le contenu du cours..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Matière */}
          <div>
            <label className="block text-sm font-medium mb-2">Matière *</label>
            <select
              className="input"
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: parseInt(e.target.value) || '' })}
            >
              <option value="">Sélectionner...</option>
              {subjects.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name_fr} ({s.name_ar})</option>
              ))}
            </select>
          </div>

          {/* Niveau */}
          <div>
            <label className="block text-sm font-medium mb-2">Niveau *</label>
            <select
              className="input"
              value={form.grade_level_id}
              onChange={(e) => setForm({ ...form, grade_level_id: parseInt(e.target.value) || '' })}
            >
              <option value="">Sélectionner...</option>
              <optgroup label="🎒 Primaire">
                {grades.filter((g: any) => g.cycle === 'primaire').map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name_fr}</option>
                ))}
              </optgroup>
              <optgroup label="📚 Collège">
                {grades.filter((g: any) => g.cycle === 'college').map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name_fr}</option>
                ))}
              </optgroup>
              <optgroup label="🎓 Lycée">
                {grades.filter((g: any) => g.cycle === 'lycee').map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name_fr}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Section (lycée uniquement) */}
          {isLycee && (
            <div>
              <label className="block text-sm font-medium mb-2">Section (Lycée)</label>
              <select
                className="input"
                value={form.section_id}
                onChange={(e) => setForm({ ...form, section_id: e.target.value ? parseInt(e.target.value) : '' })}
              >
                <option value="">Toutes sections</option>
                {sections.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name_fr}</option>
                ))}
              </select>
            </div>
          )}

          {/* Langue */}
          <div>
            <label className="block text-sm font-medium mb-2">Langue du cours</label>
            <select
              className="input"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            >
              <option value="fr">🇫🇷 Français</option>
              <option value="ar">🇹🇳 العربية</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>

          {/* Difficulté */}
          <div>
            <label className="block text-sm font-medium mb-2">Difficulté</label>
            <select
              className="input"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              <option value="facile">🟢 Facile</option>
              <option value="moyen">🟡 Moyen</option>
              <option value="difficile">🔴 Difficile</option>
            </select>
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium mb-2">Durée estimée (min)</label>
            <input
              type="number"
              min="0"
              max="600"
              className="input"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
            />
          </div>

          {/* Image de couverture */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Image de couverture (URL)</label>
            <input
              className="input"
              type="url"
              placeholder="https://..."
              value={form.cover_image}
              onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {course.id ? 'Mettre à jour' : 'Créer le cours'}
          </button>
          <button onClick={onCancel} className="btn-secondary">
            <X size={18} /> Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LESSONS EDITOR
// ============================================================
function LessonsEditor({ course, onClose }: any) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [aiLessonOpen, setAiLessonOpen] = useState(false);

  const load = async () => {
    const res = await api.get(`/courses/${course.id}`);
    if (res.success) setLessons(res.data.lessons || []);
  };
  useEffect(() => {
    load();
  }, [course.id]);

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
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={onClose}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
      >
        <ArrowLeft size={16} /> Retour à la liste des cours
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">📖 {course.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gestion des leçons interactives • {lessons.length} leçon{lessons.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAiLessonOpen(true)}
              className="btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles size={18} /> Générer avec IA
            </button>
            <button
              onClick={() => setEditingLesson({ order_index: lessons.length + 1, content_type: 'text' })}
              className="btn-primary"
            >
              <Plus size={18} /> Ajouter une leçon
            </button>
          </div>
        </div>

        {aiLessonOpen && (
          <AILessonGenerator
            courseTitle={course.title}
            language={course.language || 'fr'}
            onClose={() => setAiLessonOpen(false)}
            onGenerated={async (lesson: any) => {
              setAiLessonOpen(false);
              setEditingLesson({ ...lesson, order_index: lessons.length + 1 });
            }}
          />
        )}

        {editingLesson && (
          <LessonForm
            lesson={editingLesson}
            onSave={save}
            onCancel={() => setEditingLesson(null)}
          />
        )}

        <div className="space-y-2 mt-4">
          {lessons.length === 0 && !editingLesson ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="mx-auto mb-2" size={36} />
              <p className="mb-3">Aucune leçon. Commencez par en créer une !</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setAiLessonOpen(true)} className="btn-primary bg-gradient-to-r from-purple-600 to-pink-600">
                  <Sparkles size={16} /> Génération IA
                </button>
                <button
                  onClick={() => setEditingLesson({ order_index: 1, content_type: 'text' })}
                  className="btn-secondary"
                >
                  <Plus size={16} /> Manuellement
                </button>
              </div>
            </div>
          ) : (
            lessons.map((lesson: any, i: number) => {
              const Icon =
                lesson.content_type === 'video' ? Video :
                lesson.content_type === 'interactive' ? Code :
                lesson.content_type === 'quiz' ? CheckSquare :
                FileText;
              const typeColor =
                lesson.content_type === 'video' ? 'bg-red-100 text-red-700' :
                lesson.content_type === 'interactive' ? 'bg-purple-100 text-purple-700' :
                lesson.content_type === 'quiz' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700';
              return (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-sm transition"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeColor)}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{lesson.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span className={cn('badge', typeColor)}>{lesson.content_type}</span>
                      <Clock size={11} /> <span>{lesson.duration_minutes} min</span>
                    </div>
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

// ============================================================
// LESSON FORM (avec aperçu Markdown + helpers interactifs)
// ============================================================
function LessonForm({ lesson, onSave, onCancel }: any) {
  const [form, setForm] = useState<Lesson>({
    id: lesson.id,
    title: lesson.title || '',
    content_type: lesson.content_type || 'text',
    content: lesson.content || '',
    video_url: lesson.video_url || '',
    duration_minutes: lesson.duration_minutes || 10,
    order_index: lesson.order_index ?? 0
  });
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);

  const insertTemplate = (template: string) => {
    setForm({ ...form, content: template });
  };

  const templates: Record<string, string> = {
    cours_text: `# Titre principal\n\n## Introduction\n\nIntroduction du concept...\n\n## Définition\n\n> **Définition** : ...\n\n## Exemple\n\nVoici un exemple :\n\n$$f(x) = ax^2 + bx + c$$\n\n## À retenir\n\n- Point clé 1\n- Point clé 2\n- Point clé 3`,
    exercise: JSON.stringify({
      type: 'exercise',
      problem: 'Énoncé du problème',
      steps: [
        { q: 'Étape 1 : ...', a: 'Réponse' },
        { q: 'Étape 2 : ...', a: 'Réponse' }
      ]
    }, null, 2),
    matching: JSON.stringify({
      type: 'matching',
      instructions: 'Associe chaque élément à sa définition',
      pairs: [
        { left: 'Terme A', right: 'Définition A' },
        { left: 'Terme B', right: 'Définition B' }
      ]
    }, null, 2),
    code: JSON.stringify({
      type: 'code',
      language: 'python',
      prompt: 'Écris un programme qui...',
      starter: '# Ton code ici\n',
      solution: '# Solution\nprint("Hello")'
    }, null, 2),
    essay: JSON.stringify({
      type: 'essay',
      subject: 'Sujet de dissertation',
      plan_suggestion: ['I. Thèse', 'II. Antithèse', 'III. Synthèse']
    }, null, 2)
  };

  // Rendu de l'aperçu
  const previewHtml = useMemo(() => {
    if (form.content_type === 'text' && form.content) {
      try {
        return marked.parse(form.content) as string;
      } catch {
        return '<p class="text-red-600">Erreur de rendu Markdown</p>';
      }
    }
    if (form.content_type === 'interactive' && form.content) {
      try {
        const parsed = JSON.parse(form.content);
        return `<div class="prose">
          <h4>Type : <code>${parsed.type}</code></h4>
          <pre class="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">${JSON.stringify(parsed, null, 2)}</pre>
        </div>`;
      } catch {
        return '<p class="text-red-600">⚠️ JSON invalide</p>';
      }
    }
    if (form.content_type === 'video' && form.video_url) {
      return `<div><p>Vidéo : <a href="${form.video_url}" target="_blank">${form.video_url}</a></p></div>`;
    }
    if (form.content_type === 'quiz') {
      return '<p class="text-gray-500">Les quiz utilisent les questions liées au cours via la page Évaluations.</p>';
    }
    return '<p class="text-gray-400 italic">Aperçu vide</p>';
  }, [form.content, form.content_type, form.video_url]);

  const handleSubmit = async () => {
    if (!form.title || !form.content_type) {
      alert('Titre et type sont requis');
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="border-2 border-primary-200 dark:border-primary-800 rounded-xl p-5 bg-primary-50/40 dark:bg-primary-900/10 space-y-4 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base">
          {lesson.id ? '✏️ Modifier la leçon' : '➕ Nouvelle leçon'}
        </h3>
        <button onClick={onCancel} className="btn-ghost !p-1.5">
          <X size={18} />
        </button>
      </div>

      {/* Titre */}
      <div>
        <label className="block text-xs font-medium mb-1 text-gray-600">Titre *</label>
        <input
          className="input"
          placeholder="Titre de la leçon"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      {/* Type + durée + ordre */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Type de contenu</label>
          <select
            className="input"
            value={form.content_type}
            onChange={(e) => setForm({ ...form, content_type: e.target.value as Lesson['content_type'] })}
          >
            <option value="text">📄 Texte (Markdown)</option>
            <option value="video">🎥 Vidéo</option>
            <option value="interactive">⚡ Interactif</option>
            <option value="quiz">📝 Quiz</option>
            <option value="pdf">📕 PDF</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Durée (min)</label>
          <input
            type="number"
            min="1"
            className="input"
            value={form.duration_minutes}
            onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Ordre</label>
          <input
            type="number"
            min="0"
            className="input"
            value={form.order_index}
            onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* URL vidéo */}
      {form.content_type === 'video' && (
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">URL de la vidéo (YouTube, Vimeo, MP4...)</label>
          <input
            type="url"
            className="input"
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.video_url || ''}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
          />
        </div>
      )}

      {/* Templates pour interactive */}
      {form.content_type === 'interactive' && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-600 self-center">Templates :</span>
          <button type="button" onClick={() => insertTemplate(templates.exercise)} className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200">
            🎯 Exercice
          </button>
          <button type="button" onClick={() => insertTemplate(templates.matching)} className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200">
            🔗 Associer
          </button>
          <button type="button" onClick={() => insertTemplate(templates.code)} className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 hover:bg-green-200">
            💻 Code
          </button>
          <button type="button" onClick={() => insertTemplate(templates.essay)} className="px-3 py-1 text-xs rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200">
            ✍️ Dissertation
          </button>
        </div>
      )}

      {/* Template texte */}
      {form.content_type === 'text' && !form.content && (
        <button
          type="button"
          onClick={() => insertTemplate(templates.cours_text)}
          className="text-xs px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200"
        >
          📋 Insérer un template de cours
        </button>
      )}

      {/* Éditeur + aperçu */}
      {form.content_type !== 'quiz' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">
              Contenu {form.content_type === 'text' && '(Markdown supporté)'}
              {form.content_type === 'interactive' && '(JSON)'}
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-primary-600 hover:underline flex items-center gap-1"
            >
              {showPreview ? <EyeOff size={14} /> : <EyeIcon size={14} />}
              {showPreview ? 'Masquer' : 'Afficher'} l'aperçu
            </button>
          </div>
          <div className={cn('grid gap-3', showPreview ? 'md:grid-cols-2' : 'grid-cols-1')}>
            <textarea
              className="input font-mono text-sm"
              rows={12}
              placeholder={
                form.content_type === 'text'
                  ? '# Mon titre\n\nÉcris ton contenu en **Markdown**...'
                  : form.content_type === 'interactive'
                  ? '{"type":"exercise","problem":"..."}'
                  : 'Contenu de la leçon...'
              }
              value={form.content || ''}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            {showPreview && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 overflow-auto max-h-96">
                <div className="text-xs text-gray-500 mb-2 font-medium">📺 Aperçu</div>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-primary-200 dark:border-primary-800">
        <button onClick={handleSubmit} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Enregistrer
        </button>
        <button onClick={onCancel} className="btn-secondary">
          <X size={16} /> Annuler
        </button>
      </div>
    </div>
  );
}

// ============================================================
// AI COURSE WIZARD (génère un cours complet)
// ============================================================
function AICourseWizard({ subjects, grades, sections, onCancel, onDone }: any) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    subject_id: '',
    grade_level_id: '',
    section_id: '',
    topic: '',
    difficulty: 'moyen',
    lessons_count: 4,
    language: 'fr'
  });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const selectedGrade = grades.find((g: any) => g.id === Number(form.grade_level_id));
  const isLycee = selectedGrade?.cycle === 'lycee';

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/ai/generate-course', form);
      if (res.success) {
        setGenerated(res.data);
        setStep(3);
      } else {
        alert('Erreur : ' + (res.error || 'inconnue'));
      }
    } catch (err: any) {
      alert('Erreur réseau : ' + err.message);
    }
    setGenerating(false);
  };

  const handleCreate = async () => {
    if (!generated) return;
    setSaving(true);
    const payload = {
      ...form,
      title: generated.title,
      title_ar: generated.title_ar,
      title_en: generated.title_en,
      description: generated.description,
      duration_minutes: generated.duration_minutes,
      is_published: false,
      lessons: generated.lessons || []
    };
    const res = await api.post('/courses/full', payload);
    setSaving(false);
    if (res.success) {
      onDone(res.data);
    } else {
      alert('Erreur création : ' + (res.error || 'inconnue'));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <button onClick={onCancel} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600">
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="card p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center">
            <Wand2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Génération IA d'un cours interactif</h2>
            <p className="text-sm text-gray-500">
              {generated?._mode === 'demo'
                ? "⚠️ Mode démo activé (configurez OPENAI_API_KEY pour l'IA réelle)"
                : 'Conforme au programme officiel tunisien'}
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                  step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                )}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={cn('flex-1 h-1 rounded', step > s ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700')} />
              )}
            </div>
          ))}
        </div>

        {/* STEP 1 : Contexte */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold">1. Contexte du cours</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Matière *</label>
                <select className="input" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: parseInt(e.target.value) || '' as any })}>
                  <option value="">Sélectionner...</option>
                  {subjects.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name_fr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Niveau *</label>
                <select className="input" value={form.grade_level_id} onChange={(e) => setForm({ ...form, grade_level_id: parseInt(e.target.value) || '' as any })}>
                  <option value="">Sélectionner...</option>
                  <optgroup label="🎒 Primaire">
                    {grades.filter((g: any) => g.cycle === 'primaire').map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name_fr}</option>
                    ))}
                  </optgroup>
                  <optgroup label="📚 Collège">
                    {grades.filter((g: any) => g.cycle === 'college').map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name_fr}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🎓 Lycée">
                    {grades.filter((g: any) => g.cycle === 'lycee').map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name_fr}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              {isLycee && (
                <div>
                  <label className="block text-sm font-medium mb-2">Section (Lycée)</label>
                  <select className="input" value={form.section_id} onChange={(e) => setForm({ ...form, section_id: e.target.value ? parseInt(e.target.value) : '' as any })}>
                    <option value="">Toutes</option>
                    {sections.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name_fr}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Langue</label>
                <select className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="ar">🇹🇳 العربية</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-3">
              <button
                disabled={!form.subject_id || !form.grade_level_id}
                onClick={() => setStep(2)}
                className="btn-primary"
              >
                Étape suivante →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 : Sujet précis */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold">2. Précisez le sujet</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Sujet du cours *</label>
              <input
                className="input"
                placeholder="Ex: Les équations du second degré, La photosynthèse, Le passé composé..."
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-2">
                Soyez précis. L'IA générera un cours adapté au niveau choisi et au programme tunisien.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Difficulté</label>
                <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="facile">🟢 Facile</option>
                  <option value="moyen">🟡 Moyen</option>
                  <option value="difficile">🔴 Difficile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nombre de leçons</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  className="input"
                  value={form.lessons_count}
                  onChange={(e) => setForm({ ...form, lessons_count: parseInt(e.target.value) || 4 })}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-3">
              <button onClick={() => setStep(1)} className="btn-secondary">← Précédent</button>
              <button
                disabled={!form.topic || generating}
                onClick={handleGenerate}
                className="btn-primary bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {generating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {generating ? 'Génération...' : 'Générer le cours'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 : Prévisualisation */}
        {step === 3 && generated && (
          <div className="space-y-4">
            <h3 className="font-bold">3. Prévisualisation et validation</h3>
            {generated._mode === 'demo' && (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
                ⚠️ Mode démo activé. Le cours est un squelette générique. Configurez <code>OPENAI_API_KEY</code> pour activer la génération IA réelle.
              </div>
            )}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
              <h4 className="text-lg font-bold mb-1">{generated.title}</h4>
              {generated.title_ar && <p className="text-sm text-gray-600 mb-1" dir="rtl">{generated.title_ar}</p>}
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{generated.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <span><Clock size={12} className="inline" /> {generated.duration_minutes} min</span>
                <span>📚 {generated.lessons?.length || 0} leçons</span>
              </div>
              <div className="space-y-2">
                {(generated.lessons || []).map((l: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{l.title}</div>
                      <div className="text-xs text-gray-500">
                        {l.content_type} • {l.duration_minutes} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-3">
              <button onClick={() => setStep(2)} className="btn-secondary">← Modifier</button>
              <button onClick={handleGenerate} disabled={generating} className="btn-secondary">
                {generating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Régénérer
              </button>
              <button onClick={handleCreate} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Créer le cours
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// AI LESSON GENERATOR (une leçon)
// ============================================================
function AILessonGenerator({ courseTitle, language, onClose, onGenerated }: any) {
  const [form, setForm] = useState({
    lesson_title: '',
    content_type: 'text' as 'text' | 'interactive' | 'quiz',
    context: ''
  });
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!form.lesson_title) return;
    setGenerating(true);
    const res = await api.post('/ai/generate-lesson', {
      course_title: courseTitle,
      ...form,
      language
    });
    setGenerating(false);
    if (res.success) {
      onGenerated({
        title: res.data.title || form.lesson_title,
        content_type: form.content_type,
        content: res.data.content,
        duration_minutes: res.data.duration_minutes || 15
      });
    } else {
      alert('Erreur : ' + (res.error || 'inconnue'));
    }
  };

  return (
    <div className="border-2 border-purple-300 dark:border-purple-700 rounded-xl p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 space-y-3 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Sparkles className="text-purple-600" size={18} /> Génération IA d'une leçon
        </h3>
        <button onClick={onClose} className="btn-ghost !p-1.5">
          <X size={18} />
        </button>
      </div>
      <input
        className="input"
        placeholder="Titre de la leçon (ex: La forme canonique)"
        value={form.lesson_title}
        onChange={(e) => setForm({ ...form, lesson_title: e.target.value })}
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <select
          className="input"
          value={form.content_type}
          onChange={(e) => setForm({ ...form, content_type: e.target.value as any })}
        >
          <option value="text">📄 Texte (Markdown)</option>
          <option value="interactive">⚡ Exercice interactif</option>
          <option value="quiz">📝 Quiz (génère les questions séparément)</option>
        </select>
        <input
          className="input"
          placeholder="Contexte / précisions (optionnel)"
          value={form.context}
          onChange={(e) => setForm({ ...form, context: e.target.value })}
        />
      </div>
      <div className="flex gap-2">
        <button
          disabled={!form.lesson_title || generating}
          onClick={handleGenerate}
          className="btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {generating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          Générer
        </button>
        <button onClick={onClose} className="btn-secondary">
          <X size={16} /> Annuler
        </button>
      </div>
    </div>
  );
}
