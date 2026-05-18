// ============================================================
// ROUTES IA — Génération QCM, Correction, Tuteur, Recommandations
// ============================================================
import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, hasRole } from '../utils/auth';

export const aiRoutes = new Hono<{ Bindings: Bindings }>();

/**
 * Appel OpenAI Chat (avec fallback : si pas de clé, on génère localement)
 */
async function callOpenAI(
  apiKey: string | undefined,
  messages: Array<{ role: string; content: string }>,
  options: { temperature?: number; max_tokens?: number; json?: boolean } = {}
): Promise<string> {
  if (!apiKey) {
    // Mode démo (sans clé) - retourne une réponse type
    return JSON.stringify({
      _mode: 'demo',
      message: 'Mode démo : configurez OPENAI_API_KEY dans .dev.vars pour activer l\'IA réelle'
    });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      ...(options.json ? { response_format: { type: 'json_object' } } : {})
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error: ${error}`);
  }
  const data = (await response.json()) as any;
  return data.choices[0].message.content;
}

// ---------- GÉNÉRER DES QUESTIONS AUTOMATIQUEMENT ----------
aiRoutes.post('/generate-questions', async (c) => {
  const user = await requireAuth(c);
  if (!hasRole(user, 'enseignant', 'admin_ecole', 'ministere')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }

  const body = await c.req.json<any>();
  const { subject, grade, topic, count = 5, language = 'fr', difficulty = 'moyen', types = ['qcm'] } = body;

  if (!subject || !grade || !topic) {
    return c.json({ success: false, error: 'subject, grade et topic requis' }, 400);
  }

  const langInstruction =
    language === 'ar'
      ? 'Réponds en arabe (العربية).'
      : language === 'en'
      ? 'Respond in English.'
      : 'Réponds en français.';

  const prompt = `Tu es un expert en pédagogie tunisienne. Génère ${count} questions d'évaluation pour des élèves de ${grade} en ${subject} sur le sujet "${topic}".
Niveau de difficulté: ${difficulty}.
Types de questions autorisés: ${types.join(', ')}.
${langInstruction}

Retourne UN OBJET JSON strict de la forme :
{
  "questions": [
    {
      "question_text": "...",
      "question_type": "qcm" | "vrai_faux" | "reponse_courte",
      "options": ["...", "...", "...", "..."] (uniquement pour qcm/vrai_faux),
      "correct_answer": "...",
      "explanation": "Explication pédagogique de la réponse",
      "points": 2
    }
  ]
}
Assure-toi que les questions sont alignées sur le programme officiel tunisien.`;

  try {
    if (!c.env.OPENAI_API_KEY) {
      // Mode démo - questions fictives
      const demoQuestions = Array.from({ length: count }, (_, i) => ({
        question_text: `Question démo ${i + 1} sur ${topic} (${subject} - ${grade})`,
        question_type: 'qcm',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 'Option A',
        explanation: 'Activez l\'IA en configurant OPENAI_API_KEY pour obtenir de vraies questions.',
        points: 2
      }));
      return c.json({ success: true, data: { questions: demoQuestions, _mode: 'demo' } });
    }

    const content = await callOpenAI(
      c.env.OPENAI_API_KEY,
      [
        { role: 'system', content: 'Tu es un assistant pédagogique expert du programme scolaire tunisien.' },
        { role: 'user', content: prompt }
      ],
      { temperature: 0.8, json: true, max_tokens: 3000 }
    );

    const parsed = JSON.parse(content);
    return c.json({ success: true, data: parsed });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ---------- CORRIGER UNE RÉDACTION ----------
aiRoutes.post('/correct-answer', async (c) => {
  const user = await requireAuth(c);
  if (!user) return c.json({ success: false, error: 'Non authentifié' }, 401);

  const body = await c.req.json<any>();
  const { question, expected_answer, student_answer, max_points = 5, language = 'fr' } = body;

  if (!question || !student_answer) {
    return c.json({ success: false, error: 'Champs requis manquants' }, 400);
  }

  const prompt = `Tu es un correcteur pédagogique du système éducatif tunisien.
Question: ${question}
Réponse attendue: ${expected_answer || '(libre)'}
Réponse de l'élève: ${student_answer}
Note maximale: ${max_points}

Évalue la réponse et retourne un JSON strict :
{
  "score": (nombre entre 0 et ${max_points}),
  "is_correct": (boolean : true si réponse essentiellement correcte),
  "feedback": "Commentaire pédagogique constructif (3-4 phrases). Indique points forts, faibles, et conseils.",
  "strengths": ["..."],
  "improvements": ["..."]
}
Réponds en ${language === 'ar' ? 'arabe' : language === 'en' ? 'anglais' : 'français'}.`;

  try {
    if (!c.env.OPENAI_API_KEY) {
      return c.json({
        success: true,
        data: {
          score: Math.round(max_points * 0.5),
          is_correct: false,
          feedback: '[Mode démo] Configurez OPENAI_API_KEY pour activer la correction IA.',
          strengths: ['Effort fourni'],
          improvements: ['Activer l\'IA'],
          _mode: 'demo'
        }
      });
    }

    const content = await callOpenAI(
      c.env.OPENAI_API_KEY,
      [
        { role: 'system', content: 'Tu es un correcteur pédagogique bienveillant et précis.' },
        { role: 'user', content: prompt }
      ],
      { temperature: 0.3, json: true }
    );
    return c.json({ success: true, data: JSON.parse(content) });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ---------- TUTEUR IA (Chatbot) ----------
aiRoutes.post('/tutor/chat', async (c) => {
  const user = await requireAuth(c);
  if (!user) return c.json({ success: false, error: 'Non authentifié' }, 401);

  const body = await c.req.json<any>();
  const { message, conversation_id, subject_id, language = 'fr' } = body;
  if (!message) return c.json({ success: false, error: 'Message requis' }, 400);

  // Créer la conversation si elle n'existe pas
  let convId = conversation_id;
  if (!convId) {
    const titleSnippet = message.substring(0, 60);
    const res = await c.env.DB.prepare(
      'INSERT INTO ai_conversations (user_id, subject_id, title) VALUES (?, ?, ?)'
    )
      .bind(user.id, subject_id || null, titleSnippet)
      .run();
    convId = res.meta.last_row_id;
  }

  // Sauvegarder le message utilisateur
  await c.env.DB.prepare(
    'INSERT INTO ai_messages (conversation_id, role, content) VALUES (?, ?, ?)'
  )
    .bind(convId, 'user', message)
    .run();

  // Historique
  const { results: history } = await c.env.DB.prepare(
    'SELECT role, content FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 20'
  )
    .bind(convId)
    .all<any>();

  // Contexte matière
  let subjectContext = '';
  if (subject_id) {
    const subject = await c.env.DB.prepare('SELECT * FROM subjects WHERE id = ?').bind(subject_id).first<any>();
    if (subject) subjectContext = ` Matière en focus : ${subject.name_fr}.`;
  }

  const systemPrompt = `Tu es "Ostadh AI", un tuteur pédagogique pour les élèves tunisiens (du primaire au lycée).
- Tu maîtrises le programme scolaire officiel tunisien.
- Tu réponds en ${language === 'ar' ? 'arabe (العربية)' : language === 'en' ? 'anglais' : 'français'}.
- Tu es bienveillant, patient et pédagogue.
- Tu donnes des explications claires avec des exemples concrets.
- Tu encourages l'élève à réfléchir plutôt qu'à donner directement la réponse.
- Tu utilises des analogies adaptées à l'âge de l'élève.${subjectContext}
- Si la question est hors sujet (non scolaire), recentre poliment.`;

  try {
    let response: string;
    if (!c.env.OPENAI_API_KEY) {
      response = `[Mode démo] Bonjour ${user.first_name} ! Je suis Ostadh AI, ton tuteur. Pour activer l'IA réelle, configurez OPENAI_API_KEY dans .dev.vars.\n\nTu as demandé : "${message}"\n\nDès que l'IA sera activée, je pourrai t'aider sur toutes les matières du programme tunisien.`;
    } else {
      response = await callOpenAI(
        c.env.OPENAI_API_KEY,
        [
          { role: 'system', content: systemPrompt },
          ...history.map((m: any) => ({ role: m.role, content: m.content }))
        ],
        { temperature: 0.7, max_tokens: 1500 }
      );
    }

    // Sauvegarder la réponse
    await c.env.DB.prepare(
      'INSERT INTO ai_messages (conversation_id, role, content) VALUES (?, ?, ?)'
    )
      .bind(convId, 'assistant', response)
      .run();

    return c.json({ success: true, data: { conversation_id: convId, response } });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ---------- HISTORIQUE CONVERSATIONS ----------
aiRoutes.get('/tutor/conversations', async (c) => {
  const user = await requireAuth(c);
  if (!user) return c.json({ success: false, error: 'Non authentifié' }, 401);
  const { results } = await c.env.DB.prepare(
    `SELECT c.*, s.name_fr as subject_name,
            (SELECT COUNT(*) FROM ai_messages WHERE conversation_id = c.id) as messages_count
     FROM ai_conversations c
     LEFT JOIN subjects s ON s.id = c.subject_id
     WHERE c.user_id = ?
     ORDER BY c.created_at DESC LIMIT 50`
  )
    .bind(user.id)
    .all();
  return c.json({ success: true, data: results });
});

// ---------- MESSAGES D'UNE CONVERSATION ----------
aiRoutes.get('/tutor/conversations/:id', async (c) => {
  const user = await requireAuth(c);
  if (!user) return c.json({ success: false, error: 'Non authentifié' }, 401);
  const id = parseInt(c.req.param('id'));
  const conv = await c.env.DB.prepare(
    'SELECT * FROM ai_conversations WHERE id = ? AND user_id = ?'
  )
    .bind(id, user.id)
    .first();
  if (!conv) return c.json({ success: false, error: 'Introuvable' }, 404);
  const { results: messages } = await c.env.DB.prepare(
    'SELECT * FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC'
  )
    .bind(id)
    .all();
  return c.json({ success: true, data: { ...conv, messages } });
});

// ---------- RECOMMANDATIONS PERSONNALISÉES ----------
aiRoutes.get('/recommendations', async (c) => {
  const user = await requireAuth(c);
  if (!user) return c.json({ success: false, error: 'Non authentifié' }, 401);

  // Récupère le niveau de l'élève
  const profile = await c.env.DB.prepare(
    `SELECT sp.*, c.grade_level_id, c.section_id
     FROM student_profiles sp
     LEFT JOIN classes c ON c.id = sp.class_id
     WHERE sp.user_id = ?`
  )
    .bind(user.id)
    .first<any>();

  if (!profile) {
    return c.json({ success: true, data: [] });
  }

  // Analyse les notes pour trouver les matières faibles
  const { results: weakSubjects } = await c.env.DB.prepare(
    `SELECT s.id, s.name_fr, s.color, s.icon, AVG(g.score) as avg_score
     FROM grades g
     JOIN subjects s ON s.id = g.subject_id
     WHERE g.student_id = ?
     GROUP BY s.id
     HAVING avg_score < 14
     ORDER BY avg_score ASC
     LIMIT 3`
  )
    .bind(user.id)
    .all<any>();

  // Trouve des cours adaptés
  const recommendations: any[] = [];
  for (const subject of weakSubjects) {
    const { results: courses } = await c.env.DB.prepare(
      `SELECT c.*, s.name_fr as subject_name, s.color as subject_color
       FROM courses c
       JOIN subjects s ON s.id = c.subject_id
       WHERE c.subject_id = ? AND c.grade_level_id = ? AND c.is_published = 1
       LIMIT 3`
    )
      .bind(subject.id, profile.grade_level_id)
      .all();

    recommendations.push({
      subject,
      reason: `Moyenne actuelle: ${subject.avg_score.toFixed(2)}/20 - Renforcement conseillé`,
      courses
    });
  }

  return c.json({ success: true, data: recommendations });
});
