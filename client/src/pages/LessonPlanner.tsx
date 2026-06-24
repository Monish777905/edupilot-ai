import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clock, BookOpen, Lightbulb, CheckCircle2, Zap } from "lucide-react";
import VoiceRecorder from "@/components/VoiceRecorder";
import VoicePlayer from "@/components/VoicePlayer";
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

  const handleVoiceInput = (text: string) => {
    setTopic(text);
  };

  const timeBreakdown = {
    introduction: Math.ceil(durationMinutes * 0.15),
    mainContent: Math.ceil(durationMinutes * 0.50),
    practice: Math.ceil(durationMinutes * 0.25),
    wrapup: Math.ceil(durationMinutes * 0.10),
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Lesson Planner</h1>
      <p className="text-slate-600 mb-8">Generate structured lesson plans with objectives and activities</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Create Lesson Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Topic</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="e.g., Fractions"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="mt-2">
                <VoiceRecorder
                  onTranscribed={handleVoiceInput}
                  language={language}
                  placeholder="Speak your topic..."
                />
              </div>
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

            <div>
              <label className="text-sm font-medium">Language</label>
              <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hinglish">Hinglish</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!topic.trim() || generateMutation.isPending}
              className="w-full"
              size="lg"
            >
              {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Plan
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {generateMutation.data && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(generateMutation.data.lessonPlan || "")
                      .split("\n")
                      .slice(0, 3)
                      .map((obj: string, idx: number) =>
                        obj.trim() ? (
                          <li key={idx} className="flex gap-2">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>{obj}</span>
                          </li>
                        ) : null
                      )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Teaching Flow Timeline
                  </CardTitle>
                  <CardDescription>Total Duration: {durationMinutes} minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                        <div className="w-0.5 h-16 bg-blue-200"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Introduction</p>
                        <p className="text-sm text-slate-600">{timeBreakdown.introduction} minutes</p>
                        <p className="text-sm text-slate-500 mt-1">Hook students with engaging topic overview and learning objectives</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                        <div className="w-0.5 h-16 bg-purple-200"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Main Content</p>
                        <p className="text-sm text-slate-600">{timeBreakdown.mainContent} minutes</p>
                        <p className="text-sm text-slate-500 mt-1">Teach core concepts with real-world examples and visual aids</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                        <div className="w-0.5 h-16 bg-green-200"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Practice & Activities</p>
                        <p className="text-sm text-slate-600">{timeBreakdown.practice} minutes</p>
                        <p className="text-sm text-slate-500 mt-1">Interactive exercises, group work, and hands-on practice</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold">4</div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Wrap-up & Assessment</p>
                        <p className="text-sm text-slate-600">{timeBreakdown.wrapup} minutes</p>
                        <p className="text-sm text-slate-500 mt-1">Summary, review key concepts, and assign homework</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    Suggested Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Group Discussion</p>
                        <p className="text-sm text-slate-600">Have students discuss key concepts in small groups</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Hands-on Practice</p>
                        <p className="text-sm text-slate-600">Interactive problem-solving with real-world examples</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Quick Quiz</p>
                        <p className="text-sm text-slate-600">5-10 minute quiz to assess understanding</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Homework Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-700">Create 5-10 practice problems based on today's lesson for students to complete at home.</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-slate-800">Assignment Details:</p>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• <strong>Estimated time:</strong> 20-30 minutes</li>
                      <li>• <strong>Focus:</strong> Reinforce core concepts from main content</li>
                      <li>• <strong>Format:</strong> Mix of problem-solving and application questions</li>
                      <li>• <strong>Due:</strong> Next class session</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {generateMutation.data && (
                <VoicePlayer
                  text={`Lesson plan generated for ${topic} for grade ${gradeLevel}. Total duration ${durationMinutes} minutes. Teaching flow includes introduction, main content, practice activities, and wrap-up.`}
                  language={language}
                  showVolume={false}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
