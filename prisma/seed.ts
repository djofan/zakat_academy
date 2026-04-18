import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, VideoProvider } from "../src/generated/prisma/client";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@zakatacademy.local" },
    update: {},
    create: {
      name: "Admin Zakat Academy",
      email: "admin@zakatacademy.local",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@zakatacademy.local" },
    update: {},
    create: {
      name: "Student Demo",
      email: "student@zakatacademy.local",
      passwordHash: studentPassword,
      role: Role.STUDENT,
    },
  });

  const program = await prisma.program.upsert({
    where: { slug: "fikih-zakat-dasar" },
    update: {},
    create: {
      title: "Fikih Zakat Dasar",
      slug: "fikih-zakat-dasar",
      shortDescription: "Program dasar untuk memahami konsep, hukum, dan praktik zakat.",
      description: "Belajar zakat secara bertahap melalui video, modul, dan evaluasi.",
      isPublished: true,
      order: 1,
    },
  });

  const existingModule = await prisma.module.findFirst({
    where: {
      programId: program.id,
      slug: "pengantar-zakat",
    },
  });

  const moduleOne =
    existingModule ||
    (await prisma.module.create({
      data: {
        programId: program.id,
        title: "Pengantar Zakat",
        slug: "pengantar-zakat",
        description: "Memahami dasar-dasar zakat.",
        order: 1,
        isPublished: true,
      },
    }));

  const lessonOne = await prisma.lesson.upsert({
    where: { slug: "apa-itu-zakat" },
    update: {},
    create: {
      moduleId: moduleOne.id,
      title: "Apa Itu Zakat",
      slug: "apa-itu-zakat",
      shortDescription: "Pengenalan zakat dalam Islam.",
      contentSummary: "Membahas definisi, kedudukan, dan urgensi zakat.",
      videoProvider: VideoProvider.YOUTUBE,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      order: 1,
      isPublished: true,
    },
  });

  await prisma.lesson.upsert({
    where: { slug: "siapa-yang-wajib-zakat" },
    update: {},
    create: {
      moduleId: moduleOne.id,
      title: "Siapa yang Wajib Zakat",
      slug: "siapa-yang-wajib-zakat",
      shortDescription: "Syarat wajib zakat.",
      contentSummary: "Membahas muslim, nisab, haul, dan ketentuan dasar.",
      videoProvider: VideoProvider.YOUTUBE,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      order: 2,
      isPublished: true,
    },
  });

  await prisma.lessonAttachment.upsert({
    where: {
      id: "starter-attachment-1",
    },
    update: {},
    create: {
      id: "starter-attachment-1",
      lessonId: lessonOne.id,
      title: "Ringkasan Materi PDF",
      fileUrl: "https://example.com/ringkasan-materi.pdf",
      fileType: "application/pdf",
      fileSize: 245760,
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_programId: {
        userId: student.id,
        programId: program.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      programId: program.id,
    },
  });

  console.log("Seed selesai");
  console.log({
    adminEmail: admin.email,
    adminPassword: "admin123",
    studentEmail: student.email,
    studentPassword: "student123",
    program: program.title,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });