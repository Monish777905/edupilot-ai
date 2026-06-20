# EduPilot AI - Voice-Enabled Classroom Co-Pilot

A comprehensive AI-powered Smart Board Dashboard designed for classroom teachers and students, combining multiple intelligent teaching tools into a single, unified interface.

## 🎯 Project Overview

EduPilot AI is a production-ready web application that empowers educators with intelligent teaching tools powered by large language models (LLMs), speech-to-text, and AI image generation. The platform supports bilingual instruction in English, Hindi, and Hinglish, making it accessible to diverse classrooms across India.

### Key Features

- **Smart Board Dashboard** - Centralized hub for accessing all teaching modules
- **8 Integrated Teaching Modules** - Concept Simplifier, Quiz Generator, Doubt Solver, Story Mode, Lesson Planner, AI Whiteboard, Activity Guide, and Translation
- **Bilingual Support** - Full support for English, Hindi, and Hinglish
- **LLM-Powered Content** - AI-generated explanations, quizzes, lesson plans, and more
- **AI Visual Generation** - Educational diagrams and illustrations via image generation API
- **Responsive Design** - Works on desktop, tablet, and smart board displays
- **User Authentication** - Manus OAuth integration with role-based access control

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11 + Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **APIs**: Manus Built-in APIs (LLM, Image Generation, Speech-to-Text)
- **Deployment**: Manus Autoscale (Serverless)

### Project Structure

```
edupilot-ai/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Module pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ConceptSimplifier.tsx
│   │   │   ├── QuizGenerator.tsx
│   │   │   ├── DoubtSolver.tsx
│   │   │   ├── StoryMode.tsx
│   │   │   ├── LessonPlanner.tsx
│   │   │   ├── Whiteboard.tsx
│   │   │   ├── ActivityGuide.tsx
│   │   │   └── Translation.tsx
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/trpc.ts       # tRPC client
│   │   └── App.tsx           # Main router
│   └── index.html
├── server/                    # Express backend
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   ├── storage.ts            # S3 storage helpers
│   └── _core/                # Framework code
├── drizzle/                   # Database schema & migrations
│   └── schema.ts
├── shared/                    # Shared types & constants
└── references/               # Integration guides

```

## 📚 Module Documentation

### 1. Concept Simplifier
Breaks down complex topics into grade-appropriate explanations across three depth levels.

**Features:**
- Three-level explanations (Beginner, Intermediate, Advanced)
- Automatic key points extraction
- Language support: English, Hindi, Hinglish
- LLM-powered content generation

**Usage:**
```typescript
const generateMutation = trpc.conceptSimplifier.generateExplanation.useMutation();
await generateMutation.mutateAsync({
  topic: "Photosynthesis",
  gradeLevel: "beginner",
  language: "hinglish"
});
```

### 2. Quiz Generator
Creates interactive quizzes with multiple-choice and short-answer questions.

**Features:**
- MCQ and short-answer question types
- Configurable question count (1-20)
- Instant feedback and scoring
- Progress tracking
- Language support: English, Hindi, Hinglish

**Usage:**
```typescript
const generateMutation = trpc.quizGenerator.generateQuiz.useMutation();
await generateMutation.mutateAsync({
  topic: "Fractions",
  questionCount: 10,
  quizType: "mixed",
  language: "hinglish"
});
```

### 3. Doubt Solver
Chat interface for students to ask questions and receive step-by-step AI-guided answers.

**Features:**
- Multi-turn conversation support
- Step-by-step answer generation
- Chat history persistence
- Language support: English, Hindi, Hinglish

**Usage:**
```typescript
const createChatMutation = trpc.doubtSolver.createChat.useMutation();
const addMessageMutation = trpc.doubtSolver.addMessage.useMutation();

await createChatMutation.mutateAsync({ topic: "Photosynthesis" });
await addMessageMutation.mutateAsync({
  chatId: 1,
  studentMessage: "What is photosynthesis?",
  language: "hinglish"
});
```

