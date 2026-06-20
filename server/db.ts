import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  conceptSimplifications,
  quizzes,
  translations,
  whiteboardContent,
  doubtSolverChats,
  storyModeContent,
  lessonPlans,
  activityGuides,
  contentHistory,
  audioRecordings
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.preferredLanguage !== undefined) {
      values.preferredLanguage = user.preferredLanguage;
      updateSet.preferredLanguage = user.preferredLanguage;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Concept Simplification queries
export async function createConceptSimplification(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(conceptSimplifications).values(data);
  return result;
}

export async function getConceptSimplifications(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select()
    .from(conceptSimplifications)
    .where(eq(conceptSimplifications.userId, userId))
    .orderBy(desc(conceptSimplifications.createdAt))
    .limit(limit);
}

// Quiz queries
export async function createQuiz(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(quizzes).values(data);
  return result;
}

export async function getQuizzes(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select()
    .from(quizzes)
    .where(eq(quizzes.userId, userId))
    .orderBy(desc(quizzes.createdAt))
    .limit(limit);
}

export async function updateQuiz(quizId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(quizzes).set(data).where(eq(quizzes.id, quizId));
}

// Translation queries
export async function createTranslation(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(translations).values(data);
}

export async function getTranslations(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select()
    .from(translations)
    .where(eq(translations.userId, userId))
    .orderBy(desc(translations.createdAt))
    .limit(limit);
}

// Whiteboard queries
export async function createWhiteboardContent(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(whiteboardContent).values(data);
}

export async function getWhiteboardContent(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select()
    .from(whiteboardContent)
    .where(eq(whiteboardContent.userId, userId))
    .orderBy(desc(whiteboardContent.createdAt))
    .limit(limit);
}

// Doubt Solver queries
export async function createDoubtSolverChat(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(doubtSolverChats).values(data);
  return result;
}

export async function getDoubtSolverChats(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select()
    .from(doubtSolverChats)
    .where(eq(doubtSolverChats.userId, userId))
    .orderBy(desc(doubtSolverChats.createdAt))
    .limit(limit);
}

export async function updateDoubtSolverChat(chatId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(doubtSolverChats).set(data).where(eq(doubtSolverChats.id, chatId));
}

// Story Mode queries
export async function createStoryModeContent(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(storyModeContent).values(data);
}

export async function getStoryModeContent(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select()
    .from(storyModeContent)
    .where(eq(storyModeContent.userId, userId))
    .orderBy(desc(storyModeContent.createdAt))
    .limit(limit);
}

// Lesson Plan queries
export async function createLessonPlan(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(lessonPlans).values(data);
}

export async function getLessonPlans(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select()
    .from(lessonPlans)
    .where(eq(lessonPlans.userId, userId))
    .orderBy(desc(lessonPlans.createdAt))
    .limit(limit);
}

// Activity Guide queries
export async function createActivityGuide(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(activityGuides).values(data);
}

export async function getActivityGuides(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select()
    .from(activityGuides)
    .where(eq(activityGuides.userId, userId))
    .orderBy(desc(activityGuides.createdAt))
    .limit(limit);
}

// Content History queries
export async function logContentHistory(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(contentHistory).values(data);
}

export async function getContentHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select()
    .from(contentHistory)
    .where(eq(contentHistory.userId, userId))
    .orderBy(desc(contentHistory.createdAt))
    .limit(limit);
}

// Audio Recording queries
export async function createAudioRecording(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(audioRecordings).values(data);
}

export async function getAudioRecordings(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select()
    .from(audioRecordings)
    .where(eq(audioRecordings.userId, userId))
    .orderBy(desc(audioRecordings.createdAt))
    .limit(limit);
}
