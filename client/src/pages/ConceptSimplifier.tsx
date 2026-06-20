import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

export default function ConceptSimplifier() {
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("hinglish");

  const generateMutation = trpc.conceptSimplifier.generateExplanation.useMutation();
  const historyQuery = trpc.conceptSimplifier.getHistory.useQuery();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    await generateMutation.mutateAsync({ topic, gradeLevel, language });
    setTopic("");
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
              <Input
                placeholder="e.g., Photosynthesis"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1"
              />
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
            <Card>
              <CardHeader>
                <CardTitle>{generateMutation.data.topic}</CardTitle>
                <CardDescription>
                  {generateMutation.data.gradeLevel} level explanation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Explanation</h3>
                  <Streamdown>{generateMutation.data.explanation}</Streamdown>
                </div>

                {generateMutation.data.keyPoints && generateMutation.data.keyPoints.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Key Points</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {generateMutation.data.keyPoints.map((point, i) => (
                        <li key={i} className="text-sm text-slate-700">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
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
