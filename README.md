# 🇹🇳 Madrasa TN — Plateforme Éducative Tunisienne

> **Application complète de gestion scolaire et d'apprentissage interactif avec IA, conçue pour le système éducatif tunisien (du Primaire au Baccalauréat).**

[![Stack](https://img.shields.io/badge/Stack-Hono%20%2B%20React%20%2B%20D1-0f766e)]()
[![PWA](https://img.shields.io/badge/PWA-installable-purple)]()
[![Langues](https://img.shields.io/badge/Langues-AR%20%7C%20FR%20%7C%20EN-blue)]()
[![IA](https://img.shields.io/badge/IA-OpenAI%20GPT--4-pink)]()

---

## ✨ Fonctionnalités

### 👥 5 types d'utilisateurs
- 🎓 **Élèves** — Suivi des cours, évaluations, tuteur IA, notes
- 👨‍🏫 **Enseignants** — Création de cours, génération d'évaluations IA, gestion des classes
- 👨‍💼 **Admins école** — Gestion des élèves, enseignants, classes
- 👨‍👩 **Parents** — Suivi de leurs enfants en temps réel
- 🏛️ **Ministère** — Statistiques nationales, vue d'ensemble du système

### 📚 Système éducatif tunisien complet
- **Primaire** : 1ère à 6ème année
- **Collège** : 7ème à 9ème année de base
- **Lycée** : Tronc Commun → sections Math, Sciences, Lettres, Économie, Technique, Informatique, Sport
- **18 matières** avec coefficients et heures hebdomadaires officiels
- Support **arabe (RTL)**, **français** et **anglais**

### 📖 Cours interactifs
- Création de cours avec leçons (texte, vidéo, PDF, interactif, quiz)
- Système de progression par élève
- Interface d'administration complète (CRUD)
- Statistiques de vues et engagement

### 🤖 Intelligence Artificielle (Ostadh AI)
- **Génération automatique de QCM** alignés sur le programme tunisien
- **Correction automatique** des rédactions avec feedback pédagogique
- **Tuteur IA conversationnel** (chatbot) pour répondre aux questions
- **Recommandations personnalisées** basées sur les notes faibles

### 📊 Évaluations
- Quiz, devoirs, examens, contrôles
- 4 types de questions : QCM, vrai/faux, réponse courte, rédaction
- Correction automatique + IA pour les rédactions
- Tableau de scores et progression

### 📱 PWA (Progressive Web App)
- **Installable** sur Android, iOS, Windows, Mac, Linux
- Fonctionne en **mode natif** (sans navigateur)
- Service Worker pour mise en cache hors ligne
- Manifest avec icônes et thème

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- npm

### Installation

```bash
# Installer les dépendances
npm install

# Appliquer les migrations + seed
npm run db:reset

# Construire l'app
npm run build

# Lancer le serveur (Cloudflare Pages local)
npm run dev:worker
```

L'app sera disponible sur `http://localhost:3000`

### 🔑 Comptes de démonstration

Tous les comptes ont le mot de passe : **`Demo123!`**

| Rôle | Email | Description |
|------|-------|-------------|
| 🎓 Élève | `eleve@edu.tn` | Yassine Ben Ali — 3ème Math |
| 🎓 Élève | `eleve2@edu.tn` | Sarra Trabelsi (AR) |
| 👨‍🏫 Enseignant | `prof.math@edu.tn` | Prof de mathématiques |
| 👨‍🏫 Enseignant | `prof.arabe@edu.tn` | Prof d'arabe |
| 👨‍👩 Parent | `parent@edu.tn` | Parent de Yassine |
| 👨‍💼 Admin école | `admin@edu.tn` | Directeur lycée pilote |
| 🏛️ Ministère | `ministere@edu.tn` | Super admin national |

---

## 🛠️ Architecture technique

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND (PWA)                       │
│  React 18 + TypeScript + Tailwind CSS + Vite             │
│  • Router : react-router-dom                             │
│  • State : Zustand                                       │
│  • i18n : react-i18next (AR / FR / EN)                   │
│  • Charts : Recharts                                     │
│  • Installable comme app native (PWA)                    │
└──────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────┐
│                  BACKEND (Cloudflare)                    │
│  Hono (sur Pages Functions)                              │
│  • Routes : Auth, Users, Courses, Curriculum,            │
│             Assessments, AI, Dashboard, Schools          │
│  • Sessions : tokens en base D1                          │
│  • Hash mot de passe : SHA-512 + salt                    │
└──────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────┐
│                    DATABASE (D1)                         │
│  SQLite via Cloudflare D1                                │
│  • 20+ tables                                            │
│  • Relations complètes                                   │
└──────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────┐
│                     IA (OpenAI)                          │
│  • GPT-4o-mini pour génération de questions              │
│  • Correction automatique de rédactions                  │
│  • Chatbot tuteur "Ostadh"                               │
└──────────────────────────────────────────────────────────┘
```

### 📁 Structure du projet

```
madrasa-tn/
├── migrations/
│   ├── 0001_initial_schema.sql    # Schéma complet
│   └── seed.sql                    # Données de démo
├── functions/api/[[path]].ts       # Catch-all Cloudflare Pages
├── src/
│   ├── shared/types.ts             # Types TS partagés
│   ├── worker/                     # Backend Hono
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── auth.ts             # Login, register, me
│   │   │   ├── users.ts            # Profils, notes
│   │   │   ├── curriculum.ts       # Niveaux, sections, matières
│   │   │   ├── courses.ts          # CRUD cours + leçons
│   │   │   ├── assessments.ts      # Quiz + corrections
│   │   │   ├── ai.ts               # Génération + tuteur IA
│   │   │   ├── schools.ts          # Écoles
│   │   │   └── dashboard.ts        # Stats par rôle
│   │   └── utils/auth.ts           # Sessions, hash
│   └── client/                     # Frontend React
│       ├── App.tsx                 # Router
│       ├── pages/                  # 13 pages
│       ├── components/             # Composants UI
│       ├── store/auth.ts           # Auth Zustand
│       ├── lib/api.ts              # Client API
│       ├── lib/i18n.ts             # i18n
│       └── locales/                # FR/AR/EN
└── public/                         # Icônes PWA
```

---

## 🔐 Configuration de l'IA (optionnel)

Par défaut, l'app fonctionne en **mode démo** sans clé OpenAI (réponses prédéfinies).

Pour activer l'IA réelle, créez un fichier `.dev.vars` :

```bash
# .dev.vars
OPENAI_API_KEY=sk-votre-cle-openai
```

Pour le déploiement Cloudflare Pages, ajoutez la variable dans le dashboard.

---

## 🌍 Déploiement sur Cloudflare Pages

```bash
# Créer la base D1 en production
npx wrangler d1 create madrasa-tn-db

# Mettre à jour wrangler.toml avec le database_id

# Appliquer les migrations en production
npx wrangler d1 migrations apply DB --remote

# Charger les données initiales
npx wrangler d1 execute DB --remote --file=./migrations/seed.sql

# Déployer
npm run build
npx wrangler pages deploy dist --project-name=madrasa-tn
```

---

## 📚 API Endpoints

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Curriculum
- `GET /api/curriculum/overview` — Vue d'ensemble (cycles, sections, matières)
- `GET /api/curriculum/grade-levels`
- `GET /api/curriculum/sections`
- `GET /api/curriculum/subjects`
- `GET /api/curriculum/by-level/:gradeId`

### Cours
- `GET /api/courses` (filtres : subject_id, grade_level_id, search)
- `GET /api/courses/:id` (avec leçons)
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`
- `POST /api/courses/:id/lessons`
- `POST /api/courses/:id/progress`

### Évaluations
- `GET /api/assessments`
- `POST /api/assessments`
- `POST /api/assessments/:id/questions`
- `POST /api/assessments/:id/attempts`
- `POST /api/assessments/attempts/:id/submit`

### IA
- `POST /api/ai/generate-questions` — Génération QCM
- `POST /api/ai/correct-answer` — Correction rédaction
- `POST /api/ai/tutor/chat` — Chatbot
- `GET /api/ai/tutor/conversations`
- `GET /api/ai/recommendations` — Cours suggérés

### Utilisateurs
- `GET /api/users` (filtres : role, school_id)
- `GET /api/users/students/:id/profile`
- `POST /api/users/students/:id/grades`
- `GET /api/users/parent/children`

### Écoles
- `GET /api/schools`
- `GET /api/schools/:id`
- `GET /api/schools/:id/classes`

### Dashboard
- `GET /api/dashboard/stats` — Stats selon le rôle

---

## 🎨 Captures d'écran (fonctionnalités)

- ✅ Page d'accueil moderne avec présentation
- ✅ Connexion rapide avec comptes démo
- ✅ Dashboard adaptatif (5 vues selon le rôle)
- ✅ Explorateur de cursus interactif
- ✅ Catalogue de cours avec filtres
- ✅ Lecteur de cours avec leçons
- ✅ Interface de gestion des cours (CRUD complet)
- ✅ Évaluations avec timer et progression
- ✅ Générateur d'évaluation IA
- ✅ Chatbot tuteur Ostadh AI
- ✅ Profils élèves détaillés avec graphiques
- ✅ Paramètres multi-langues
- ✅ Liste des écoles

---

## 🛣️ Roadmap

- [ ] Notifications push
- [ ] Module de planning / emploi du temps
- [ ] Génération de bulletins PDF
- [ ] Chat parent ↔ enseignant
- [ ] Mode hors ligne complet
- [ ] App natives via Capacitor

---

## 📄 Licence

MIT — Conçu avec ❤️ pour l'éducation tunisienne 🇹🇳
