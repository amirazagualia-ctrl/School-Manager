import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Send, Sparkles, MessageSquare, Plus, User } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { cn } from '../lib/utils';
import i18n from '../lib/i18n';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

export function TutorPage() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const [conversations, setConversations] = useState<any[]>([]);
  const [convId, setConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const [convs, subs] = await Promise.all([
        api.get('/ai/tutor/conversations'),
        api.get('/curriculum/subjects')
      ]);
      if (convs.success) setConversations(convs.data || []);
      if (subs.success) setSubjects(subs.data || []);
    })();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async (id: number) => {
    setConvId(id);
    const res = await api.get(`/ai/tutor/conversations/${id}`);
    if (res.success) {
      setMessages((res.data as any).messages.map((m: any) => ({ role: m.role, content: m.content })));
    }
  };

  const newConversation = () => {
    setConvId(null);
    setMessages([]);
    setSelectedSubject('');
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: userMsg }]);
    setSending(true);

    const res = await api.post('/ai/tutor/chat', {
      message: userMsg,
      conversation_id: convId,
      subject_id: selectedSubject || undefined,
      language: i18n.language
    });

    setSending(false);
    if (res.success && res.data) {
      const data = res.data as any;
      setMessages((m) => [...m, { role: 'assistant', content: data.response }]);
      if (!convId) {
        setConvId(data.conversation_id);
        // Refresh list
        const convs = await api.get('/ai/tutor/conversations');
        if (convs.success) setConversations(convs.data || []);
      }
    } else {
      setMessages((m) => [...m, { role: 'assistant', content: '❌ Erreur: ' + (res.error || 'inconnue') }]);
    }
  };

  const examples = [
    '🧮 Comment résoudre une équation du second degré ?',
    '📐 Explique-moi le théorème de Pythagore',
    '⚗️ Quels sont les états de la matière ?',
    '📖 Aide-moi à conjuguer le verbe "être" au passé composé',
    '🌍 Capitales des pays du Maghreb ?'
  ];

  return (
    <div className="space-y-4 h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="text-white" size={22} />
            </div>
            {t('ai.tutor')}
          </h1>
          <p className="text-gray-600 text-sm mt-1">Assistant IA pédagogique pour tous les niveaux</p>
        </div>
        <button onClick={newConversation} className="btn-secondary">
          <Plus size={16} /> Nouvelle conversation
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 h-full">
        {/* Historique */}
        <div className="card p-3 overflow-y-auto lg:max-h-[calc(100vh-14rem)]">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 px-2">Conversations</h3>
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-400 px-2 py-4 text-center">Aucune conversation</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => loadConversation(c.id)}
                  className={cn(
                    'w-full text-start p-2 rounded-lg text-sm',
                    convId === c.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{c.title || 'Sans titre'}</div>
                      {c.subject_name && <div className="text-[10px] text-gray-500">{c.subject_name}</div>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="card p-0 flex flex-col lg:col-span-3 lg:max-h-[calc(100vh-14rem)]">
          {/* Sélecteur matière */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <span className="text-xs text-gray-500">Matière:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-sm bg-transparent border-none focus:outline-none font-medium"
              disabled={convId !== null}
            >
              <option value="">Toutes</option>
              {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name_fr}</option>)}
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="text-white" size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Bonjour {user?.first_name} ! 👋</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Je suis <strong>Ostadh</strong>, ton tuteur IA. Pose-moi n'importe quelle question sur le programme scolaire tunisien !
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                  {examples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(ex.substring(ex.indexOf(' ') + 1))}
                      className="text-xs px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >{ex}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                  m.role === 'user' ? 'bg-primary-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'
                )}>
                  {m.role === 'user' ? <User className="text-white" size={18} /> : <Bot className="text-white" size={18} />}
                </div>
                <div className={cn(
                  'max-w-[75%] p-3 rounded-2xl',
                  m.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 dark:bg-gray-800 rounded-tl-sm'
                )}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="text-white" size={18} />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder={t('ai.askQuestion')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                disabled={sending}
              />
              <button onClick={send} disabled={!input.trim() || sending} className="btn-primary">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
