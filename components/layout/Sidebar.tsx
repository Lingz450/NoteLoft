"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  GraduationCap,
  Calendar,
  ClipboardList,
  Brain,
  BarChart2,
  Star,
  StarOff,
  GripVertical,
  User,
  Settings,
  Sparkles,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type PageType = string;

type SidebarPage = {
  id: string;
  title: string;
  parentId: string | null;
  type: PageType;
  isFavorite: boolean;
  position: number;
};

type PageNode = SidebarPage & { children: PageNode[] };

interface SidebarProps {
  workspaceId: string;
  workspaceName: string;
  pages: SidebarPage[];
}

function buildTree(list: SidebarPage[], parentId: string | null = null): PageNode[] {
  return list
    .filter((page) => (page.parentId ?? null) === (parentId ?? null))
    .sort((a, b) => a.position - b.position)
    .map((page) => ({
      ...page,
      children: buildTree(list, page.id),
    }));
}

const parseParent = (droppableId: string): string | null => {
  const [, value] = droppableId.split(":");
  if (!value || value === "root") return null;
  return value;
};

export function Sidebar({ workspaceId, workspaceName, pages }: SidebarProps) {
  const pathname = usePathname();
  const [pageState, setPageState] = useState(pages);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPageState(pages);
  }, [pages]);

  const favorites = useMemo(
    () => pageState.filter((page) => page.isFavorite).sort((a, b) => a.title.localeCompare(b.title)),
    [pageState],
  );
  const tree = useMemo(() => buildTree(pageState), [pageState]);

  const navItems = [
    { label: "Dashboard", href: `/workspace/${workspaceId}`, icon: LayoutDashboard },
    { label: "AI Assistant", href: "/ai", icon: Brain },
    { label: "Study Mode", href: `/workspace/${workspaceId}/sessions`, icon: CheckSquare },
    { label: "Study Tasks", href: `/workspace/${workspaceId}/tasks`, icon: CheckSquare },
    { label: "Courses", href: `/workspace/${workspaceId}/courses`, icon: GraduationCap },
    { label: "Exams", href: `/workspace/${workspaceId}/exams`, icon: ClipboardList },
    { label: "Schedule", href: `/workspace/${workspaceId}/schedule`, icon: Calendar },
    { label: "Stats", href: `/workspace/${workspaceId}/stats`, icon: BarChart2 },
    { label: "Templates", href: "/templates", icon: Sparkles },
  ];

  const isActive = (href: string) => {
    if (href === `/workspace/${workspaceId}`) return pathname === href;
    return pathname?.startsWith(href);
  };

  async function toggleFavorite(pageId: string, next: boolean) {
    setPageState((prev) => prev.map((page) => (page.id === pageId ? { ...page, isFavorite: next } : page)));
    try {
      await fetch("/api/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pageId, workspaceId, isFavorite: next }),
      });
    } catch {
      // ignore
    }
  }

  function applyPositions(parentId: string | null, orderedIds: string[], list: SidebarPage[]) {
    orderedIds.forEach((id, index) => {
      const item = list.find((page) => page.id === id);
      if (item) {
        item.position = index + 1;
        item.parentId = parentId;
      }
    });
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const sourceParent = parseParent(result.source.droppableId);
    const destinationParent = parseParent(result.destination.droppableId);
    if (result.source.droppableId === result.destination.droppableId && result.source.index === result.destination.index) {
      return;
    }

    setPageState((prev) => {
      const next = prev.map((page) => ({ ...page }));
      const sourceSiblings = next
        .filter((page) => (page.parentId ?? null) === (sourceParent ?? null))
        .sort((a, b) => a.position - b.position)
        .map((page) => page.id);
      const destinationSiblings =
        sourceParent === destinationParent
          ? sourceSiblings
          : next
              .filter((page) => (page.parentId ?? null) === (destinationParent ?? null))
              .sort((a, b) => a.position - b.position)
              .map((page) => page.id);

      const movingId = sourceSiblings[result.source.index];
      if (!movingId) return prev;

      sourceSiblings.splice(result.source.index, 1);
      destinationSiblings.splice(result.destination!.index, 0, movingId);

      applyPositions(sourceParent, sourceSiblings, next);
      applyPositions(destinationParent, destinationSiblings, next);

      startTransition(async () => {
        const affectedParents = Array.from(new Set([sourceParent, destinationParent]));
        const updates = next.filter((page) => affectedParents.includes(page.parentId ?? null));
        await fetch("/api/pages/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            updates: updates.map((page) => ({
              id: page.id,
              parentId: page.parentId,
              position: page.position,
            })),
          }),
        });
      });

      return next;
    });
  }

  function renderTree(nodes: PageNode[], parentId: string | null = null, level = 0) {
    const droppableId = `parent:${parentId ?? "root"}`;
    return (
      <Droppable droppableId={droppableId} type="PAGE">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {nodes.map((node, index) => {
              const active = pathname === `/workspace/${workspaceId}/pages/${node.id}`;
              return (
                <div key={node.id}>
                  <Draggable draggableId={node.id} index={index}>
                    {(drag) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        className={`flex items-center justify-between rounded-lg px-2 py-1 text-sm ${
                          active
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                        style={{ paddingLeft: level * 12 + 12 }}
                      >
        <div className="flex items-center gap-2">
          <span {...drag.dragHandleProps} className="text-[var(--muted)]">
            <GripVertical className="h-3 w-3" />
          </span>
          <Link href={`/workspace/${workspaceId}/pages/${node.id}`} className="truncate flex-1">
            {node.title}
          </Link>
        </div>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(node.id, !node.isFavorite)}
                          className="text-[var(--muted)] hover:text-amber-500"
                        >
                          {node.isFavorite ? (
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ) : (
                            <StarOff className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </Draggable>
                  {node.children.length > 0 && renderTree(node.children, node.id, level + 1)}
                </div>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-sidebar">
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">NOTELOFT</h2>
        <p className="mt-1 text-xs font-semibold text-gray-600 dark:text-gray-400">Student Workspace OS</p>
        <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-200">{workspaceName}</p>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {favorites.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Favorites</span>
            </div>
            <div className="space-y-1">
              {favorites.map((page) => (
                <Link
                  key={page.id}
                  href={`/workspace/${workspaceId}/pages/${page.id}`}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${
                    pathname === `/workspace/${workspaceId}/pages/${page.id}`
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="truncate">{page.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {pageState.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Pages</span>
              <Link href={`/workspace/${workspaceId}/pages/new`} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                + New
              </Link>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>{renderTree(tree)}</DragDropContext>
          </div>
        )}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-800 space-y-1">
        <Link
          href="/profile"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 mx-3 mt-2 text-sm font-semibold transition-colors ${
            pathname === "/profile"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
              : "text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 mx-3 text-sm font-semibold transition-colors ${
            pathname === "/settings"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
              : "text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="px-4 pb-3 pt-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">
          NOTELOFT V1
        </div>
      </div>
    </div>
  );
}
