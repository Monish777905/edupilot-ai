import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Zap } from "lucide-react";
import VoiceRecorder from "@/components/VoiceRecorder";
import VoicePlayer from "@/components/VoicePlayer";
import { trpc } from "@/lib/trpc";

export default function ActivityGuide() {
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("5");
  const [activityType, setActivityType] = useState<"hands-on" | "experiment" | "group-discussion" | "interactive">("hands-on");

  const generateMutation = trpc.activityGuide.generateActivity.useMutation();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    await generateMutation.mutateAsync({ topic, gradeLevel, activityType });
  };

  const handleVoiceInput = (text: string) => {
    setTopic(text);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Activity Guide</h1>
      <p className="text-slate-600 mb-8">Discover hands-on classroom activities</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generate Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Topic</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="e.g., Ecosystems"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="mt-2">
                <VoiceRecorder
                  onTranscribed={handleVoiceInput}
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
              <label className="text-sm font-medium">Activity Type</label>
              <Select value={activityType} onValueChange={(v: any) => setActivityType(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hands-on">Hands-On</SelectItem>
                  <SelectItem value="experiment">Experiment</SelectItem>
                  <SelectItem value="group-discussion">Group Discussion</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
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

        <div className="lg:col-span-3">
          {generateMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {generateMutation.data.activityType}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">{generateMutation.data.activity}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
