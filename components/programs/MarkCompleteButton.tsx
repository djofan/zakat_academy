"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface MarkCompleteButtonProps {
  lessonId: string;
  isCompleted: boolean;
  userId: string;
}

export function MarkCompleteButton({
  lessonId,
  isCompleted,
  userId,
}: MarkCompleteButtonProps) {
  const [done, setDone] = useState(isCompleted);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, isCompleted: !done }),
      });
      if (res.ok) setDone(!done);
      router.refresh();
    });
  }

  return (
    <Button
      variant={done ? "outline" : "default"}
      size="sm"
      onClick={toggle}
      disabled={pending}
      className={done ? "text-primary" : ""}
    >
      <CheckCircle className="mr-1.5 h-4 w-4" />
      {done ? "Tandai Belum Selesai" : "Tandai Selesai"}
    </Button>
  );
}