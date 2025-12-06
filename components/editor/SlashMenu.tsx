"use client";

/**
 * SlashMenu Component
 * 
 * Enhanced slash command menu with all block types and shortcuts.
 */

import { Editor } from "@tiptap/react";
import {
  FileText,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Image,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Link2,
  Table,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";

type SlashCommand = {
  title: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
  action: (editor: Editor) => void;
  shortcut?: string;
};

interface SlashMenuProps {
  editor: Editor;
  onSelect: () => void;
  query?: string;
}

export function SlashMenu({ editor, onSelect, query = "" }: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: SlashCommand[] = [
    {
      title: "Text",
      description: "Start writing with plain text",
      icon: <FileText className="w-4 h-4" />,
      keywords: ["text", "paragraph", "p"],
      action: (editor) => {
        editor.chain().focus().setParagraph().run();
      },
    },
    {
      title: "Heading 1",
      description: "Big section heading",
      icon: <Heading1 className="w-4 h-4" />,
      keywords: ["h1", "heading1", "title"],
      action: (editor) => {
        editor.chain().focus().toggleHeading({ level: 1 }).run();
      },
      shortcut: "#",
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      icon: <Heading2 className="w-4 h-4" />,
      keywords: ["h2", "heading2", "subtitle"],
      action: (editor) => {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
      },
      shortcut: "##",
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      icon: <Heading3 className="w-4 h-4" />,
      keywords: ["h3", "heading3"],
      action: (editor) => {
        editor.chain().focus().toggleHeading({ level: 3 }).run();
      },
      shortcut: "###",
    },
    {
      title: "Bullet List",
      description: "Create a simple bulleted list",
      icon: <List className="w-4 h-4" />,
      keywords: ["bullet", "ul", "unordered"],
      action: (editor) => {
        editor.chain().focus().toggleBulletList().run();
      },
      shortcut: "-",
    },
    {
      title: "Numbered List",
      description: "Create a numbered list",
      icon: <ListOrdered className="w-4 h-4" />,
      keywords: ["number", "ol", "ordered"],
      action: (editor) => {
        editor.chain().focus().toggleOrderedList().run();
      },
      shortcut: "1.",
    },
    {
      title: "Todo List",
      description: "Track tasks with a to-do list",
      icon: <CheckSquare className="w-4 h-4" />,
      keywords: ["todo", "task", "checkbox", "checklist"],
      action: (editor) => {
        editor.chain().focus().toggleTaskList().run();
      },
      shortcut: "[]",
    },
    {
      title: "Quote",
      description: "Capture a quote",
      icon: <Quote className="w-4 h-4" />,
      keywords: ["quote", "blockquote"],
      action: (editor) => {
        editor.chain().focus().toggleBlockquote().run();
      },
      shortcut: ">",
    },
    {
      title: "Code Block",
      description: "Code with syntax highlighting",
      icon: <Code className="w-4 h-4" />,
      keywords: ["code", "snippet"],
      action: (editor) => {
        editor.chain().focus().toggleCodeBlock().run();
      },
      shortcut: "```",
    },
    {
      title: "Divider",
      description: "Visually divide blocks",
      icon: <Minus className="w-4 h-4" />,
      keywords: ["divider", "hr", "line"],
      action: (editor) => {
        editor.chain().focus().setHorizontalRule().run();
      },
      shortcut: "---",
    },
    {
      title: "Info Callout",
      description: "Highlight important information",
      icon: <Info className="w-4 h-4" />,
      keywords: ["info", "callout", "note"],
      action: (editor) => {
        (editor.chain().focus() as any).setCallout("info").run();
      },
    },
    {
      title: "Warning Callout",
      description: "Warn about something",
      icon: <AlertCircle className="w-4 h-4" />,
      keywords: ["warning", "alert", "caution"],
      action: (editor) => {
        (editor.chain().focus() as any).setCallout("warning").run();
      },
    },
    {
      title: "Success Callout",
      description: "Show success or completion",
      icon: <CheckCircle className="w-4 h-4" />,
      keywords: ["success", "done", "complete"],
      action: (editor) => {
        (editor.chain().focus() as any).setCallout("success").run();
      },
    },
    {
      title: "Tip Callout",
      description: "Share a helpful tip",
      icon: <Lightbulb className="w-4 h-4" />,
      keywords: ["tip", "hint", "help"],
      action: (editor) => {
        (editor.chain().focus() as any).setCallout("tip").run();
      },
    },
    {
      title: "Error Callout",
      description: "Highlight an error",
      icon: <XCircle className="w-4 h-4" />,
      keywords: ["error", "danger", "problem"],
      action: (editor) => {
        (editor.chain().focus() as any).setCallout("error").run();
      },
    },
    {
      title: "Image",
      description: "Upload or embed an image",
      icon: <Image className="w-4 h-4" />,
      keywords: ["image", "img", "picture", "photo"],
      action: (editor) => {
        // TODO: Implement image upload
        editor.chain().focus().insertContent("<p>Image placeholder</p>").run();
      },
    },
    {
      title: "Link",
      description: "Add a link",
      icon: <Link2 className="w-4 h-4" />,
      keywords: ["link", "url", "href"],
      action: (editor) => {
        const url = window.prompt("Enter URL:");
        if (url) {
          (editor.chain().focus() as any).setLink({ href: url }).run();
        }
      },
    },
  ];

  // Filter commands based on query
  const filteredCommands = query
    ? commands.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(query.toLowerCase()) ||
          cmd.keywords.some((kw) => kw.toLowerCase().includes(query.toLowerCase()))
      )
    : commands;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        filteredCommands[selectedIndex]?.action(editor);
        onSelect();
      } else if (e.key === "Escape") {
        onSelect();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredCommands, selectedIndex, editor, onSelect]);

  if (filteredCommands.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-50 w-64 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
      <div className="p-2 border-b border-gray-200 dark:border-gray-800">
        <p className="text-xs font-bold uppercase text-gray-500 px-2">Commands</p>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {filteredCommands.map((command, index) => (
          <button
            key={command.title}
            onClick={() => {
              command.action(editor);
              onSelect();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
              index === selectedIndex
                ? "bg-blue-50 dark:bg-blue-900/20"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <div className="text-gray-600 dark:text-gray-400">{command.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-900 dark:text-white">
                {command.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {command.description}
              </div>
            </div>
            {command.shortcut && (
              <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
                {command.shortcut}
              </kbd>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
