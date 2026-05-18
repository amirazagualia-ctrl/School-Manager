import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { School, MapPin, Users, GraduationCap, Phone, Mail } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export function SchoolsPage() {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get('/schools');
      if (res.success) setSchools(res.data || []);
      setLoading(false);
    })();
  }, []);

  const typeColors: Record<string, string> = {
    primaire: 'from-amber-400 to-orange-500',
    college: 'from-blue-500 to-indigo-600',
    lycee: 'from-emerald-500 to-teal-600'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3">
          <School className="text-primary-600" size={32} />
          {t('nav.schools')}
        </h1>
        <p className="text-gray-600">{schools.length} école(s)</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((s: any) => (
            <div key={s.id} className="card overflow-hidden hover:shadow-lg transition-all">
              <div className={cn('h-24 bg-gradient-to-br relative', typeColors[s.type])}>
                <div className="absolute inset-0 p-4 flex items-end justify-between text-white">
                  <span className="badge bg-white/20 backdrop-blur capitalize">{s.type}</span>
                  <School size={32} className="opacity-50" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-1">{s.name}</h3>
                {s.name_ar && <p className="text-sm text-gray-500 mb-2" dir="rtl">{s.name_ar}</p>}
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{s.governorate}</span>
                  </div>
                  {s.director_name && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={14} className="flex-shrink-0" />
                      <span className="truncate">{s.director_name}</span>
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} className="flex-shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
