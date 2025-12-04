import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageEditor } from "@/components/pages/PageEditor";

const emptyDoc = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};

type Props = {
  params: { workspaceId: string; pageId: string };
};

export default async function WorkspacePageEditor({ params }: Props) {
  const { workspaceId, pageId } = params;
  const page = await prisma.page.findFirst({
    where: { id: pageId, workspaceId },
  });

  if (!page) {
    notFound();
  }

  let content = emptyDoc;
  try {
    content = page.content ? JSON.parse(page.content) : emptyDoc;
  } catch {
    content = emptyDoc;
  }

  return (
    <div className="p-6">
      <PageEditor pageId={page.id} workspaceId={workspaceId} initialTitle={page.title} initialContent={content} />
    </div>
  );
}
