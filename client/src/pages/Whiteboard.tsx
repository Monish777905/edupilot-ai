import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Image as ImageIcon } from "lucide-react";
import VoiceRecorder from "@/components/VoiceRecorder";
import VoicePlayer from "@/components/VoicePlayer";
import { trpc } from "@/lib/trpc";

export default function Whiteboard() {
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState<"diagram" | "concept-map" | "flowchart" | "illustration">("diagram");

  const generateMutation = trpc.whiteboard.generateContent.useMutation();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    await generateMutation.mutateAsync({ prompt, contentType });
  };

  const handleVoiceInput = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">AI Whiteboard</h1>
      <p className="text-slate-600 mb-8">Generate educational diagrams and visuals</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generate Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Prompt</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Describe what to draw..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <div className="mt-2">
                <VoiceRecorder
                  onTranscribed={handleVoiceInput}
                  placeholder="Speak your prompt..."
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Content Type</label>
              <Select value={contentType} onValueChange={(v: any) => setContentType(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diagram">Diagram</SelectItem>
                  <SelectItem value="concept-map">Concept Map</SelectItem>
                  <SelectItem value="flowchart">Flowchart</SelectItem>
                  <SelectItem value="illustration">Illustration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generateMutation.isPending}
              className="w-full"
            >
              {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          {generateMutation.data?.imageUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Generated Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img src={(generateMutation.data.imageUrl as any)?.url || generateMutation.data.imageUrl || ""} alt="Generated" className="w-full rounded-lg" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
