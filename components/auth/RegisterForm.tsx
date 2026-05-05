"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export function RegisterForm() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Pendaftaran</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Saat ini pendaftaran pembelajaran Zakat Academy belum dibuka kembali. Silahkan hubungi admin untuk informasi lebih lanjut.
        </p>
        <a href="https://wa.me/628111186626" target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <MessageCircle className="h-4 w-4" />
          Hubungi Admin
        </a>
      </CardContent>
    </Card>
  );
}