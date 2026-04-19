"use client";

import type { Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import type { QuizFormValues } from "../schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";

interface QuestionEditorProps {
  questionIndex: number;
  control: Control<QuizFormValues>;
  register: UseFormRegister<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  onRemove: () => void;
}

export function QuestionEditor({
  questionIndex,
  control,
  register,
  errors,
  onRemove,
}: QuestionEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const questionErrors = errors.questions?.[questionIndex];

  function addOption() {
    append({ label: "", isCorrect: false });
  }

  function setCorrectOption(optionIndex: number) {
    const totalOptions = fields.length;
    for (let i = 0; i < totalOptions; i++) {
      const el = document.getElementById(
        `questions.${questionIndex}.options.${i}.isCorrect`
      ) as HTMLInputElement | null;
      if (el) {
        el.checked = i === optionIndex;
      }
    }
    const allFields = document.querySelectorAll<HTMLInputElement>(
      `input[name^="questions.${questionIndex}.options"]`
    );
    allFields.forEach((el, i) => {
      if (el.dataset.correct === "true") {
        el.click();
      }
    });
  }

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            Soal {questionIndex + 1}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1">
          <Input
            placeholder={`Teks soal ${questionIndex + 1}...`}
            {...register(`questions.${questionIndex}.text`)}
          />
          {questionErrors?.text && (
            <p className="text-xs text-red-500">
              {String(questionErrors.text.message)}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">
          Pilihan Jawaban
        </p>

        {fields.map((field, optionIndex) => {
          const optErrors = questionErrors?.options?.[optionIndex];
          return (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="radio"
                id={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
                {...register(`questions.${questionIndex}.options.${optionIndex}.isCorrect`)}
                className="h-4 w-4 accent-primary"
                onChange={() => {
                  fields.forEach((_, i) => {
                    if (i !== optionIndex) {
                      const el = document.getElementById(
                        `questions.${questionIndex}.options.${i}.isCorrect`
                      ) as HTMLInputElement | null;
                      if (el) el.checked = false;
                    }
                  });
                }}
              />
              <Input
                placeholder={`Pilihan ${optionIndex + 1}`}
                {...register(`questions.${questionIndex}.options.${optionIndex}.label`)}
                className="flex-1"
              />
              {optErrors?.label && (
                <p className="text-xs text-red-500 w-32">
                  {String(optErrors.label.message)}
                </p>
              )}
              {fields.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(optionIndex)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              )}
            </div>
          );
        })}

        {questionErrors?.options?.root && (
          <p className="text-xs text-red-500">
            {String(questionErrors.options.root.message)}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            Tandai jawaban benar dengan radiobutton
          </p>
          {fields.length < 4 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
            >
              <Plus className="mr-1 h-3 w-3" />
              Tambah Opsi
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