### 4. Story Mode
Transforms curriculum topics into engaging narrative stories with comprehension questions.

**Features:**
- Narrative story generation
- Grade-level appropriate content (Primary, Middle, Secondary)
- Comprehension questions generation
- Language support: English, Hindi, Hinglish

**Usage:**
```typescript
const generateMutation = trpc.storyMode.generateStory.useMutation();
await generateMutation.mutateAsync({
  topic: "The Water Cycle",
  gradeLevel: "primary",
  language: "hinglish"
});
```

### 5. Lesson Planner
Generates structured lesson plans with learning objectives, teaching flow, and activities.

**Features:**
- Structured lesson plan generation
- Learning objectives
- Teaching flow timeline
- Activity suggestions
- Quiz topics and homework
- Configurable duration (15-480 minutes)

**Usage:**
```typescript
const generateMutation = trpc.lessonPlanner.generateLessonPlan.useMutation();
await generateMutation.mutateAsync({
  topic: "Fractions",
  gradeLevel: "5",
  durationMinutes: 45,
  language: "hinglish"
});
```

### 6. AI Whiteboard
Generates educational diagrams, concept maps, and illustrations from text prompts.

**Features:**
- AI image generation for educational visuals
- SVG diagram generation
- Multiple content types: Diagram, Concept Map, Flowchart, Illustration
- Language support: English, Hindi, Hinglish

**Usage:**
```typescript
const generateMutation = trpc.whiteboard.generateContent.useMutation();
await generateMutation.mutateAsync({
  prompt: "Draw a diagram of the water cycle",
  contentType: "diagram",
  language: "hinglish"
});
```

### 7. Activity Guide
Suggests hands-on classroom activities, experiments, and group exercises.

**Features:**
- Activity type selection (Hands-on, Experiment, Group Discussion, Interactive)
- Materials and duration estimation
- Learning outcomes
- Grade-level appropriate suggestions

**Usage:**
```typescript
const generateMutation = trpc.activityGuide.generateActivity.useMutation();
await generateMutation.mutateAsync({
  topic: "Ecosystems",
  gradeLevel: "5",
  activityType: "experiment",
  language: "hinglish"
});
```

### 8. Bilingual Translation
Supports translation between English, Hindi, and Hinglish for lesson content.

**Features:**
- English ↔ Hindi translation
- Hinglish support
- Language swap functionality
- Real-time translation display

**Usage:**
```typescript
const translateMutation = trpc.translation.translate.useMutation();
await translateMutation.mutateAsync({
  text: "Photosynthesis is the process...",
  sourceLanguage: "en",
  targetLanguage: "hi"
});
```

## 🔧 Backend API Reference

All backend features are exposed via tRPC procedures. The main routers are:

- `conceptSimplifier.generateExplanation` - Generate simplified explanations
- `quizGenerator.generateQuiz` - Create quizzes
- `quizGenerator.submitAnswers` - Submit quiz answers
- `doubtSolver.createChat` - Create doubt chat
- `doubtSolver.addMessage` - Add message to doubt chat
- `storyMode.generateStory` - Generate story
- `lessonPlanner.generateLessonPlan` - Generate lesson plan
- `activityGuide.generateActivity` - Generate activity
- `translation.translate` - Translate text
- `whiteboard.generateContent` - Generate whiteboard content
- `voice.transcribeAudioFile` - Transcribe audio

## 📦 Database Schema

### Core Tables

- **users** - User accounts with role-based access
- **conceptSimplifications** - Stored concept explanations
- **quizzes** - Quiz definitions and results
- **translations** - Translation history
- **whiteboardContent** - Generated diagrams and visuals
- **doubtSolverChats** - Chat conversations
- **storyModeContent** - Generated stories
- **lessonPlans** - Generated lesson plans
- **activityGuides** - Generated activities
- **audioRecordings** - Voice input recordings

See `drizzle/schema.ts` for complete schema definition.

## 🚀 Deployment

### Prerequisites

- Node.js 22+
- pnpm package manager
- MySQL/TiDB database
- Manus account with API access

