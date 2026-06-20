# EduPilot AI - Implementation Guide

This guide provides detailed information about how each teaching module is implemented and how to extend or modify them.

## Architecture Overview

EduPilot AI follows a three-tier architecture:

```
┌─────────────────────────────────────────────┐
│         React Frontend (Client)             │
│  - Dashboard, Module Pages, UI Components   │
└──────────────────┬──────────────────────────┘
                   │ tRPC Client
                   ↓
┌─────────────────────────────────────────────┐
│     Express Backend (Server)                │
│  - tRPC Routers, LLM Integration            │
│  - Database Queries, API Orchestration      │
└──────────────────┬──────────────────────────┘
                   │ SQL
                   ↓
┌─────────────────────────────────────────────┐
│      MySQL/TiDB Database                    │
│  - User Data, Content History               │
└─────────────────────────────────────────────┘
```

## Module Implementation Details

### 1. Concept Simplifier

**Frontend Flow:**
1. User enters topic and selects grade level
2. Component calls `trpc.conceptSimplifier.generateExplanation.useMutation()`
3. Displays explanation with key points

**Backend Flow:**
1. Receives topic, gradeLevel, language
2. Creates system prompt with educational context
3. Calls LLM with user prompt
4. Extracts key points via second LLM call
5. Saves to database
6. Returns explanation and key points

**Database:**
```sql
CREATE TABLE conceptSimplifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  topic VARCHAR(255) NOT NULL,
  gradeLevel ENUM('beginner', 'intermediate', 'advanced'),
  explanation LONGTEXT,
  keyPoints JSON,
  language VARCHAR(20),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**LLM Prompts:**
- System: "You are an expert educational content creator..."
- User: "Explain {topic} in a simple way suitable for {gradeLevel} level students..."

### 2. Quiz Generator

**Frontend Flow:**
1. User enters topic, question count, quiz type
2. Calls `trpc.quizGenerator.generateQuiz.useMutation()`
3. Displays quiz with progress tracking
4. On submit, calls `trpc.quizGenerator.submitAnswers.useMutation()`
5. Shows results with score and feedback

**Backend Flow:**
1. Generates questions via LLM with JSON schema
2. Stores quiz in database
3. On submit, calculates score by comparing answers
4. Returns score percentage and breakdown

**Question Format (JSON):**
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "What is photosynthesis?",
      "type": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    }
  ]
}
```

**Scoring Logic:**
```typescript
const correctCount = questions.filter(q => 
  userAnswers[q.id] === q.correctAnswer
).length;
const score = (correctCount / questions.length) * 100;
```

### 3. Doubt Solver

**Frontend Flow:**
1. User creates new chat session
2. Enters question/doubt
3. Calls `trpc.doubtSolver.addMessage.useMutation()`
4. Displays AI response with message history
5. Can continue conversation

**Backend Flow:**
1. Creates chat record in database
2. On each message:
   - Retrieves chat history
   - Calls LLM with conversation context
   - Appends new messages to history
   - Updates database
   - Returns latest response

**Message Format:**
```typescript
interface Message {
  role: "student" | "ai";
  content: string;
  timestamp: string;
}
```

**System Prompt:**
```
You are a helpful educational assistant for Indian classrooms.
Answer student questions clearly and step-by-step.
Provide examples when helpful.
```

### 4. Story Mode

**Frontend Flow:**
1. User enters topic and selects grade level
2. Calls `trpc.storyMode.generateStory.useMutation()`
3. Displays story title and narrative content
4. Shows comprehension questions below story

**Backend Flow:**
1. Generates story narrative via LLM
2. Extracts title from story content
3. Generates comprehension questions via second LLM call
4. Saves to database
5. Returns story with questions

**Story Generation Prompt:**
```
Create an engaging story about "{topic}" for {gradeLevel} students.
Make it fun, memorable, and educational.
Include a title.
```

