"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-3xl space-y-6"
      >
        <motion.div variants={fadeUp}>
          <Badge variant="outline" className="text-sm font-normal">
            Platform Belajar Zakat
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-4xl font-bold tracking-tight sm:text-5xl"
        >
          Pahami Zakat dengan{" "}
          <span className="text-primary">Lebih Mudah</span>{" "}
          dan Terstruktur
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto max-w-xl text-lg text-muted-foreground"
        >
          Pelajari fiqh zakat secara mendalam melalui video terstruktur,
          kuis interaktif, dan panduan lengkap dari para pengajar terpercaya.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <Button size="lg" asChild>
            <Link href="/register">Mulai Belajar Gratis</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#programs">Lihat Program</a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
