import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PAGE_TEMPLATES } from "@/lib/templates/pages";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

type Props = {
  params: { workspaceId: string };
};

export default function NewPage({ params }: Props) {
  const { workspaceId } = params;

  async function createPage(formData: FormData) {
    "use server";
    const title = (formData.get("title") as string)?.trim() || "Untitled page";
    const templateId = (formData.get("templateId") as string) || "blank";
    const template = PAGE_TEMPLATES.find((t) => t.id === templateId) ?? PAGE_TEMPLATES[0];
    const page = await prisma.page.create({
      data: {
        workspaceId,
        title,
        content: JSON.stringify(template.content),
        type: templateId.toUpperCase(),
      },
    });

    redirect(`/workspace/${workspaceId}/pages/${page.id}`);
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create a page</h1>
        <p className="text-base font-medium text-gray-600 dark:text-gray-400">Pick a template and we'll set it up instantly.</p>
      </div>

      <form action={createPage} className="space-y-4">
        <div>
          <label className="text-sm font-bold text-gray-900 dark:text-white">Page title</label>
          <input
            name="title"
            placeholder="Semester dashboard"
            className="mt-1 w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {PAGE_TEMPLATES.map((template) => (
            <Card key={template.id} className="p-5 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white mb-1">{template.name}</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{template.description}</p>
                </div>
                <input 
                  type="radio" 
                  name="templateId" 
                  value={template.id} 
                  defaultChecked={template.id === "blank"}
                  className="mt-1 w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </Card>
          ))}
        </div>

        <Button type="submit" size="lg" className="w-full md:w-auto">Create page</Button>
      </form>
    </div>
  );
}
