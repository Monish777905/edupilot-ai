import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { transcribeAudio } from "./_core/voiceTranscription";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Concept Simplifier Router
  conceptSimplifier: router({
    // Generate simplified explanation at different depth levels
    generateExplanation: protectedProcedure
      .input(z.object({
        topic: z.string(),
        gradeLevel: z.enum(["beginner", "intermediate", "advanced"]),
        language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const systemPrompt = `You are an expert educational content creator for Indian classrooms. 
Create a clear, engaging explanation suitable for ${input.gradeLevel} level students.
Language: ${input.language === "hinglish" ? "Mix of Hindi and English (Hinglish)" : input.language === "hi" ? "Hindi" : "English"}
Make it classroom-friendly, age-appropriate, and easy to understand.`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { 
                role: "user", 
                content: `Explain "${input.topic}" in a simple way suitable for ${input.gradeLevel} level students. Include key points.` as any
              },
            ],
          });

          const explanation = typeof response.choices[0]?.message.content === 'string' 
            ? response.choices[0].message.content 
            : "";

          // Extract key points from the explanation
          const keyPointsResponse = await invokeLLM({
            messages: [
              { role: "system", content: "Extract 5-7 key points from the explanation. Return as a JSON array of strings." },
              { role: "user", content: explanation as any },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "key_points",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    points: { type: "array", items: { type: "string" } },
                  },
                  required: ["points"],
                  additionalProperties: false,
                },
              },
            },
          });

          let keyPoints: string[] = [];
          try {
            const content = keyPointsResponse.choices[0]?.message.content;
            const parsed = typeof content === 'string' ? JSON.parse(content) : {};
            keyPoints = parsed.points || [];
          } catch (e) {
            keyPoints = [];
          }

          // Save to database
          await db.createConceptSimplification({
            userId: ctx.user.id,
            topic: input.topic,
            gradeLevel: input.gradeLevel,
            explanation,
            keyPoints,
          });

          return {
            topic: input.topic,
            gradeLevel: input.gradeLevel,
            explanation,
            keyPoints,
          };
        } catch (error) {
          console.error("Error generating explanation:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate explanation",
          });
        }
      }),

    // Get user's concept simplifications
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await db.getConceptSimplifications(ctx.user.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch history",
        });
      }
    }),
  }),

  // Quiz Generator Router
  quizGenerator: router({
    // Generate quiz questions
    generateQuiz: protectedProcedure
      .input(z.object({
        topic: z.string(),
        questionCount: z.number().min(1).max(20),
        quizType: z.enum(["mcq", "short-answer", "mixed"]).default("mixed"),
        language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const systemPrompt = `You are an expert quiz creator for Indian classrooms.
Create ${input.questionCount} educational questions about "${input.topic}".
Language: ${input.language === "hinglish" ? "Mix of Hindi and English (Hinglish)" : input.language === "hi" ? "Hindi" : "English"}
Return as JSON with array of questions.`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { 
                role: "user", 
                content: `Generate ${input.questionCount} ${input.quizType} questions about "${input.topic}". 
For MCQ: provide 4 options. For short-answer: provide expected answer.
Return as JSON array.` as any
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "quiz_questions",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          question: { type: "string" },
                          type: { type: "string", enum: ["mcq", "short-answer"] },
                          options: { type: "array", items: { type: "string" } },
                          correctAnswer: { type: "string" },
                        },
                        required: ["id", "question", "type", "correctAnswer"],
                      },
                    },
                  },
                  required: ["questions"],
                  additionalProperties: false,
                },
              },
            },
          });

          let questions = [];
          try {
            const content = response.choices[0]?.message.content;
            const parsed = typeof content === 'string' ? JSON.parse(content) : {};
            questions = parsed.questions || [];
          } catch (e) {
            console.error("Error parsing quiz response:", e);
          }

          // Create quiz in database
          await db.createQuiz({
            userId: ctx.user.id,
            topic: input.topic,
            questionCount: input.questionCount,
            quizType: input.quizType,
            questions,
            status: "draft",
          });

          return {
            topic: input.topic,
            questionCount: input.questionCount,
            quizType: input.quizType,
            questions,
            status: "draft",
          };
        } catch (error) {
          console.error("Error generating quiz:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate quiz",
          });
        }
      }),

    // Submit quiz answers
    submitAnswers: protectedProcedure
      .input(z.object({
        quizId: z.number(),
        answers: z.record(z.string(), z.string()),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Get quiz from database
          const quizzes = await db.getQuizzes(ctx.user.id);
          const quiz = quizzes.find(q => q.id === input.quizId);
          
          if (!quiz) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Quiz not found",
            });
          }

          // Calculate score
          let correctCount = 0;
          const questions = (quiz.questions as any) || [];

          if (!Array.isArray(questions) || questions.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No questions found in quiz",
            });
          }

          questions.forEach((q: any) => {
            if (input.answers[q.id] === q.correctAnswer) {
              correctCount++;
            }
          });

          const score = (correctCount / questions.length) * 100;

          // Update quiz
          await db.updateQuiz(input.quizId, {
            userAnswers: input.answers,
            score: score.toFixed(2),
            totalScore: 100,
            status: "completed",
            completedAt: new Date(),
          });

          return {
            score: score.toFixed(2),
            totalScore: 100,
            correctCount,
            totalCount: questions.length,
          };
        } catch (error) {
          console.error("Error submitting quiz:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit quiz",
          });
        }
      }),

    // Get quizzes
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await db.getQuizzes(ctx.user.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch quizzes",
        });
      }
    }),
  }),

  // Bilingual Translation Router
  translation: router({
    // Translate text
    translate: protectedProcedure
      .input(z.object({
        text: z.string(),
        sourceLanguage: z.enum(["en", "hi", "hinglish"]),
        targetLanguage: z.enum(["en", "hi", "hinglish"]),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const systemPrompt = `You are a professional translator specializing in educational content for Indian classrooms.
Translate from ${input.sourceLanguage} to ${input.targetLanguage}.
Maintain educational accuracy and classroom-friendly language.`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Translate this text:\n\n${input.text}` as any },
            ],
          });

          const translatedText = typeof response.choices[0]?.message.content === 'string'
            ? response.choices[0].message.content
            : "";

          // Save translation
          await db.createTranslation({
            userId: ctx.user.id,
            originalText: input.text,
            originalLanguage: input.sourceLanguage,
            translatedText,
            targetLanguage: input.targetLanguage,
          });

          return {
            originalText: input.text,
            translatedText,
            sourceLanguage: input.sourceLanguage,
            targetLanguage: input.targetLanguage,
          };
        } catch (error) {
          console.error("Error translating:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to translate text",
          });
        }
      }),

    // Get translation history
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await db.getTranslations(ctx.user.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch translations",
        });
      }
    }),
  }),

  // AI Whiteboard Router
  whiteboard: router({
    // Generate whiteboard content
    generateContent: protectedProcedure
      .input(z.object({
        prompt: z.string(),
        contentType: z.enum(["diagram", "concept-map", "flowchart", "illustration"]),
        language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Generate AI image
          const imageResult = await generateImage({
            prompt: `Educational ${input.contentType} for: ${input.prompt}. Classroom-friendly, clear, labeled.`,
          });

          // Generate SVG description
          const svgResponse = await invokeLLM({
            messages: [
              { role: "system", content: "Create a simple SVG description for an educational diagram." },
              { role: "user", content: `Create SVG markup for: ${input.prompt}` as any },
            ],
          });

          const svgContent = typeof svgResponse.choices[0]?.message.content === 'string'
            ? svgResponse.choices[0].message.content
            : "";

          // Save whiteboard content
          await db.createWhiteboardContent({
            userId: ctx.user.id,
            prompt: input.prompt,
            contentType: input.contentType,
            imageUrl: imageResult.url,
            svgContent,
          });

          return {
            prompt: input.prompt,
            contentType: input.contentType,
            imageUrl: imageResult.url,
            svgContent,
          };
        } catch (error) {
          console.error("Error generating whiteboard content:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate whiteboard content",
          });
        }
      }),

    // Get whiteboard history
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await db.getWhiteboardContent(ctx.user.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch whiteboard content",
        });
      }
    }),
  }),

  // Student Doubt Solver Router
  doubtSolver: router({
    // Create new doubt chat
    createChat: protectedProcedure
      .input(z.object({
        topic: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await db.createDoubtSolverChat({
            userId: ctx.user.id,
            topic: input.topic,
            messages: [],
            isResolved: false,
          });

          return {
            topic: input.topic,
            messages: [],
            isResolved: false,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create doubt chat",
          });
        }
      }),

    // Add message to doubt chat
    addMessage: protectedProcedure
      .input(z.object({
        chatId: z.number(),
        studentMessage: z.string(),
        language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Get AI response
          const systemPrompt = `You are a helpful educational assistant for Indian classrooms.
Answer student questions clearly and step-by-step.
Language: ${input.language === "hinglish" ? "Mix of Hindi and English (Hinglish)" : input.language === "hi" ? "Hindi" : "English"}
Provide examples when helpful.`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.studentMessage as any },
            ],
          });

          const aiMessage = typeof response.choices[0]?.message.content === 'string'
            ? response.choices[0].message.content
            : "";

          // Get existing chat
          const chats = await db.getDoubtSolverChats(ctx.user.id);
          const chat = chats.find(c => c.id === input.chatId);

          if (!chat) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Chat not found",
            });
          }

          const messages = (chat.messages || []) as any[];
          messages.push({
            role: "student",
            content: input.studentMessage,
            timestamp: new Date().toISOString(),
          });
          messages.push({
            role: "ai",
            content: aiMessage,
            timestamp: new Date().toISOString(),
          });

          // Update chat
          await db.updateDoubtSolverChat(input.chatId, {
            messages,
          });

          return {
            studentMessage: input.studentMessage,
            aiMessage,
            messages: messages.slice(-10), // Return last 10 messages
          };
        } catch (error) {
          console.error("Error adding message:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add message",
          });
        }
      }),

    // Get doubt chats
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await db.getDoubtSolverChats(ctx.user.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch doubt chats",
        });
      }
    }),
  }),

  // Story Mode Router
  storyMode: router({
    // Generate story
    generateStory: protectedProcedure
      .input(z.object({
        topic: z.string(),
        gradeLevel: z.enum(["primary", "middle", "secondary"]),
        language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const systemPrompt = `You are a creative storyteller for educational content in Indian classrooms.
Create an engaging story about "${input.topic}" suitable for ${input.gradeLevel} students.
Language: ${input.language === "hinglish" ? "Mix of Hindi and English (Hinglish)" : input.language === "hi" ? "Hindi" : "English"}
Make it fun, memorable, and educational.`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { 
                role: "user", 
                content: `Create an engaging story about "${input.topic}" for ${input.gradeLevel} students. Include a title.` as any
              },
            ],
          });

          const storyContent = typeof response.choices[0]?.message.content === 'string'
            ? response.choices[0].message.content
            : "";

          // Generate comprehension questions
          const questionsResponse = await invokeLLM({
            messages: [
              { role: "system", content: "Generate 3-5 comprehension questions from the story. Return as JSON array." },
              { role: "user", content: storyContent as any },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "comprehension_questions",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string" },
                          correctAnswer: { type: "string" },
                        },
                        required: ["question", "correctAnswer"],
                      },
                    },
                  },
                  required: ["questions"],
                  additionalProperties: false,
                },
              },
            },
          });

          let comprehensionQuestions = [];
          try {
            const content = questionsResponse.choices[0]?.message.content;
            const parsed = typeof content === 'string' ? JSON.parse(content) : {};
            comprehensionQuestions = parsed.questions || [];
          } catch (e) {
            console.error("Error parsing questions:", e);
          }

          // Extract title from story
          const titleMatch = storyContent.match(/^#+\s*(.+)$/m);
          const storyTitle = titleMatch ? titleMatch[1] : input.topic;

          // Save story
          await db.createStoryModeContent({
            userId: ctx.user.id,
            topic: input.topic,
            gradeLevel: input.gradeLevel,
            storyTitle,
            storyContent,
            comprehensionQuestions,
          });

          return {
            topic: input.topic,
            gradeLevel: input.gradeLevel,
            storyTitle,
            storyContent,
            comprehensionQuestions,
          };
        } catch (error) {
          console.error("Error generating story:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate story",
          });
        }
      }),

    // Get stories
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await db.getStoryModeContent(ctx.user.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch stories",
        });
      }
    }),
  }),

  // Lesson Plan Router
  lessonPlanner: router({
    // Generate lesson plan
    generateLessonPlan: protectedProcedure
      .input(z.object({
        topic: z.string(),
        gradeLevel: z.string(),
        durationMinutes: z.number().min(15).max(480),
        language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const systemPrompt = `You are an expert curriculum designer for Indian classrooms.
Create a structured lesson plan for "${input.topic}" for Grade ${input.gradeLevel} students.
Duration: ${input.durationMinutes} minutes.
Language: ${input.language === "hinglish" ? "Mix of Hindi and English (Hinglish)" : input.language === "hi" ? "Hindi" : "English"}
Return as JSON with learning objectives, teaching flow, activities, quiz topics, and homework.`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { 
                role: "user", 
                content: `Create a ${input.durationMinutes}-minute lesson plan for "${input.topic}" for Grade ${input.gradeLevel}.` as any
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "lesson_plan",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    learningObjectives: { type: "array", items: { type: "string" } },
                    teachingFlow: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          phase: { type: "string" },
                          duration: { type: "number" },
                          description: { type: "string" },
                        },
                        required: ["phase", "duration", "description"],
                      },
                    },
                    activities: { type: "array", items: { type: "string" } },
                    quizTopics: { type: "array", items: { type: "string" } },
                    homework: { type: "array", items: { type: "string" } },
                  },
                  required: ["learningObjectives", "teachingFlow", "activities", "quizTopics", "homework"],
                  additionalProperties: false,
                },
              },
            },
          });

          let lessonPlanData = {
            learningObjectives: [],
            teachingFlow: [],
            activities: [],
            quizTopics: [],
            homework: [],
          };

          try {
            const content = response.choices[0]?.message.content;
            const parsed = typeof content === 'string' ? JSON.parse(content) : {};
            lessonPlanData = parsed;
          } catch (e) {
            console.error("Error parsing lesson plan:", e);
          }

          // Save lesson plan
          await db.createLessonPlan({
            userId: ctx.user.id,
            topic: input.topic,
            gradeLevel: input.gradeLevel,
            durationMinutes: input.durationMinutes,
            ...lessonPlanData,
          });

          return {
            topic: input.topic,
            gradeLevel: input.gradeLevel,
            durationMinutes: input.durationMinutes,
            ...lessonPlanData,
          };
        } catch (error) {
          console.error("Error generating lesson plan:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate lesson plan",
          });
        }
      }),

    // Get lesson plans
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await db.getLessonPlans(ctx.user.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch lesson plans",
        });
      }
    }),
  }),

  // Activity Guide Router
  activityGuide: router({
    // Generate activity
    generateActivity: protectedProcedure
      .input(z.object({
        topic: z.string(),
        gradeLevel: z.string(),
        activityType: z.enum(["hands-on", "experiment", "group-discussion", "interactive"]),
        language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const systemPrompt = `You are an expert in designing classroom activities for Indian schools.
Create a detailed ${input.activityType} activity for "${input.topic}" suitable for Grade ${input.gradeLevel}.
Language: ${input.language === "hinglish" ? "Mix of Hindi and English (Hinglish)" : input.language === "hi" ? "Hindi" : "English"}
Return as JSON with title, description, instructions, materials, duration, and learning outcomes.`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { 
                role: "user", 
                content: `Design a ${input.activityType} activity for "${input.topic}" for Grade ${input.gradeLevel}.` as any
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "activity_guide",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    instructions: { type: "array", items: { type: "string" } },
                    materials: { type: "array", items: { type: "string" } },
                    estimatedDuration: { type: "number" },
                    learningOutcomes: { type: "array", items: { type: "string" } },
                  },
                  required: ["title", "description", "instructions", "materials", "estimatedDuration", "learningOutcomes"],
                  additionalProperties: false,
                },
              },
            },
          });

          let activityData = {
            title: input.topic,
            description: "",
            instructions: [],
            materials: [],
            estimatedDuration: 30,
            learningOutcomes: [],
          };

          try {
            const content = response.choices[0]?.message.content;
            const parsed = typeof content === 'string' ? JSON.parse(content) : {};
            activityData = parsed;
          } catch (e) {
            console.error("Error parsing activity:", e);
          }

          // Save activity
          await db.createActivityGuide({
            userId: ctx.user.id,
            topic: input.topic,
            gradeLevel: input.gradeLevel,
            activityType: input.activityType,
            ...activityData,
          });

          return {
            topic: input.topic,
            gradeLevel: input.gradeLevel,
            activityType: input.activityType,
            ...activityData,
          };
        } catch (error) {
          console.error("Error generating activity:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate activity",
          });
        }
      }),

    // Get activities
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await db.getActivityGuides(ctx.user.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch activities",
        });
      }
    }),
  }),

  // Voice/Audio Router
  voice: router({
    // Upload and transcribe audio
    transcribeAudioFile: protectedProcedure
      .input(z.object({
        audioUrl: z.string(),
        language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await transcribeAudio({
            audioUrl: input.audioUrl,
            language: input.language === "hinglish" ? "hi" : input.language,
          });

          if ('error' in result) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: result.error,
            });
          }

          // Save audio recording
          await db.createAudioRecording({
            userId: ctx.user.id,
            audioUrl: input.audioUrl,
            transcription: result.text,
            language: input.language,
            recordingType: "voice-input",
          });

          return {
            text: result.text,
            language: result.language,
            segments: result.segments,
          };
        } catch (error) {
          console.error("Error transcribing audio:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to transcribe audio",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
