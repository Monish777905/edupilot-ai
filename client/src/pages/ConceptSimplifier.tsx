import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import VoiceRecorder from "@/components/VoiceRecorder";
import VoicePlayer from "@/components/VoicePlayer";

export default function ConceptSimplifier() {
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("hinglish");

  const generateMutation = trpc.conceptSimplifier.generateExplanation.useMutation();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    await generateMutation.mutateAsync({ topic, depthLevel: gradeLevel as "beginner" | "intermediate" | "advanced", language });
    setTopic("");
  };

  const handleVoiceInput = (text: string) => {
    setTopic(text);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Concept Simplifier</h1>
      <p className="text-slate-600 mb-8">Break down complex topics into simple, grade-appropriate explanations</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generate Explanation</CardTitle>
            <CardDescription>Enter a topic to simplify</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Topic</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="e.g., Photosynthesis"
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
              <Select value={gradeLevel} onValueChange={(v: any) => setGradeLevel(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (Class 1-3)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (Class 4-6)</SelectItem>
                  <SelectItem value="advanced">Advanced (Class 7-10)</SelectItem>
                </SelectContent>
              </Select>
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
            >
              {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <div className="lg:col-span-2 space-y-6">
          {generateMutation.data && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Explanation</span>
                    <VoicePlayer
                      text={generateMutation.data.explanation || ""}
                      language={language}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Streamdown>{generateMutation.data.explanation}</Streamdown>
                </CardContent>
              </Card>

              {generateMutation.data.keyPoints && generateMutation.data.keyPoints.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Key Points</span>
                      <VoicePlayer
                        text={generateMutation.data.keyPoints.join(". ")}
                        language={language}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {generateMutation.data.keyPoints.map((point: string, idx: number) => (
                        <li key={idx} className="flex gap-3">
                          <span className="text-blue-600 font-bold min-w-fit">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {generateMutation.error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-700">{generateMutation.error.message}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
