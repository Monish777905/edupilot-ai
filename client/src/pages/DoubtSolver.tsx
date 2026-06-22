import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import VoiceRecorder from "@/components/VoiceRecorder";
import VoicePlayer from "@/components/VoicePlayer";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

export default function DoubtSolver() {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [chatStarted, setChatStarted] = useState(false);

  const createChatMutation = trpc.doubtSolver.createChat.useMutation();
  const addMessageMutation = trpc.doubtSolver.addMessage.useMutation();

  const handleStartChat = async () => {
    if (!topic.trim()) return;
    const result = await createChatMutation.mutateAsync({ topic });
    if (result) {
      setChatStarted(true);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    await addMessageMutation.mutateAsync({
      chatId: 1,
      studentMessage: message,
    });
    setMessage("");
  };

  const handleVoiceTopicInput = (text: string) => {
    setTopic(text);
  };

  const handleVoiceMessageInput = (text: string) => {
    setMessage(text);
  };

  if (!chatStarted) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Doubt Solver</h1>
        <p className="text-slate-600 mb-8">Ask questions and get step-by-step AI-guided answers</p>

        <Card>
          <CardHeader>
            <CardTitle>Start a New Doubt Session</CardTitle>
            <CardDescription>Enter a topic or subject area</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Photosynthesis, Fractions, World War II"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <VoiceRecorder
              onTranscribed={handleVoiceTopicInput}
              placeholder="Speak your topic..."
            />
            <Button
              onClick={handleStartChat}
              disabled={!topic.trim() || createChatMutation.isPending}
              className="w-full"
            >
              {createChatMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Doubt Solver</h1>
      <p className="text-slate-600 mb-8">Ask your questions</p>

      <Card className="h-96 flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {addMessageMutation.data?.messages.map((msg: any, idx: number) => (
            <div key={idx} className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs p-3 rounded-lg ${msg.role === "student" ? "bg-blue-500 text-white" : "bg-slate-100"}`}>
                <Streamdown>{msg.content}</Streamdown>
              </div>
            </div>
          ))}
        </CardContent>
        <div className="border-t p-4 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Type your question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || addMessageMutation.isPending}
            >
              {addMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <VoiceRecorder
            onTranscribed={handleVoiceMessageInput}
            placeholder="Speak your question..."
          />
        </div>
      </Card>
    </div>
  );
}
