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
  env: Bindings,
  messages: Array<{ role: string; content: string }>,
  options: { temperature?: number; max_tokens?: number; json?: boolean; model?: string } = {}
): Promise<string> {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    return JSON.stringify({
      _mode: 'demo',
      message: 'Mode démo : configurez OPENAI_API_KEY pour activer l\'IA réelle'
    });
  }

  const baseUrl = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = options.model || env.OPENAI_MODEL || 'gpt-5-mini';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
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

// ---------- GÉNÉRER UN COURS COMPLET (avec leçons) ----------
aiRoutes.post('/generate-course', async (c) => {
  const user = await requireAuth(c);
  if (!user || !hasRole(user, 'enseignant', 'admin_ecole', 'ministere')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }

  const body = await c.req.json<any>();
  const {
    subject_id,
    grade_level_id,
    section_id,
    topic,
    language = 'fr',
    difficulty = 'moyen',
    lessons_count = 4
  } = body;

  if (!subject_id || !grade_level_id || !topic) {
    return c.json({ success: false, error: 'subject_id, grade_level_id et topic requis' }, 400);
  }

  // Récupère les libellés pour le prompt
  const subject = await c.env.DB.prepare('SELECT * FROM subjects WHERE id = ?').bind(subject_id).first<any>();
  const grade = await c.env.DB.prepare('SELECT * FROM grade_levels WHERE id = ?').bind(grade_level_id).first<any>();
  const section = section_id
    ? await c.env.DB.prepare('SELECT * FROM sections WHERE id = ?').bind(section_id).first<any>()
    : null;

  if (!subject || !grade) return c.json({ success: false, error: 'Matière/niveau introuvable' }, 404);

  const langInstruction =
    language === 'ar' ? 'Réponds entièrement en arabe (العربية).' :
    language === 'en' ? 'Respond entirely in English.' :
    'Réponds entièrement en français.';

  const prompt = `Tu es un expert pédagogique du programme officiel tunisien. Génère un cours interactif complet.

CONTEXTE :
- Matière : ${subject.name_fr}
- Niveau : ${grade.name_fr} (cycle ${grade.cycle})
${section ? `- Section : ${section.name_fr}` : ''}
- Sujet : "${topic}"
- Difficulté : ${difficulty}
- Nombre de leçons : ${lessons_count}

${langInstruction}

Le cours DOIT être strictement conforme au programme officiel tunisien et adapté à l'âge des élèves.

Retourne un OBJET JSON STRICT de la forme :
{
  "title": "Titre du cours (court, clair)",
  "title_ar": "العنوان بالعربية",
  "title_en": "English title",
  "description": "Description pédagogique du cours (2-3 phrases)",
  "duration_minutes": (nombre total estimé),
  "lessons": [
    {
      "title": "Titre de la leçon 1",
      "content_type": "text" | "interactive" | "quiz",
      "content": "Contenu Markdown structuré avec titres ##, listes, exemples, formules LaTeX entre $...$. POUR interactive : JSON object {type, instructions, ...}",
      "duration_minutes": (nombre)
    }
  ]
}

RÈGLES IMPORTANTES :
1. Première leçon = introduction (type "text", contenu Markdown riche)
2. Leçons intermédiaires = mélange text/interactive
3. Dernière leçon = quiz (content_type "quiz", content peut être null)
4. Pour les leçons "interactive", le content doit être un JSON valide stringifié, par exemple :
   - {"type":"exercise","problem":"...","steps":[{"q":"...","a":"..."}]}
   - {"type":"matching","instructions":"...","pairs":[{"left":"...","right":"..."}]}
   - {"type":"code","language":"python","prompt":"...","starter":"...","solution":"..."}
5. Utilise des exemples tunisiens quand pertinent (gouvernorats, dinar, contexte local)`;

  try {
    if (!c.env.OPENAI_API_KEY) {
      // Mode démo : template intelligent
      const demoLessons = [
        {
          title: `Introduction : ${topic}`,
          content_type: 'text',
          content: `# ${topic}\n\nBienvenue dans ce cours de **${subject.name_fr}** pour le niveau **${grade.name_fr}**.\n\n## Objectifs pédagogiques\n- Comprendre les notions fondamentales\n- Maîtriser les techniques de base\n- Appliquer les connaissances\n\n## Plan du cours\n1. Découverte du sujet\n2. Concepts clés\n3. Exercices pratiques\n4. Évaluation\n\n_⚡ Mode démo : activez OPENAI_API_KEY pour des contenus générés par IA._`,
          duration_minutes: 15
        },
        {
          title: 'Concepts fondamentaux',
          content_type: 'text',
          content: `## Concepts clés de ${topic}\n\n### Définitions\n- **Concept 1** : Explication de base\n- **Concept 2** : Explication de base\n\n### Exemples concrets\n1. Premier exemple détaillé\n2. Deuxième exemple détaillé\n\n### À retenir\n> Point important à mémoriser pour la suite du cours.`,
          duration_minutes: 20
        },
        {
          title: 'Exercice interactif',
          content_type: 'interactive',
          content: JSON.stringify({
            type: 'exercise',
            instructions: `Applique les concepts vus dans ce cours sur ${topic}.`,
            problem: `Résous l'exercice suivant lié à ${topic}`,
            auto_generated: true
          }),
          duration_minutes: 20
        },
        {
          title: 'Quiz final',
          content_type: 'quiz',
          content: null,
          duration_minutes: 15
        }
      ];
      return c.json({
        success: true,
        data: {
          title: `${topic} - ${grade.name_fr}`,
          title_ar: `${topic} - ${grade.name_ar}`,
          title_en: `${topic} - ${grade.name_en}`,
          description: `Cours sur ${topic} adapté au programme tunisien de ${grade.name_fr}.`,
          duration_minutes: 70,
          lessons: demoLessons,
          _mode: 'demo'
        }
      });
    }

    const content = await callOpenAI(
      c.env,
      [
        { role: 'system', content: 'Tu es un expert pédagogique du système éducatif tunisien. Tu génères des cours interactifs structurés en JSON valide.' },
        { role: 'user', content: prompt }
      ],
      { temperature: 0.7, json: true, max_tokens: 4000 }
    );
    const parsed = JSON.parse(content);
    return c.json({ success: true, data: parsed });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ---------- GÉNÉRER UNE LEÇON UNIQUE ----------
aiRoutes.post('/generate-lesson', async (c) => {
  const user = await requireAuth(c);
  if (!user || !hasRole(user, 'enseignant', 'admin_ecole', 'ministere')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }

  const body = await c.req.json<any>();
  const { course_title, lesson_title, content_type = 'text', language = 'fr', context = '' } = body;
  if (!lesson_title) return c.json({ success: false, error: 'lesson_title requis' }, 400);

  const langInstr = language === 'ar' ? 'Réponds en arabe.' : language === 'en' ? 'Respond in English.' : 'Réponds en français.';

  let typeInstr = '';
  if (content_type === 'text') {
    typeInstr = 'Le contenu doit être du Markdown riche avec titres ##, ###, listes, exemples, formules LaTeX $...$, et tableaux.';
  } else if (content_type === 'interactive') {
    typeInstr = 'Le contenu doit être un JSON stringifié avec format {"type":"exercise"|"matching"|"code","instructions":"...",...}';
  } else if (content_type === 'quiz') {
    typeInstr = 'Pas besoin de contenu pour le quiz (utilisera les questions liées). Mets content=null.';
  }

  const prompt = `Tu es un expert pédagogique tunisien. Génère une leçon interactive.

Cours parent : "${course_title || 'cours général'}"
Titre de la leçon : "${lesson_title}"
Type : ${content_type}
Contexte : ${context}

${typeInstr}
${langInstr}

Retourne un JSON STRICT : {"title": "...", "content": "...", "duration_minutes": (nombre 5-30)}`;

  try {
    if (!c.env.OPENAI_API_KEY) {
      let demoContent: any = null;
      if (content_type === 'text') {
        demoContent = `# ${lesson_title}\n\n## Introduction\n\nCette leçon traite de **${lesson_title}**.\n\n### Points clés\n- Premier point important\n- Deuxième point important\n- Troisième point important\n\n### Exemple\nVoici un exemple concret pour illustrer la notion.\n\n> ⚡ Mode démo : activez OPENAI_API_KEY pour des contenus générés par IA.`;
      } else if (content_type === 'interactive') {
        demoContent = JSON.stringify({ type: 'exercise', instructions: lesson_title, problem: 'Exercice de démonstration', auto_generated: true });
      }
      return c.json({ success: true, data: { title: lesson_title, content: demoContent, duration_minutes: 15, _mode: 'demo' } });
    }

    const content = await callOpenAI(
      c.env,
      [
        { role: 'system', content: 'Tu es un expert pédagogique du programme tunisien.' },
        { role: 'user', content: prompt }
      ],
      { temperature: 0.7, json: true, max_tokens: 2000 }
    );
    const parsed = JSON.parse(content);
    return c.json({ success: true, data: parsed });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

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
      c.env,
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
      c.env,
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
        c.env,
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
