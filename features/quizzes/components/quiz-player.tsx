"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAttempt } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface QuizPlayerProps {
  quiz: {
    id: string;
    title: string;
    moduleTitle: string;
    timeLimitMinutes: number;
    startedAt: Date;
    attemptId: string;
    questions: {
      id: string;
      question: string;
      order: number;
      options: { id: string; label: string }[];
    }[];
  };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    const elapsed = Math.floor((Date.now() - quiz.startedAt.getTime()) / 1000);
    return Math.max(0, quiz.timeLimitMinutes * 60 - elapsed);
  });
  const [isExpired, setIsExpired] = useState(false);
  const submitted = useRef(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || isExpired) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isExpired]);

  // Auto-submit when expired
  useEffect(() => {
    if (!isExpired || submitted.current) return;
    submitted.current = true;
    handleAutoSubmit();
  }, [isExpired]);

  async function handleAutoSubmit() {
    setIsSubmitting(true);
    try {
      const result = await submitQuizAttempt(quiz.id, quiz.attemptId, answers);
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      toast.error("Waktu habis! Kuis dikumpulkan secara otomatis.");
      router.push(`/quiz/${quiz.id}/result/${quiz.attemptId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim jawaban");
    }
  }

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmit() {
    if (submitted.current) return;
    submitted.current = true;
    setIsSubmitting(true);
    try {
      const result = await submitQuizAttempt(quiz.id, quiz.attemptId, answers);
      if (result && "error" in result) {
        submitted.current = false;
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }
      router.push(`/quiz/${quiz.id}/result/${quiz.attemptId}`);
    } catch (err) {
      submitted.current = false;
      toast.error(err instanceof Error ? err.message : "Gagal mengirim jawaban");
      setIsSubmitting(false);
    }
  }

  const allAnswered = quiz.questions.every((q) => answers[q.id]);
  const isUrgent = timeLeft <= 60;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Timer + Info Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border bg-background px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-lg font-bold">{quiz.title}</h1>
          <p className="text-xs text-muted-foreground">{quiz.moduleTitle}</p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 font-mono text-lg font-bold ${
            isUrgent
              ? "bg-red-100 text-red-700"
              : "bg-primary/10 text-primary"
          }`}
        >
          {isExpired ? (
            <span className="text-red-600">WAKTU HABIS</span>
          ) : (
            <>
              <span>⏱</span>
              <span>{formatTime(timeLeft)}</span>
            </>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {quiz.questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                {qIndex + 1}. {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.id] ?? ""}
                onValueChange={(v: string) => selectAnswer(question.id, v)}
              >
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit */}
      <div className="sticky bottom-4 flex items-center justify-between rounded-lg border bg-background p-4 shadow-lg">
        <p className="text-sm text-muted-foreground">
          {Object.keys(answers).length}/{quiz.questions.length} terjawab
        </p>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting || isExpired}
          variant={allAnswered ? "default" : "outline"}
        >
          {isSubmitting
            ? "Mengirim..."
            : isExpired
            ? "Waktu Habis"
            : "Kirim Jawaban"}
        </Button>
      </div>
    </div>
  );
}