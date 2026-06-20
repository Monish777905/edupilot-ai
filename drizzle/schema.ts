import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  json,
  boolean,
  decimal,
  longtext
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "teacher", "student"]).default("user").notNull(),
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "hi", "hinglish"]).default("hinglish"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Concept Simplifications - stores generated explanations at different depth levels
 */
export const conceptSimplifications = mysqlTable("conceptSimplifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  gradeLevel: mysqlEnum("gradeLevel", ["beginner", "intermediate", "advanced"]).notNull(),
  explanation: longtext("explanation").notNull(),
  keyPoints: json("keyPoints").$type<string[]>(),
  diagramUrl: varchar("diagramUrl", { length: 512 }),
  diagramType: mysqlEnum("diagramType", ["svg", "text-art", "image"]),
  flowchartUrl: varchar("flowchartUrl", { length: 512 }),
  mindmapUrl: varchar("mindmapUrl", { length: 512 }),
  audioUrl: varchar("audioUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConceptSimplification = typeof conceptSimplifications.$inferSelect;
export type InsertConceptSimplification = typeof conceptSimplifications.$inferInsert;

/**
 * Quiz Sessions - tracks quiz instances with questions and answers
 */
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  questionCount: int("questionCount").notNull(),
  quizType: mysqlEnum("quizType", ["mcq", "short-answer", "mixed"]).default("mixed").notNull(),
  questions: json("questions").$type<Array<{
    id: string;
    question: string;
    type: "mcq" | "short-answer";
    options?: string[];
    correctAnswer: string;
    audioUrl?: string;
  }>>().notNull(),
  userAnswers: json("userAnswers").$type<Record<string, string>>(),
  score: decimal("score", { precision: 5, scale: 2 }),
  totalScore: decimal("totalScore", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["draft", "in-progress", "completed"]).default("draft").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

/**
 * Translations - stores bilingual content translations
 */
export const translations = mysqlTable("translations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  originalText: longtext("originalText").notNull(),
  originalLanguage: mysqlEnum("originalLanguage", ["en", "hi", "hinglish"]).notNull(),
  translatedText: longtext("translatedText").notNull(),
  targetLanguage: mysqlEnum("targetLanguage", ["en", "hi", "hinglish"]).notNull(),
  audioOriginalUrl: varchar("audioOriginalUrl", { length: 512 }),
  audioTranslatedUrl: varchar("audioTranslatedUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = typeof translations.$inferInsert;

/**
 * Whiteboard Content - stores generated diagrams and visual content
 */
export const whiteboardContent = mysqlTable("whiteboardContent", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  prompt: varchar("prompt", { length: 512 }).notNull(),
  contentType: mysqlEnum("contentType", ["diagram", "concept-map", "flowchart", "illustration"]).notNull(),
  svgContent: longtext("svgContent"),
  textArtContent: longtext("textArtContent"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  labels: json("labels").$type<Record<string, string>>(),
  annotations: json("annotations").$type<Array<{ x: number; y: number; text: string }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhiteboardContent = typeof whiteboardContent.$inferSelect;
export type InsertWhiteboardContent = typeof whiteboardContent.$inferInsert;

/**
 * Doubt Solver Chat - stores student questions and AI answers
 */
export const doubtSolverChats = mysqlTable("doubtSolverChats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentId: int("studentId"),
  topic: varchar("topic", { length: 255 }),
  messages: json("messages").$type<Array<{
    role: "student" | "ai";
    content: string;
    audioUrl?: string;
    timestamp: string;
  }>>().notNull(),
  isResolved: boolean("isResolved").default(false),
  helpfulRating: int("helpfulRating"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DoubtSolverChat = typeof doubtSolverChats.$inferSelect;
export type InsertDoubtSolverChat = typeof doubtSolverChats.$inferInsert;

/**
 * Story Mode Content - stores generated educational stories
 */
export const storyModeContent = mysqlTable("storyModeContent", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  gradeLevel: mysqlEnum("gradeLevel", ["primary", "middle", "secondary"]).notNull(),
  storyTitle: varchar("storyTitle", { length: 255 }).notNull(),
  storyContent: longtext("storyContent").notNull(),
  illustrations: json("illustrations").$type<Array<{ section: string; imageUrl: string }>>(),
  audioUrl: varchar("audioUrl", { length: 512 }),
  comprehensionQuestions: json("comprehensionQuestions").$type<Array<{
    question: string;
    options?: string[];
    correctAnswer: string;
  }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StoryModeContent = typeof storyModeContent.$inferSelect;
export type InsertStoryModeContent = typeof storyModeContent.$inferInsert;

/**
 * Lesson Plans - stores generated curriculum-aligned lesson plans
 */
export const lessonPlans = mysqlTable("lessonPlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  gradeLevel: varchar("gradeLevel", { length: 50 }).notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  learningObjectives: json("learningObjectives").$type<string[]>(),
  teachingFlow: json("teachingFlow").$type<Array<{
    phase: string;
    duration: number;
    description: string;
    activities?: string[];
  }>>(),
  activities: json("activities").$type<string[]>(),
  quizTopics: json("quizTopics").$type<string[]>(),
  homework: json("homework").$type<string[]>(),
  resources: json("resources").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LessonPlan = typeof lessonPlans.$inferSelect;
export type InsertLessonPlan = typeof lessonPlans.$inferInsert;

/**
 * Activity Guides - stores suggested classroom activities and experiments
 */
export const activityGuides = mysqlTable("activityGuides", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  gradeLevel: varchar("gradeLevel", { length: 50 }).notNull(),
  activityType: mysqlEnum("activityType", ["hands-on", "experiment", "group-discussion", "interactive"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: longtext("description").notNull(),
  instructions: json("instructions").$type<string[]>(),
  materials: json("materials").$type<string[]>(),
  estimatedDuration: int("estimatedDuration"),
  learningOutcomes: json("learningOutcomes").$type<string[]>(),
  safetyNotes: text("safetyNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActivityGuide = typeof activityGuides.$inferSelect;
export type InsertActivityGuide = typeof activityGuides.$inferInsert;

/**
 * Content History - tracks all user interactions for analytics and personalization
 */
export const contentHistory = mysqlTable("contentHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentType: mysqlEnum("contentType", [
    "concept",
    "quiz",
    "translation",
    "whiteboard",
    "doubt",
    "story",
    "lesson-plan",
    "activity"
  ]).notNull(),
  contentId: int("contentId"),
  topic: varchar("topic", { length: 255 }),
  actionType: mysqlEnum("actionType", ["created", "viewed", "completed", "shared", "favorited"]).notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentHistory = typeof contentHistory.$inferSelect;
export type InsertContentHistory = typeof contentHistory.$inferInsert;

/**
 * Audio Recordings - stores temporary audio files for voice input/output
 */
export const audioRecordings = mysqlTable("audioRecordings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }).notNull(),
  transcription: longtext("transcription"),
  language: mysqlEnum("language", ["en", "hi", "hinglish"]).notNull(),
  duration: int("duration"),
  recordingType: mysqlEnum("recordingType", ["voice-input", "tts-output"]).notNull(),
  relatedContentType: mysqlEnum("relatedContentType", [
    "concept",
    "quiz",
    "translation",
    "doubt",
    "story",
    "activity"
  ]),
  relatedContentId: int("relatedContentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AudioRecording = typeof audioRecordings.$inferSelect;
export type InsertAudioRecording = typeof audioRecordings.$inferInsert;
