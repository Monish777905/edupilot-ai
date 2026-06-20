import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

export default function StoryMode() {
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState<"primary" | "middle" | "secondary">("primary");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("hinglish");

  const generateMutation = trpc.storyMode.generateStory.useMutation();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    await generateMutation.mutateAsync({ topic, gradeLevel, language });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Story Mode</h1>
      <p className="text-slate-600 mb-8">Transform topics into engaging educational stories</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generate Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Topic</label>
              <Input
                placeholder="e.g., The Water Cycle"
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
                  <SelectItem value="primary">Primary (Class 1-3)</SelectItem>
                  <SelectItem value="middle">Middle (Class 4-6)</SelectItem>
                  <SelectItem value="secondary">Secondary (Class 7-10)</SelectItem>
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
              Generate Story
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {generateMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>{generateMutation.data.storyTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Streamdown>{generateMutation.data.storyContent}</Streamdown>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
