import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import { getInitials, formatDate } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

export function StudentProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get(`/users/students/${id}/profile`);
      if (res.success) setData(res.data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  if (!data) return <div className="card p-8 text-center">Profil introuvable</div>;

  const { student, grades, averages, progress } = data;
  const overallAvg = averages?.length
    ? (averages.reduce((s: number, a: any) => s + Number(a.average), 0) / averages.length).toFixed(2)
    : '—';

  return (
    <div className="space-y-6">
      <Link to="/app/students" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600">
        <ArrowLeft size={16} /> Retour
      </Link>

      {/* Header */}
      <div className="card p-6 lg:p-8 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
            {getInitials(student.first_name, student.last_name)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{student.first_name} {student.last_name}</h1>
            <p className="opacity-90 text-sm mt-1">
              {student.class_name && `${student.class_name} • `}
              {student.grade_name}
              {student.section_name && ` • ${student.section_name}`}
            </p>
            <p className="opacity-75 text-xs mt-1">{student.school_name}</p>
            {student.student_number && (
              <span className="badge bg-white/20 mt-2">N° {student.student_number}</span>
            )}
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{overallAvg}</div>
            <div className="text-xs opacity-90">Moyenne générale</div>
          </div>
        </div>
      </div>

      {/* Moyennes par matière */}
      {averages?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary-600" size={20} /> Moyennes par matière
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={averages}>
              <XAxis dataKey="name_fr" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 20]} />
              <Tooltip formatter={(v: any) => Number(v).toFixed(2) + '/20'} />
              <Bar dataKey="average" radius={[8, 8, 0, 0]}>
                {averages.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color || '#0f766e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Dernières notes */}
        <div className="card p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Award className="text-primary-600" size={20} /> Dernières notes
          </h2>
          {grades?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Aucune note</p>
          ) : (
            <div className="space-y-2">
              {grades?.slice(0, 10).map((g: any) => (
                <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: g.subject_color }}>
                    <Award size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{g.subject_name}</div>
                    <div className="text-xs text-gray-500">{g.grade_type} • {formatDate(g.recorded_at)}</div>
                  </div>
                  <div className="text-xl font-bold" style={{ color: g.score >= 10 ? '#16a34a' : '#dc2626' }}>
                    {g.score}<span className="text-xs text-gray-500">/{g.max_score}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progression cours */}
        <div className="card p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <BookOpen className="text-primary-600" size={20} /> Progression
          </h2>
          {progress?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Aucune progression</p>
          ) : (
            <div className="space-y-2">
              {progress?.slice(0, 8).map((p: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm truncate flex-1">{p.course_title}</div>
                    <span className="text-xs text-gray-500">{p.progress_percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${p.progress_percentage}%`, background: p.subject_color || '#0f766e' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
