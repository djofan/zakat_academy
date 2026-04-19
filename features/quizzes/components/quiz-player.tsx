"use client";

import { useState } from "react";
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
    questions: {
      id: string;
      text: string;
      options: { id: string; label: string }[];
    }[];
  };
}

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAnswered = quiz.questions.every((q) => answers[q.id]);

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const result = await submitQuizAttempt(quiz.id, answers);
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      const attemptId = (result as { attemptId: string }).attemptId;
      router.push(`/quiz/${quiz.id}/result/${attemptId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim jawaban");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <p className="text-muted-foreground">
          {quiz.questions.length} soal &middot; Lulus &ge; 70
        </p>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                {qIndex + 1}. {question.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.id] ?? ""}
                onValueChange={(v: string) => selectAnswer(question.id, v)}
              >
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50">
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

      <div className="sticky bottom-4 flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
        >
          {isSubmitting ? "Mengirim..." : "Kirim Jawaban"}
        </Button>
      </div>
    </div>
  );
}
