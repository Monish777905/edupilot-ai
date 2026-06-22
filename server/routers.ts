import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { transcribeAudio } from "./_core/voiceTranscription";
import { generateSpeech } from "./_core/tts";
import { generateImage } from "./_core/imageGeneration";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const db = getDb();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Concept Simplifier
  conceptSimplifier: router({
    generateExplanation: protectedProcedure
      .input(
        z.object({
          topic: z.string(),
          depthLevel: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
          language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const prompt = `Explain "${input.topic}" at ${input.depthLevel} level in ${input.language}. Provide 3-4 key points.`;
          const llmRes = await invokeLLM({ messages: [{ role: "user", content: prompt }], model: "gpt-4" });
          const explanation = (llmRes.choices?.[0]?.message?.content as string) || "";
          const keyPoints = explanation.split("\n").filter((line: string) => line.trim().length > 0).slice(0, 4);

          return {
            topic: input.topic,
            depthLevel: input.depthLevel,
            explanation,
            keyPoints,
            language: input.language,
            gradeLevel: input.depthLevel,
          };
        } catch (error) {
          console.error("Error generating explanation:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate explanation",
          });
        }
      }),
  }),

  // Quiz Generator
  quizGenerator: router({
    generateQuiz: protectedProcedure
      .input(
        z.object({
          topic: z.string(),
          questionCount: z.number().default(5),
          quizType: z.enum(["mcq", "short-answer", "mixed"]).default("mixed"),
          language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const prompt = `Generate ${input.questionCount} ${input.quizType} questions about "${input.topic}" in ${input.language}. Format as JSON array with id, question, options (for MCQ), correctAnswer, difficulty.`;
          const llmRes = await invokeLLM({ messages: [{ role: "user", content: prompt }], model: "gpt-4" });
          const response = (llmRes.choices?.[0]?.message?.content as string) || "";

          let questions: any[] = [];
          try {
            questions = JSON.parse(response);
          } catch {
            questions = [{ id: "q0", question: response, type: "mcq", options: [], correctAnswer: "A" }];
          }

          return {
            topic: input.topic,
            questions: questions.map((q: any, i: number) => ({
              id: `q${i}`,
              question: q.question,
              type: q.type || "mcq",
              options: q.options || [],
              correctAnswer: q.correctAnswer,
              difficulty: q.difficulty || "medium",
            })),
            language: input.language,
          };
        } catch (error) {
          console.error("Error generating quiz:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate quiz",
          });
        }
      }),

    submitAnswers: protectedProcedure
      .input(
        z.object({
          quizId: z.number(),
          answers: z.record(z.string(), z.string()),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          let correctCount = 0;
          const questions = [
            { id: "q0", correctAnswer: "A" },
            { id: "q1", correctAnswer: "B" },
          ];

          if (!questions || questions.length === 0) {
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

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      try {
        return [];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch quizzes",
        });
      }
    }),
  }),

  // Doubt Solver
  doubtSolver: router({
    createChat: protectedProcedure
      .input(z.object({ topic: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          return {
            chatId: 1,
            topic: input.topic,
            messages: [],
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create chat",
          });
        }
      }),

    addMessage: protectedProcedure
      .input(
        z.object({
          chatId: z.number(),
          studentMessage: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const prompt = `Student asks: "${input.studentMessage}". Provide a step-by-step answer.`;
          const llmRes = await invokeLLM({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4",
          });
          const aiResponse = (llmRes.choices?.[0]?.message?.content as string) || "";

          return {
            chatId: input.chatId,
            messages: [
              { role: "student", content: input.studentMessage },
              { role: "ai", content: aiResponse },
            ],
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add message",
          });
        }
      }),
  }),

  // Story Mode
  storyMode: router({
    generateStory: protectedProcedure
      .input(
        z.object({
          topic: z.string(),
          gradeLevel: z.enum(["primary", "middle", "secondary"]).default("primary"),
          language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const prompt = `Create an engaging educational story about "${input.topic}" for ${input.gradeLevel} students in ${input.language}. Include comprehension questions.`;
          const llmRes = await invokeLLM({ messages: [{ role: "user", content: prompt }], model: "gpt-4" });
          const story = (llmRes.choices?.[0]?.message?.content as string) || "";

          return {
            topic: input.topic,
            gradeLevel: input.gradeLevel,
            story,
            language: input.language,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate story",
          });
        }
      }),
  }),

  // Lesson Planner
  lessonPlanner: router({
    generateLessonPlan: protectedProcedure
      .input(
        z.object({
          topic: z.string(),
          gradeLevel: z.string(),
          durationMinutes: z.number(),
          language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const prompt = `Create a structured lesson plan for "${input.topic}" for grade ${input.gradeLevel} lasting ${input.durationMinutes} minutes in ${input.language}. Include objectives, activities, and assessment.`;
          const llmRes = await invokeLLM({ messages: [{ role: "user", content: prompt }], model: "gpt-4" });
          const lessonPlan = (llmRes.choices?.[0]?.message?.content as string) || "";

          return {
            topic: input.topic,
            gradeLevel: input.gradeLevel,
            durationMinutes: input.durationMinutes,
            lessonPlan,
            language: input.language,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate lesson plan",
          });
        }
      }),
  }),

  // AI Whiteboard
  whiteboard: router({
    generateContent: protectedProcedure
      .input(
        z.object({
          prompt: z.string(),
          contentType: z.enum(["diagram", "concept-map", "flowchart", "illustration"]).default("diagram"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const imageUrl = await generateImage({ prompt: input.prompt });

          return {
            prompt: input.prompt,
            contentType: input.contentType,
            imageUrl,
            svgContent: null,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate content",
          });
        }
      }),
  }),

  // Activity Guide
  activityGuide: router({
    generateActivity: protectedProcedure
      .input(
        z.object({
          topic: z.string(),
          gradeLevel: z.string(),
          activityType: z.enum(["hands-on", "experiment", "group-discussion", "interactive"]).default("hands-on"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const prompt = `Suggest a ${input.activityType} activity for "${input.topic}" for grade ${input.gradeLevel}. Include materials, duration, and instructions.`;
          const llmRes = await invokeLLM({ messages: [{ role: "user", content: prompt }], model: "gpt-4" });
          const activity = (llmRes.choices?.[0]?.message?.content as string) || "";

          return {
            topic: input.topic,
            gradeLevel: input.gradeLevel,
            activityType: input.activityType,
            activity,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate activity",
          });
        }
      }),
  }),

  // Bilingual Translation
  translation: router({
    translate: protectedProcedure
      .input(
        z.object({
          text: z.string(),
          sourceLanguage: z.enum(["en", "hi", "hinglish"]),
          targetLanguage: z.enum(["en", "hi", "hinglish"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const prompt = `Translate the following text from ${input.sourceLanguage} to ${input.targetLanguage}: "${input.text}". Provide only the translation.`;
          const llmRes = await invokeLLM({ messages: [{ role: "user", content: prompt }], model: "gpt-4" });
          const translatedText = (llmRes.choices?.[0]?.message?.content as string) || "";

          return {
            originalText: input.text,
            translatedText,
            sourceLanguage: input.sourceLanguage,
            targetLanguage: input.targetLanguage,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to translate text",
          });
        }
      }),
  }),

  // Voice System
  voice: router({
    // Transcribe audio to text
    transcribeAudioFile: protectedProcedure
      .input(
        z.object({
          audioUrl: z.string(),
          language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await transcribeAudio({
            audioUrl: input.audioUrl,
            language: input.language === "hinglish" ? "hi" : input.language,
          });

          if ("error" in result) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: result.error,
            });
          }

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

    // Generate speech from text
    generateSpeech: protectedProcedure
      .input(
        z.object({
          text: z.string(),
          language: z.enum(["en", "hi", "hinglish"]).default("hinglish"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          if (!input.text || input.text.trim().length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Text cannot be empty",
            });
          }

          // Call TTS service
          const result = await generateSpeech({
            text: input.text,
            language: input.language as "en" | "hi" | "hinglish",
          });

          if ("error" in result) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: (result as any).error || "TTS generation failed",
            });
          }

          return {
            audioUrl: (result as any).audioUrl || "",
            language: input.language,
          };
        } catch (error) {
          console.error("Error generating speech:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate speech",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
