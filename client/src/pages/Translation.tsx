import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRightLeft } from "lucide-react";
import VoiceRecorder from "@/components/VoiceRecorder";
import VoicePlayer from "@/components/VoicePlayer";
import { trpc } from "@/lib/trpc";

export default function Translation() {
  const [text, setText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [targetLanguage, setTargetLanguage] = useState<"en" | "hi" | "hinglish">("hi");

  const translateMutation = trpc.translation.translate.useMutation();

  const handleTranslate = async () => {
    if (!text.trim()) return;
    await translateMutation.mutateAsync({ text, sourceLanguage, targetLanguage });
  };

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };

  const handleVoiceInput = (voiceText: string) => {
    setText(voiceText);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Bilingual Translation</h1>
      <p className="text-slate-600 mb-8">Translate lesson content between English, Hindi, and Hinglish</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source */}
        <Card>
          <CardHeader>
            <CardTitle>Source Text</CardTitle>
            <Select value={sourceLanguage} onValueChange={(v: any) => setSourceLanguage(v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="hinglish">Hinglish</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Enter text to translate..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-64"
            />
            <VoiceRecorder
              onTranscribed={handleVoiceInput}
              language={sourceLanguage}
              placeholder="Speak text to translate..."
            />
          </CardContent>
        </Card>

        {/* Target */}
        <Card>
          <CardHeader>
            <CardTitle>Translated Text</CardTitle>
            <Select value={targetLanguage} onValueChange={(v: any) => setTargetLanguage(v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="hinglish">Hinglish</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="min-h-64 p-3 border rounded-md bg-slate-50">
              {translateMutation.data?.translatedText || "Translation will appear here..."}
            </div>
            {translateMutation.data?.translatedText && (
              <VoicePlayer
                text={translateMutation.data.translatedText}
                language={targetLanguage}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 justify-center mt-6">
        <Button
          onClick={handleSwapLanguages}
          variant="outline"
          size="sm"
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Swap Languages
        </Button>

        <Button
          onClick={handleTranslate}
          disabled={!text.trim() || translateMutation.isPending}
          size="lg"
        >
          {translateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Translate
        </Button>
      </div>
    </div>
  );
}
