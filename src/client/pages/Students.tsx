import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Search, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { getInitials } from '../lib/utils';

export function StudentsPage() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let endpoint = '/users?role=eleve';
      if (user?.role === 'parent') endpoint = '/users/parent/children';
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(endpoint);
      if (res.success) setStudents(res.data || []);
      setLoading(false);
    })();
  }, [user, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3">
          <Users className="text-primary-600" size={32} />
          {user?.role === 'parent' ? t('nav.children') : t('nav.students')}
        </h1>
        <p className="text-gray-600">{students.length} {user?.role === 'parent' ? 'enfant(s)' : 'élève(s)'}</p>
      </div>

      {user?.role !== 'parent' && (
        <div className="card p-4">
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
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : students.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <Users className="mx-auto mb-3" size={48} />
          <p>Aucun élève</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((s: any) => (
            <Link to={`/app/students/${s.id}`} key={s.id} className="card p-5 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {getInitials(s.first_name, s.last_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{s.first_name} {s.last_name}</h3>
                  {s.class_name && <p className="text-xs text-gray-500">{s.class_name}</p>}
                  {s.school_name && <p className="text-xs text-gray-500 truncate">{s.school_name}</p>}
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
