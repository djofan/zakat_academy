import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Trophy, Medal } from "lucide-react";

export const dynamic = 'force-dynamic'

function getNilaiLabel(avg: number) {
  if (avg >= 90) return { label: 'Mumtaz', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
  if (avg >= 80) return { label: 'Jayyid Jiddan', color: 'bg-green-50 text-green-700 border-green-200' }
  if (avg >= 60) return { label: 'Jayyid', color: 'bg-blue-50 text-blue-700 border-blue-200' }
  return { label: 'Maqbul', color: 'bg-gray-50 text-gray-600 border-gray-200' }
}

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const attempts = await db.quizAttempt.findMany({
    where: { isCompleted: true, user: { role: 'STUDENT' } },
    select: {
      userId: true,
      score: true,
      user: { select: { id: true, name: true, nis: true } },
    },
  });

  const scoreMap = new Map<string, { name: string; nis: string | null; scores: number[] }>()

  for (const attempt of attempts) {
    const score = attempt.score ?? 0
    const existing = scoreMap.get(attempt.userId)
    if (existing) {
      existing.scores.push(score)
    } else {
      scoreMap.set(attempt.userId, {
        name: attempt.user.name ?? 'Tanpa Nama',
        nis: attempt.user.nis,
        scores: [score],
      })
    }
  }

  const rankings = Array.from(scoreMap.entries())
    .map(([userId, data]) => ({
      userId,
      name: data.name,
      nis: data.nis,
      average: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      totalQuizzes: data.scores.length,
    }))
    .sort((a, b) => b.average - a.average)

  const myRank = rankings.findIndex((r) => r.userId === session.user.id) + 1
  const myData = myRank > 0 ? rankings[myRank - 1] : null

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Peringkat</h1>
        <p className="mt-1 text-sm text-gray-500">Peringkat peserta berdasarkan rata-rata nilai kuis.</p>
      </div>

      {/* Posisi saya */}
      {myData && (
        <div className="mb-5 rounded-2xl border border-green-100 bg-green-50 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-lg font-bold text-white shadow-sm shadow-green-200">
              {myRank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">Posisi kamu saat ini</p>
              <p className="text-sm text-gray-500">
                Rata-rata {myData.average.toFixed(1)} · {myData.totalQuizzes} kuis dikerjakan
              </p>
            </div>
            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${getNilaiLabel(myData.average).color}`}>
              {getNilaiLabel(myData.average).label}
            </span>
          </div>
        </div>
      )}

      {/* Papan peringkat */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h2 className="font-semibold text-gray-900">Papan Peringkat</h2>
        </div>

        {rankings.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-gray-200" />
            <p className="text-sm text-gray-400">Belum ada data peringkat.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {rankings.map((student, idx) => {
              const isMe = student.userId === session.user.id
              const rank = idx + 1

              return (
                <div
                  key={student.userId}
                  className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                    isMe ? 'bg-green-50/50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 shrink-0 text-center">
                    {rank === 1 ? (
                      <Trophy className="mx-auto h-5 w-5 text-amber-400" />
                    ) : rank === 2 ? (
                      <Medal className="mx-auto h-5 w-5 text-gray-400" />
                    ) : rank === 3 ? (
                      <Medal className="mx-auto h-5 w-5 text-amber-600" />
                    ) : (
                      <span className="text-sm text-gray-400">{rank}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {student.name}
                      {isMe && <span className="ml-2 text-xs font-normal text-green-600">(Saya)</span>}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">{student.nis ?? '-'}</p>
                  </div>

                  {/* Score */}
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-gray-900">{student.average.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">{student.totalQuizzes} kuis</p>
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${getNilaiLabel(student.average).color}`}>
                      {getNilaiLabel(student.average).label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}