**Comprehension Questions Format:**
```json
{
  "questions": [
    {
      "question": "What happened in the story?",
      "correctAnswer": "..."
    }
  ]
}
```

### 5. Lesson Planner

**Frontend Flow:**
1. User enters topic, grade level, duration
2. Calls `trpc.lessonPlanner.generateLessonPlan.useMutation()`
3. Displays structured lesson plan with:
   - Learning objectives
   - Teaching flow timeline
   - Activities
   - Quiz topics
   - Homework

**Backend Flow:**
1. Generates lesson plan via LLM with JSON schema
2. Structures response into components
3. Saves to database
4. Returns complete lesson plan

**Lesson Plan Structure:**
```json
{
  "learningObjectives": ["Objective 1", "Objective 2"],
  "teachingFlow": [
    {
      "phase": "Introduction",
      "duration": 10,
      "description": "..."
    }
  ],
  "activities": ["Activity 1", "Activity 2"],
  "quizTopics": ["Topic 1", "Topic 2"],
  "homework": ["Task 1", "Task 2"]
}
```

### 6. AI Whiteboard

**Frontend Flow:**
1. User enters prompt describing what to draw
2. Selects content type (diagram, concept map, etc.)
3. Calls `trpc.whiteboard.generateContent.useMutation()`
4. Displays generated image

**Backend Flow:**
1. Calls image generation API with enhanced prompt
2. Calls LLM to generate SVG description
3. Stores both image URL and SVG content
4. Returns to frontend

**Image Generation Prompt:**
```
Educational {contentType} for: {userPrompt}
Classroom-friendly, clear, labeled.
```

**SVG Generation:**
Uses LLM to create simple SVG markup for educational diagrams.

### 7. Activity Guide

**Frontend Flow:**
1. User enters topic, grade level, activity type
2. Calls `trpc.activityGuide.generateActivity.useMutation()`
3. Displays activity details:
   - Title and description
   - Instructions
   - Materials needed
   - Duration
   - Learning outcomes

**Backend Flow:**
1. Generates activity via LLM with JSON schema
2. Structures response
3. Saves to database
4. Returns activity details

**Activity Structure:**
```json
{
  "title": "Activity Title",
  "description": "...",
  "instructions": ["Step 1", "Step 2"],
  "materials": ["Material 1", "Material 2"],
  "estimatedDuration": 30,
  "learningOutcomes": ["Outcome 1", "Outcome 2"]
}
```

### 8. Bilingual Translation

**Frontend Flow:**
1. User enters text in source language
2. Selects source and target languages
3. Calls `trpc.translation.translate.useMutation()`
4. Displays translated text side-by-side

**Backend Flow:**
1. Creates translation prompt with language context
2. Calls LLM for translation
3. Saves translation history
4. Returns translated text

**Translation Prompt:**
```
You are a professional translator specializing in educational content.
Translate from {sourceLanguage} to {targetLanguage}.
Maintain educational accuracy and classroom-friendly language.
```

## Database Query Patterns

All database operations follow this pattern in `server/db.ts`:

```typescript
export async function createConceptSimplification(data: {
  userId: number;
  topic: string;
  gradeLevel: string;
  explanation: string;
  keyPoints: string[];
}) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(conceptSimplifications).values({
    userId: data.userId,
    topic: data.topic,
    gradeLevel: data.gradeLevel,
    explanation: data.explanation,
    keyPoints: JSON.stringify(data.keyPoints),
    createdAt: new Date(),
  });
}
```

## LLM Integration

All LLM calls use the `invokeLLM` function from `server/_core/llm.ts`:

```typescript
const response = await invokeLLM({
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "response_name",
      strict: true,
      schema: { /* JSON schema */ }
    }
  }
});
```

### Key Features:
- **Streaming Support**: For long-form content
- **JSON Schema**: For structured responses
- **Error Handling**: Graceful fallbacks
- **Token Optimization**: Efficient prompting

## Image Generation Integration

