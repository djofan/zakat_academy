import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Trophy, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Ambil semua attempt yang sudah selesai
  const attempts = await db.quizAttempt.findMany({
    where: {
       isCompleted: true,
        user: {
        role: 'STUDENT',
    },
    },
    select: {
      userId: true,
      score: true,
      user: {
        select: {
          id: true,
          name: true,
          nis: true,
          gender: true,
        },
      },
    },
  });

  // Hitung rata-rata score per student
  const scoreMap = new Map<string, { name: string; nis: string | null; gender: string | null; scores: number[] }>()

  for (const attempt of attempts) {
  const score = attempt.score ?? 0  // ← kalau null, anggap 0
  const existing = scoreMap.get(attempt.userId)
  if (existing) {
    existing.scores.push(score)
  } else {
    scoreMap.set(attempt.userId, {
      name: attempt.user.name ?? 'Tanpa Nama',
      nis: attempt.user.nis,
      gender: attempt.user.gender,
      scores: [score],
    })
  }
}

  // Buat array ranking
  const rankings = Array.from(scoreMap.entries())
    .map(([userId, data]) => ({
      userId,
      name: data.name,
      nis: data.nis,
      gender: data.gender,
      average: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      totalQuizzes: data.scores.length,
    }))
    .sort((a, b) => b.average - a.average)

  const myRank = rankings.findIndex((r) => r.userId === session.user.id) + 1

  function getNilaiLabel(avg: number) {
  if (avg >= 90) return { label: 'Mumtaz', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' }
  if (avg >= 80) return { label: 'Jayyid Jiddan', color: 'bg-green-100 text-green-800 border-green-300' }
  if (avg >= 60) return { label: 'Jayyid', color: 'bg-blue-100 text-blue-800 border-blue-300' }
  return { label: 'Maqbul', color: 'bg-gray-100 text-gray-700 border-gray-300' }
}

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Peringkat</h1>
        <p className="text-muted-foreground">Peringkat keseluruhan peserta berdasarkan rata-rata nilai kuis.</p>
      </div>

      {/* Posisi saya */}
      {myRank > 0 && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              {myRank}
            </div>
            <div>
              <p className="font-medium">Posisi kamu saat ini</p>
              <p className="text-sm text-muted-foreground">
                Rata-rata: {rankings[myRank - 1]?.average.toFixed(1)} · {rankings[myRank - 1]?.totalQuizzes} kuis dikerjakan
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabel ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-amber-500" />
            Papan Peringkat
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada data peringkat.
            </p>
          ) : (
            <div className="space-y-2">
              {rankings.map((student, idx) => {
                const isMe = student.userId === session.user.id
                const rank = idx + 1
                return (
                  <div
                    key={student.userId}
                    className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm ${
                      isMe ? 'bg-primary/10 font-medium' : 'hover:bg-muted'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center">
                      {rank === 1 ? (
                        <Trophy className="h-5 w-5 text-amber-500 mx-auto" />
                      ) : rank === 2 ? (
                        <Medal className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : rank === 3 ? (
                        <Medal className="h-5 w-5 text-amber-700 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">{rank}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate">
                        {student.name}
                        {isMe && <span className="ml-2 text-xs text-primary">(Saya)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {student.nis ?? '-'}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
  <p className="font-bold">{student.average.toFixed(1)}</p>
  <p className="text-xs text-muted-foreground">{student.totalQuizzes} kuis</p>
  <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${getNilaiLabel(student.average).color}`}>
    {getNilaiLabel(student.average).label}
  </span>
</div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}