### Environment Variables

Required environment variables (automatically injected by Manus):

```
DATABASE_URL=mysql://...
JWT_SECRET=...
VITE_APP_ID=...
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=...
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_URL=...
```

### Deployment Steps

1. **Create Checkpoint** - Save project state via Management UI
2. **Click Publish** - Deploy to Manus Autoscale hosting
3. **Configure Domain** - Set custom domain in Settings → Domains
4. **Test Modules** - Verify all teaching modules work correctly

### Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Run tests
pnpm test

# Build for production
pnpm run build

# Start production server
pnpm run start
```

## 🔐 Security Features

- **Authentication**: Manus OAuth with session cookies
- **Authorization**: Role-based access control (user/admin)
- **Database**: Parameterized queries via Drizzle ORM
- **API**: Protected procedures require authentication
- **Storage**: S3 presigned URLs for file access

## 📊 Usage Analytics

The application includes built-in analytics tracking:

- Page views and user interactions
- Module usage statistics
- Quiz performance metrics
- Content generation frequency

Analytics are available in the Management UI Dashboard.

## 🛠️ Customization Guide

### Adding a New Teaching Module

1. **Create Database Table** in `drizzle/schema.ts`
2. **Generate Migration** via `pnpm drizzle-kit generate`
3. **Apply Migration** via Management UI SQL executor
4. **Add Query Helper** in `server/db.ts`
5. **Create tRPC Router** in `server/routers.ts`
6. **Build React Component** in `client/src/pages/`
7. **Add Route** in `client/src/App.tsx`
8. **Update Dashboard** navigation in `client/src/pages/Dashboard.tsx`

### Customizing LLM Prompts

All LLM prompts are defined in the tRPC routers. Modify the `systemPrompt` variable in each router to customize AI behavior:

```typescript
const systemPrompt = `You are an expert educational content creator...`;
```

### Changing Color Scheme

Update Tailwind CSS variables in `client/src/index.css`:

```css
@layer base {
  :root {
    --primary: 59 130 246; /* Blue */
    --secondary: 168 85 247; /* Purple */
    /* ... more colors ... */
  }
}
```

## 📝 Testing

### Unit Tests

Run Vitest for backend logic:

```bash
pnpm test
```

Example test file: `server/auth.logout.test.ts`

### Manual Testing Checklist

- [ ] Dashboard loads and displays all 8 modules
- [ ] Concept Simplifier generates explanations at all 3 levels
- [ ] Quiz Generator creates and scores quizzes correctly
- [ ] Doubt Solver maintains chat conversation
- [ ] Story Mode generates age-appropriate stories
- [ ] Lesson Planner creates structured plans
- [ ] AI Whiteboard generates images
- [ ] Activity Guide suggests relevant activities
- [ ] Translation works bidirectionally
- [ ] All modules support English, Hindi, and Hinglish

## 🐛 Troubleshooting

### LLM API Errors

If LLM calls fail:
1. Check `BUILT_IN_FORGE_API_KEY` is set correctly
2. Verify `BUILT_IN_FORGE_API_URL` is accessible
3. Check server logs in `.manus-logs/devserver.log`

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check database is running and accessible
3. Run migrations: `pnpm drizzle-kit migrate`

### Image Generation Failures

1. Check image generation API is available
2. Verify prompt is appropriate for image generation
3. Check server logs for detailed error messages

## 📚 Additional Resources

- **LLM Integration**: See `references/llm-integration.md`
- **Voice Transcription**: See `references/voice-transcription.md`
- **Image Generation**: See `references/image-generation.md`
- **File Storage**: See `references/file-storage.md`
- **Manus OAuth**: See `references/manus-oauth.md`

## 📄 License

This project is built on the Manus platform and follows Manus terms of service.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review integration references
3. Check `.manus-logs/` for error details
4. Contact Manus support at https://help.manus.im

---

**Version**: 1.0.0  
**Last Updated**: June 2026  
**Platform**: Manus Autoscale