Image generation uses `generateImage` from `server/_core/imageGeneration.ts`:

```typescript
const result = await generateImage({
  prompt: "Educational diagram of the water cycle",
});
// Returns: { url: "https://...", key: "..." }
```

## Voice Integration

Voice transcription uses `transcribeAudio` from `server/_core/voiceTranscription.ts`:

```typescript
const result = await transcribeAudio({
  audioUrl: "https://...",
  language: "hi", // or "en"
  prompt: "Optional context"
});
// Returns: { text: "...", language: "...", segments: [...] }
```

## Adding a New Module

To add a new teaching module:

### 1. Database Schema
Add table to `drizzle/schema.ts`:
```typescript
export const newModules = mysqlTable("new_modules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content"),
  createdAt: timestamp("createdAt").defaultNow(),
});
```

### 2. Generate Migration
```bash
pnpm drizzle-kit generate
```

### 3. Apply Migration
Execute generated SQL via Management UI.

### 4. Database Helper
Add to `server/db.ts`:
```typescript
export async function createNewModule(data: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(newModules).values(data);
}
```

### 5. tRPC Router
Add to `server/routers.ts`:
```typescript
newModule: router({
  generate: protectedProcedure
    .input(z.object({ /* input schema */ }))
    .mutation(async ({ input, ctx }) => {
      // Implementation
    }),
}),
```

### 6. React Component
Create `client/src/pages/NewModule.tsx`:
```typescript
export default function NewModule() {
  const mutation = trpc.newModule.generate.useMutation();
  // Component implementation
}
```

### 7. Update Routes
Add to `client/src/App.tsx`:
```typescript
<Route path="/new-module" component={() => (
  <DashboardLayout>
    <NewModule />
  </DashboardLayout>
)} />
```

### 8. Update Dashboard
Add to `client/src/pages/Dashboard.tsx`:
```typescript
{
  icon: IconComponent,
  title: "New Module",
  description: "...",
  path: "/new-module",
  color: "from-color-500 to-color-600",
}
```

## Testing

### Unit Tests
Create `server/newModule.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("newModule", () => {
  it("should generate content", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.newModule.generate({ /* input */ });
    expect(result).toBeDefined();
  });
});
```

### Manual Testing
1. Test with different inputs
2. Test error cases
3. Test with different languages
4. Verify database persistence
5. Test on different screen sizes

## Performance Optimization

### LLM Calls
- Cache common prompts
- Use streaming for long responses
- Batch similar requests
- Monitor token usage

### Database
- Add indexes on frequently queried columns
- Use pagination for large result sets
- Archive old records periodically

### Frontend
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Lazy load module pages
- Optimize images with responsive sizes

## Security Considerations

1. **Input Validation**: All user inputs validated with Zod
2. **SQL Injection**: Drizzle ORM prevents SQL injection
3. **XSS Protection**: React escapes content by default
4. **CSRF Protection**: Handled by session cookies
5. **Rate Limiting**: Consider adding for LLM calls
6. **Data Privacy**: User data encrypted in transit and at rest

## Monitoring and Logging

Check logs in `.manus-logs/`:
- `devserver.log` - Server startup and errors
- `browserConsole.log` - Frontend errors
- `networkRequests.log` - API calls
- `sessionReplay.log` - User interactions

## Troubleshooting Common Issues

### LLM Returns Invalid JSON
- Check JSON schema is valid
- Verify prompt is clear
- Add examples to prompt
- Check token limits

### Image Generation Fails
- Verify prompt is appropriate
- Check image API is available
- Review error message in logs
- Try simpler prompt

### Database Connection Issues
- Verify DATABASE_URL
- Check database is running
- Run migrations
- Check user permissions

### Module Not Appearing
- Verify route added to App.tsx
- Check Dashboard.tsx has module card
- Verify component exports default
- Check TypeScript compilation

---

For more details, see the main README_EDUPILOT.md file.
