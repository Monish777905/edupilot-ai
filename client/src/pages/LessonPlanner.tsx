import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clock, BookOpen, Lightbulb } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function LessonPlanner() {
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("5");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("hinglish");

  const generateMutation = trpc.lessonPlanner.generateLessonPlan.useMutation();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    await generateMutation.mutateAsync({
      topic,
      gradeLevel,
      durationMinutes,
      language,
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Lesson Planner</h1>
      <p className="text-slate-600 mb-8">Generate structured lesson plans</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Create Lesson Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Topic</label>
              <Input
                placeholder="e.g., Fractions"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Grade Level</label>
              <Input
                placeholder="e.g., 5"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                min="15"
                max="480"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!topic.trim() || generateMutation.isPending}
              className="w-full"
            >
              {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {generateMutation.data && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Learning Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {generateMutation.data.learningObjectives?.map((obj: any, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
