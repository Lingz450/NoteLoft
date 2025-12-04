import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CourseDetailView } from "@/components/courses/CourseDetailView";

type Props = {
  params: { workspaceId: string; courseId: string };
};

export default async function CourseDetailPage({ params }: Props) {
  const { workspaceId, courseId } = params;

  const course = await prisma.course.findFirst({
    where: { id: courseId, workspaceId },
    include: {
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
        },
        orderBy: { dueDate: "asc" },
      },
      exams: {
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
          weight: true,
        },
        orderBy: { date: "asc" },
      },
      assessmentItems: {
        select: {
          id: true,
          title: true,
          score: true,
          maxScore: true,
          weight: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const safeCourse = {
    ...course,
    tasks: course.tasks.map((task) => ({
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    })),
    exams: course.exams.map((exam) => ({
      ...exam,
      date: exam.date.toISOString(),
    })),
    assessmentItems: course.assessmentItems.map((item) => ({
      ...item,
    })),
  };

  return <CourseDetailView workspaceId={workspaceId} course={safeCourse} />;
}
