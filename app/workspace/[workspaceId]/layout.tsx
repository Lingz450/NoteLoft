import { ReactNode } from "react";
import { prisma } from "@/lib/db";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { Sidebar } from "@/components/layout/Sidebar";
import { QuickCapture } from "@/components/common/QuickCapture";
import { AISidekick } from "@/components/ai/AISidekick";
import { CommandPalette } from "@/components/common/CommandPalette";
import { TopBar } from "@/components/top-bar";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  // Handle demo mode without database
  let workspace;
  if (workspaceId === "demo") {
    workspace = {
      id: "demo",
      name: "Fall 2025 Semester",
      pages: [],
    };
  } else {
    workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        pages: {
          select: { id: true, title: true, parentId: true, type: true, isFavorite: true, position: true },
          orderBy: [{ parentId: "asc" }, { position: "asc" }],
        },
      },
    });

    if (!workspace) {
      return <div className="p-6">Workspace not found</div>;
    }
  }

  const sidebar = (
    <Sidebar
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      pages={workspace.pages.map((p) => ({
        id: p.id,
        title: p.title,
        parentId: p.parentId,
        type: p.type,
        isFavorite: p.isFavorite,
        position: p.position,
      }))}
    />
  );

  const topbar = <TopBar workspaceId={workspace.id} workspaceName={workspace.name} />;

  return (
    <WorkspaceShell sidebar={sidebar} topbar={topbar}>
      {children}
      <QuickCapture />
      <AISidekick />
      <CommandPalette />
    </WorkspaceShell>
  );
}
