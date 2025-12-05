import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/courses/[courseId]/stats
 * Get course statistics (grade, study hours, etc.)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get assessment items for grade calculation
    const assessments = await prisma.assessmentItem.findMany({
      where: { courseId: params.courseId },
      select: {
        score: true,
        maxScore: true,
        weight: true,
      },
    });

    let currentGrade: number | null = null;
    let totalWeight = 0;
    let weightedSum = 0;

    assessments.forEach((a) => {
      if (a.score !== null && a.maxScore > 0) {
        const percentage = (a.score / a.maxScore) * 100;
        weightedSum += percentage * (a.weight / 100);
        totalWeight += a.weight;
      }
    });

    if (totalWeight > 0) {
      currentGrade = weightedSum / (totalWeight / 100);
    }

    // Get weekly study hours
    const sessions = await prisma.studySession.findMany({
      where: {
        courseId: params.courseId,
        startedAt: { gte: startOfWeek },
        status: "COMPLETED",
      },
      select: { durationMinutes: true },
    });

    const weeklyMinutes = sessions.reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    );
    const weeklyHours = Math.floor(weeklyMinutes / 60);
    const weeklyGoal = 5; // Default 5 hours per week per course

    return NextResponse.json({
      currentGrade,
      weeklyHours,
      weeklyGoal,
      totalAssessments: assessments.length,
    });
  } catch (error) {
    console.error("Error fetching course stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

