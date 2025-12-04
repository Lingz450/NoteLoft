"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Brain,
  CheckSquare,
  BookOpen,
  GraduationCap,
  Calendar,
  BarChart3,
  FileText,
  Search,
  Star,
  Plus,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const demoPages = [
  {
    name: "Lecture Notes",
    favorite: true,
    children: [{ name: "Week 1 - Intro" }, { name: "Week 2 - Fundamentals" }],
  },
  { name: "Research Papers", favorite: false },
  { name: "Assignment Drafts", favorite: true },
  {
    name: "Study Guides",
    favorite: false,
    children: [{ name: "Midterm Prep" }, { name: "Final Exam Review" }],
  },
];

interface SidebarProps {
  onCommandPalette: () => void;
}

export function Sidebar({ onCommandPalette }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedPages, setExpandedPages] = useState<string[]>(["Lecture Notes"]);
  const workspaceId = pathname?.match(/\/workspace\/([^/]+)/)?.[1] || "demo";

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: `/workspace/${workspaceId}` },
    { icon: Brain, label: "Study Mode", href: `/workspace/${workspaceId}/study` },
    { icon: CheckSquare, label: "Study Tasks", href: `/workspace/${workspaceId}/tasks` },
    { icon: BookOpen, label: "Courses", href: `/workspace/${workspaceId}/courses` },
    { icon: GraduationCap, label: "Exams", href: `/workspace/${workspaceId}/exams` },
    { icon: Calendar, label: "Schedule", href: `/workspace/${workspaceId}/schedule` },
    { icon: BarChart3, label: "Stats", href: `/workspace/${workspaceId}/stats` },
  ];

  const togglePage = (pageName: string) => {
    setExpandedPages((prev) => (prev.includes(pageName) ? prev.filter((p) => p !== pageName) : [...prev, pageName]));
  };

  const isActive = (href: string) => {
    if (href === `/workspace/${workspaceId}`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center shadow-lg shadow-sidebar-primary/20">
            <span className="text-base font-bold text-sidebar-primary-foreground">N</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">NOTELOFT</h1>
            <p className="text-xs text-sidebar-foreground/80">My Workspace</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-3">
        <button
          onClick={onCommandPalette}
          className="flex w-full items-center gap-2 rounded-lg border border-transparent bg-white/5 px-3 py-2.5 text-sm text-sidebar-foreground transition-all hover:border-sidebar-border hover:bg-white/10 hover:text-white"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search anything...</span>
          <kbd className="hidden rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-sidebar-foreground sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-auto px-3 py-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  active
                    ? "bg-sidebar-primary/20 text-white font-medium shadow-sm"
                    : "text-sidebar-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-sidebar-primary")} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/70">Pages</span>
          </div>

          <div className="mt-1 space-y-0.5">
            {demoPages.map((page) => (
              <div key={page.name}>
                <button
                  onClick={() => page.children && togglePage(page.name)}
                  className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-white/5 hover:text-white"
                >
                  {page.children ? (
                    expandedPages.includes(page.name) ? (
                      <ChevronDown className="h-3 w-3 text-sidebar-foreground/60" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-sidebar-foreground/60" />
                    )
                  ) : (
                    <span className="w-3" />
                  )}
                  <FileText className="h-4 w-4 text-sidebar-foreground/60" />
                  <span className="flex-1 truncate text-left">{page.name}</span>
                  {page.favorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                </button>
                {page.children && expandedPages.includes(page.name) && (
                  <div className="ml-6 space-y-0.5">
                    {page.children.map((child) => (
                      <button
                        key={child.name}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span className="truncate">{child.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={() => router.push(`/workspace/${workspaceId}/pages/new`)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Plus className="h-4 w-4" />
              <span>New page</span>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}
