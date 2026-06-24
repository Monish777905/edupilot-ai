import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Brain, 
  BookOpen, 
  MessageSquare, 
  Lightbulb, 
  Zap, 
  Palette, 
  Microscope, 
  Volume2,
  ArrowRight,
  Maximize2,
  Minimize2
} from "lucide-react";

const modules = [
  {
    icon: Brain,
    title: "Concept Simplifier",
    description: "Break down complex topics into simple, grade-appropriate explanations with diagrams and key points.",
    path: "/concept-simplifier",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: BookOpen,
    title: "Quiz Generator",
    description: "Create interactive quizzes with MCQ and short-answer questions. Get instant feedback and scoring.",
    path: "/quiz-generator",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Doubt Solver",
    description: "Chat interface where students ask questions and receive step-by-step AI-guided answers.",
    path: "/doubt-solver",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Lightbulb,
    title: "Story Mode",
    description: "Transform curriculum topics into engaging narrative stories with illustrations and comprehension questions.",
    path: "/story-mode",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    icon: Zap,
    title: "Lesson Planner",
    description: "Generate structured lesson plans with learning objectives, activities, quizzes, and homework.",
    path: "/lesson-planner",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: Palette,
    title: "AI Whiteboard",
    description: "Generate educational diagrams, concept maps, and illustrations from text prompts.",
    path: "/whiteboard",
    color: "from-pink-500 to-pink-600",
  },
  {
    icon: Microscope,
    title: "Activity Guide",
    description: "Discover hands-on activities, experiments, and group discussions for any topic.",
    path: "/activity-guide",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    icon: Volume2,
    title: "Translation",
    description: "Bilingual translation panel supporting Hindi, English, and Hinglish with side-by-side display.",
    path: "/translation",
    color: "from-indigo-500 to-indigo-600",
  },
];

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">EduPilot AI</h1>
          <p className="text-lg text-slate-600">Voice-Enabled Classroom Co-Pilot</p>
          <p className="text-sm text-slate-500 mt-2">Select a module to get started with your lesson</p>
        </div>
        <Button
          onClick={toggleFullscreen}
          variant="outline"
          size="lg"
          className="gap-2"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen mode"}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-5 h-5" />
              Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize2 className="w-5 h-5" />
              Fullscreen
            </>
          )}
        </Button>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card 
              key={module.path}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => navigate(module.path)}
            >
              <CardHeader className={`bg-gradient-to-r ${module.color} text-white pb-3`}>
                <div className="flex items-start justify-between">
                  <Icon className="w-8 h-8" />
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardTitle className="text-xl mt-2">{module.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <CardDescription className="text-slate-600">
                  {module.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 group-hover:bg-slate-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(module.path);
                  }}
                >
                  Open Module
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Section */}
      <div className="mt-16 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white">
                <Volume2 className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Voice Input & Output</h3>
              <p className="mt-2 text-sm text-slate-600">Hands-free interaction with Hinglish and Hindi support</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white">
                <Brain className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">AI-Powered Content</h3>
              <p className="mt-2 text-sm text-slate-600">LLM-driven explanations, quizzes, and lesson plans</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-500 text-white">
                <Palette className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Visual Learning</h3>
              <p className="mt-2 text-sm text-slate-600">AI-generated diagrams, illustrations, and concept maps</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Multi-Level Learning</h3>
              <p className="mt-2 text-sm text-slate-600">Beginner, intermediate, and advanced explanations</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-pink-500 text-white">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Bilingual Support</h3>
              <p className="mt-2 text-sm text-slate-600">Hindi, English, and Hinglish for inclusive learning</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-cyan-500 text-white">
                <Zap className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Smart Board Ready</h3>
              <p className="mt-2 text-sm text-slate-600">Full-screen mode optimized for classroom displays</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
