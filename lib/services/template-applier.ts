/**
 * Template Applier Service
 * 
 * Applies curated templates to a workspace, creating tasks, pages, and schedule blocks.
 */

import { prisma } from "@/lib/db";

export type TemplateApplicationParams = {
  templateId: string;
  workspaceId: string;
  courseId?: string;
  startDate: Date;
};

export type CreationSummary = {
  tasksCreated: number;
  pagesCreated: number;
  scheduleBlocksCreated: number;
};

/**
 * Apply a template to a workspace
 */
export async function applyTemplate(
  params: TemplateApplicationParams
): Promise<CreationSummary> {
  const template = await prisma.template.findUnique({
    where: { id: params.templateId },
    include: { items: true },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  let tasksCreated = 0;
  let pagesCreated = 0;
  let scheduleBlocksCreated = 0;

  for (const item of template.items) {
    const config = JSON.parse(item.config || "{}");
    const itemDate = new Date(params.startDate);
    itemDate.setDate(itemDate.getDate() + item.dayOffset);

    switch (item.itemType) {
      case "TASK":
        await prisma.task.create({
          data: {
            workspaceId: params.workspaceId,
            courseId: params.courseId,
            title: item.title,
            description: item.description,
            priority: config.priority || "NORMAL",
            type: config.type || "OTHER",
            dueDate: itemDate,
            status: "NOT_STARTED",
          },
        });
        tasksCreated++;
        break;

      case "PAGE":
        await prisma.page.create({
          data: {
            workspaceId: params.workspaceId,
            title: item.title,
            type: config.pageType || "GENERIC",
            content: JSON.stringify(config.content || {}),
          },
        });
        pagesCreated++;
        break;

      case "SCHEDULE_BLOCK":
        if (config.dayOfWeek !== undefined) {
          await prisma.timetableSlot.create({
            data: {
              workspaceId: params.workspaceId,
              courseId: params.courseId,
              title: item.title,
              dayOfWeek: config.dayOfWeek,
              startTime: config.startTime || "09:00",
              endTime: config.endTime || "10:00",
              type: config.type || "STUDY",
            },
          });
          scheduleBlocksCreated++;
        }
        break;
    }
  }

  return {
    tasksCreated,
    pagesCreated,
    scheduleBlocksCreated,
  };
}

/**
 * Get all available templates
 */
export async function getTemplates(category?: string) {
  return await prisma.template.findMany({
    where: category ? { category } : {},
    include: { items: true },
    orderBy: { name: "asc" },
  });
}

/**
 * Seed default templates (call this from seed script or admin action)
 */
export async function seedDefaultTemplates() {
  const templates = [
    {
      name: "One Week Catch Up Plan",
      category: "STUDY_PLAN",
      description: "7-day intensive plan to catch up on missed material",
      icon: "Clock",
      items: [
        { itemType: "PAGE", title: "Catch Up Plan", dayOffset: 0, config: JSON.stringify({ pageType: "STUDY_TASKS" }) },
        { itemType: "TASK", title: "Review Week 1-2 lectures", dayOffset: 0, config: JSON.stringify({ priority: "HIGH" }) },
        { itemType: "TASK", title: "Complete practice problems", dayOffset: 2, config: JSON.stringify({ priority: "NORMAL" }) },
        { itemType: "TASK", title: "Review with study group", dayOffset: 5, config: JSON.stringify({ priority: "NORMAL" }) },
      ],
    },
    {
      name: "Finals Week Plan",
      category: "EXAM_PREP",
      description: "Comprehensive finals preparation schedule",
      icon: "GraduationCap",
      items: [
        { itemType: "PAGE", title: "Finals Study Guide", dayOffset: 0, config: JSON.stringify({ pageType: "EXAM_REVISION" }) },
        { itemType: "TASK", title: "Create summary sheets", dayOffset: 0, config: JSON.stringify({ priority: "HIGH" }) },
        { itemType: "TASK", title: "Practice past exams", dayOffset: 2, config: JSON.stringify({ priority: "HIGH" }) },
        { itemType: "SCHEDULE_BLOCK", title: "Final review session", dayOffset: 5, config: JSON.stringify({ dayOfWeek: 0, startTime: "10:00", endTime: "13:00", type: "STUDY" }) },
      ],
    },
  ];

  for (const template of templates) {
    const { items, ...templateData } = template;
    await prisma.template.create({
      data: {
        ...templateData,
        items: {
          create: items,
        },
      },
    });
  }
}

