/**
 * Public Page Viewer
 * 
 * Read-only view of published pages (Notion-style public pages).
 */

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

export default async function PublicPageView({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({
    where: {
      publicSlug: params.slug,
      isPublic: true,
    },
    include: {
      blocks: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            NOTELOFT
          </span>
          <div className="flex-1" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Public Page
          </span>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title & Icon */}
        <div className="mb-8">
          {page.icon && (
            <div className="text-5xl mb-4">{page.icon}</div>
          )}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {page.title}
          </h1>
          <p className="text-sm text-gray-500">
            Published {page.updatedAt.toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Created with <span className="font-bold text-blue-600">NOTELOFT</span> - Student Workspace OS
          </p>
        </div>
      </footer>
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({
    where: {
      publicSlug: params.slug,
      isPublic: true,
    },
    select: {
      title: true,
      icon: true,
    },
  });

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: `${page.icon ? page.icon + " " : ""}${page.title} | NOTELOFT`,
    description: `Public page: ${page.title}`,
  };
}

