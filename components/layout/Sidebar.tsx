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
  Target,
  Swords,
  Users,
  Network,
  Flame,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  X,
  BookOpen,
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["nav", "advanced", "favorites", "pages"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setPageState(pages);
  }, [pages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    }
  }, [isCollapsed]);

  // Filter pages based on search
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pageState;
    const query = searchQuery.toLowerCase();
    return pageState.filter(
      (page) =>
        page.title.toLowerCase().includes(query) ||
        page.type.toLowerCase().includes(query)
    );
  }, [pageState, searchQuery]);

  const filteredTree = useMemo(() => buildTree(filteredPages), [filteredPages]);

  const favorites = useMemo(
    () => filteredPages.filter((page) => page.isFavorite).sort((a, b) => a.title.localeCompare(b.title)),
    [filteredPages],
  );

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

  const advancedNavItems = [
    { label: "Study Runs", href: `/workspace/${workspaceId}/study-runs`, icon: Target },
    { label: "Boss Fights", href: `/workspace/${workspaceId}/boss-fights`, icon: Swords },
    { label: "Focus Rooms", href: `/workspace/${workspaceId}/focus-rooms`, icon: Users },
    { label: "Topics", href: `/workspace/${workspaceId}/topics`, icon: Network },
    { label: "Study Debts", href: `/workspace/${workspaceId}/study-debts`, icon: Flame },
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
    <div className={`flex h-full flex-col bg-white dark:bg-sidebar transition-all duration-300 ease-in-out ${isCollapsed ? "w-16" : "w-64"} shadow-sm`}>
      {/* Header */}
      <div className={`border-b border-gray-200 dark:border-gray-800 ${isCollapsed ? "p-2" : "p-4"} relative flex-shrink-0`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between mb-2 pr-10">
              <div>
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">NOTELOFT</h2>
                <p className="mt-0.5 text-xs font-semibold text-gray-600 dark:text-gray-400">Student Workspace OS</p>
              </div>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Search pages"
              >
                <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate pr-10">{workspaceName}</p>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400">N</h2>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute ${isCollapsed ? "top-2 right-2" : "top-4 right-4"} p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Search Bar */}
      {showSearch && !isCollapsed && (
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pages..."
              className="w-full pl-9 pr-8 py-2 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-3 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isCollapsed 
                    ? "justify-center px-2 py-2.5" 
                    : "gap-3 px-3 py-2.5"
                } ${
                  active
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 transition-transform ${active ? "scale-110" : "group-hover:scale-105"}`} />
                {!isCollapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {active && !isCollapsed && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Advanced Features Section */}
        {!isCollapsed && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedSections);
                if (newExpanded.has("advanced")) {
                  newExpanded.delete("advanced");
                } else {
                  newExpanded.add("advanced");
                }
                setExpandedSections(newExpanded);
              }}
              className="flex items-center justify-between w-full px-3 mb-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg py-1.5 transition-colors group"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                Advanced
              </span>
              <ChevronRight
                className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                  expandedSections.has("advanced") ? "rotate-90" : ""
                }`}
              />
            </button>
            {expandedSections.has("advanced") && (
            <div className="space-y-1 animate-in slide-in-from-top-2">
              {advancedNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-transform ${active ? "scale-110" : "group-hover:scale-105"}`} />
                    <span className="truncate flex-1">{item.label}</span>
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                    )}
                  </Link>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* Advanced items when collapsed - show as icons only */}
        {isCollapsed && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
            {advancedNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-center rounded-lg px-2 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }`}
                  title={item.label}
                >
                  <Icon className={`h-4 w-4 transition-transform ${active ? "scale-110" : "group-hover:scale-105"}`} />
                </Link>
              );
            })}
          </div>
        )}

        {favorites.length > 0 && !isCollapsed && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedSections);
                if (newExpanded.has("favorites")) {
                  newExpanded.delete("favorites");
                } else {
                  newExpanded.add("favorites");
                }
                setExpandedSections(newExpanded);
              }}
              className="flex items-center justify-between w-full px-3 mb-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg py-1.5 transition-colors group"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                Favorites
              </span>
              <ChevronRight
                className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                  expandedSections.has("favorites") ? "rotate-90" : ""
                }`}
              />
            </button>
            {expandedSections.has("favorites") && (
            <div className="space-y-1 animate-in slide-in-from-top-2">
              {favorites.map((page) => (
                <Link
                  key={page.id}
                  href={`/workspace/${workspaceId}/pages/${page.id}`}
                  className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    pathname === `/workspace/${workspaceId}/pages/${page.id}`
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                  <span className="truncate flex-1">{page.title}</span>
                </Link>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Favorites when collapsed - show as icons only */}
        {favorites.length > 0 && isCollapsed && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
            {favorites.slice(0, 5).map((page) => (
              <Link
                key={page.id}
                href={`/workspace/${workspaceId}/pages/${page.id}`}
                className={`group flex items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium transition-all duration-200 ${
                  pathname === `/workspace/${workspaceId}/pages/${page.id}`
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                }`}
                title={page.title}
              >
                <Star className={`h-4 w-4 fill-amber-400 text-amber-400 transition-transform ${pathname === `/workspace/${workspaceId}/pages/${page.id}` ? "scale-110" : "group-hover:scale-105"}`} />
              </Link>
            ))}
          </div>
        )}

        {filteredPages.length > 0 && !isCollapsed && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-3 mb-2">
              <button
                onClick={() => {
                  const newExpanded = new Set(expandedSections);
                  if (newExpanded.has("pages")) {
                    newExpanded.delete("pages");
                  } else {
                    newExpanded.add("pages");
                  }
                  setExpandedSections(newExpanded);
                }}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg py-1.5 px-2 -ml-2 transition-colors group"
              >
                <BookOpen className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                  Pages
                </span>
                <ChevronRight
                  className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                    expandedSections.has("pages") ? "rotate-90" : ""
                  }`}
                />
              </button>
              <Link
                href={`/workspace/${workspaceId}/pages/new`}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-blue-600 dark:text-blue-400"
                title="New page"
              >
                <Plus className="w-4 h-4" />
              </Link>
            </div>
            {expandedSections.has("pages") && (
            <div className="animate-in slide-in-from-top-2">
              <DragDropContext onDragEnd={handleDragEnd}>{renderTree(filteredTree)}</DragDropContext>
            </div>
            )}
            {searchQuery && filteredPages.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No pages found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {filteredPages.length === 0 && !searchQuery && !isCollapsed && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 px-3">
            <Link
              href={`/workspace/${workspaceId}/pages/new`}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first page
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 space-y-1 flex-shrink-0 mt-auto">
        <Link
          href="/profile"
          className={`group flex items-center rounded-lg text-sm font-semibold transition-all duration-200 ${
            isCollapsed 
              ? "justify-center px-2 py-2.5 mx-2 mt-2" 
              : "gap-3 px-3 py-2.5 mx-3 mt-2"
          } ${
            pathname === "/profile"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
          }`}
          title={isCollapsed ? "Profile" : undefined}
        >
          <User className={`h-4 w-4 transition-transform ${pathname === "/profile" ? "scale-110" : "group-hover:scale-105"}`} />
          {!isCollapsed && <span>Profile</span>}
        </Link>
        <Link
          href="/settings"
          className={`group flex items-center rounded-lg text-sm font-semibold transition-all duration-200 ${
            isCollapsed 
              ? "justify-center px-2 py-2.5 mx-2" 
              : "gap-3 px-3 py-2.5 mx-3"
          } ${
            pathname === "/settings"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
          }`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className={`h-4 w-4 transition-transform ${pathname === "/settings" ? "scale-110" : "group-hover:scale-105"}`} />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        {!isCollapsed && (
          <div className="px-4 pb-3 pt-2 text-center">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">NOTELOFT</div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">v1.0.0</div>
          </div>
        )}
      </div>
    </div>
  );
}
