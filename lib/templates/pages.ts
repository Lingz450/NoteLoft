export type PageTemplate = {
  id: string;
  name: string;
  description: string;
  content: Record<string, any>;
};

const paragraph = (text: string) => ({
  type: "paragraph",
  content: text ? [{ type: "text", text }] : [],
});

const heading = (level: number, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [{ type: "text", text }],
});

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "blank",
    name: "Blank page",
    description: "Start from scratch with a clean canvas.",
    content: {
      type: "doc",
      content: [paragraph("")],
    },
  },
  {
    id: "course-notes",
    name: "Course notes",
    description: "Overview, lectures, assignments, exam notes.",
    content: {
      type: "doc",
      content: [
        heading(1, "Course overview"),
        paragraph("Learning goals, professor, resources..."),
        heading(2, "Lectures"),
        paragraph("Week 1 — Introduction"),
        heading(2, "Assignments"),
        paragraph("Track requirements and due dates here."),
        heading(2, "Exam notes"),
        paragraph("Summaries, formulas, or cheat sheet items."),
      ],
    },
  },
  {
    id: "exam-revision",
    name: "Exam revision",
    description: "Key topics, weak spots, past questions.",
    content: {
      type: "doc",
      content: [
        heading(1, "Key topics"),
        paragraph("List the major chapters or themes."),
        heading(2, "Weak areas"),
        paragraph("1. "),
        heading(2, "Past questions"),
        paragraph("• "),
      ],
    },
  },
  {
    id: "semester-dashboard",
    name: "Semester dashboard",
    description: "High-level overview of focus, tasks, exams.",
    content: {
      type: "doc",
      content: [
        heading(1, "This week"),
        paragraph("Top 3 priorities:"),
        heading(2, "Courses"),
        paragraph("• "),
        heading(2, "Upcoming exams & deadlines"),
        paragraph("• "),
        heading(2, "Revision plan"),
        paragraph("• "),
      ],
    },
  },
];
