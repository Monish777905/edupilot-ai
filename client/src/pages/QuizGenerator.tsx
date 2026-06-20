import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Progress } from "@/components/ui/progress";

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [quizType, setQuizType] = useState<"mcq" | "short-answer" | "mixed">("mixed");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("hinglish");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const generateMutation = trpc.quizGenerator.generateQuiz.useMutation();
  const submitMutation = trpc.quizGenerator.submitAnswers.useMutation();

  const quiz = generateMutation.data;
  const currentQuestion = quiz?.questions[currentQuestionIndex];

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) return;
    const result = await generateMutation.mutateAsync({
      topic,
      questionCount,
      quizType,
      language,
    });
    if (result) {
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowResults(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    const result = await submitMutation.mutateAsync({
      quizId: 0,
      answers: userAnswers,
    });
    if (result) {
      setShowResults(true);
    }
  };

  if (!quizStarted) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Quiz Generator</h1>
        <p className="text-slate-600 mb-8">Create interactive quizzes with instant feedback and scoring</p>

        <Card>
          <CardHeader>
            <CardTitle>Create New Quiz</CardTitle>
            <CardDescription>Configure your quiz parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <label className="text-sm font-medium">Number of Questions</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Quiz Type</label>
              <Select value={quizType} onValueChange={(v: any) => setQuizType(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
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
              onClick={handleGenerateQuiz}
              disabled={!topic.trim() || generateMutation.isPending}
              className="w-full"
              size="lg"
            >
              {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && submitMutation.data) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
        <p className="text-slate-600 mb-8">Here's how you performed</p>

        <Card>
          <CardHeader>
            <CardTitle>{quiz?.topic}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {submitMutation.data.score}%
              </div>
              <p className="text-lg text-slate-600">
                {submitMutation.data.correctCount} out of {submitMutation.data.totalCount} correct
              </p>
            </div>

            <div className="space-y-4">
              {quiz?.questions.map((question: any, idx: number) => {
                const isCorrect = userAnswers[question.id] === question.correctAnswer;
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{question.question}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          Your answer: {userAnswers[question.id] || "Not answered"}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            Correct answer: {question.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={() => {
                setQuizStarted(false);
                setCurrentQuestionIndex(0);
                setUserAnswers({});
                setShowResults(false);
                generateMutation.reset();
              }}
              className="w-full"
            >
              Create Another Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="p-8">Loading quiz...</div>;
  }

  const progress = ((currentQuestionIndex + 1) / (quiz?.questions.length || 1)) * 100;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{quiz?.topic}</h1>
      <p className="text-slate-600 mb-8">Question {currentQuestionIndex + 1} of {quiz?.questions.length}</p>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <Progress value={progress} className="mb-4" />
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>

              {currentQuestion.type === "mcq" && currentQuestion.options ? (
                <RadioGroup
                  value={userAnswers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                >
                  <div className="space-y-3">
                    {currentQuestion.options.map((option: any, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${idx}`} />
                        <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <Input
                  placeholder="Type your answer here..."
                  value={userAnswers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-3 justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                Previous
              </Button>

              {currentQuestionIndex === (quiz?.questions.length || 0) - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
