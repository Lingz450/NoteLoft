"use client";

/**
 * BlockEditor Component
 * 
 * Notion-style block-based editor using TipTap.
 * Supports slash commands, keyboard shortcuts, and autosave.
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useEffect, useState, useCallback } from "react";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  CheckSquare,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Image as ImageIcon,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Callout, getCalloutIcon, getCalloutColors, CalloutType } from "@/lib/tiptap-extensions/Callout";
import { SlashMenu } from "./SlashMenu";

interface BlockEditorProps {
  pageId: string;
  initialContent?: string;
  onSave: (content: string) => Promise<void>;
  placeholder?: string;
}

export function BlockEditor({ pageId, initialContent = "", onSave, placeholder }: BlockEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Type '/' for commands...",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Callout,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none p-8",
      },
      handleKeyDown: (view, event) => {
        // Detect slash command
        if (event.key === "/" && !showSlashMenu) {
          setShowSlashMenu(true);
          setSlashQuery("");
          return true;
        }
        
        // Close slash menu on Escape
        if (event.key === "Escape" && showSlashMenu) {
          setShowSlashMenu(false);
          return true;
        }
        
        // Bold: Cmd/Ctrl+B - TipTap StarterKit handles this automatically
        // We return false to let TipTap handle it
        
        // Italic: Cmd/Ctrl+I - TipTap StarterKit handles this automatically
        // We return false to let TipTap handle it
        
        // Additional keyboard shortcuts
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === "P") {
          event.preventDefault();
          // Quick command palette (can be extended)
          return true;
        }
        
        return false; // Let TipTap handle default shortcuts
      },
    },
    onUpdate: ({ editor }) => {
      // Detect slash in content for menu
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(Math.max(0, from - 20), from, " ");
      
      if (text.endsWith("/") && !showSlashMenu) {
        setShowSlashMenu(true);
        setSlashQuery("");
      } else if (showSlashMenu && text.includes("/")) {
        const match = text.match(/\/(\w*)$/);
        if (match) {
          setSlashQuery(match[1]);
        }
      } else if (!text.includes("/")) {
        setShowSlashMenu(false);
      }
    },
  });

  const content = editor?.getHTML() || "";
  const debouncedContent = useDebounce(content, 1000); // Autosave after 1s of no typing

  // Autosave
  useEffect(() => {
    if (!debouncedContent || debouncedContent === initialContent) return;

    const save = async () => {
      setIsSaving(true);
      try {
        await onSave(debouncedContent);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setIsSaving(false);
      }
    };

    save();
  }, [debouncedContent]);

  if (!editor) {
    return <div className="p-8 text-gray-400">Loading editor...</div>;
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title={`Bold (${typeof window !== "undefined" && /Mac|iPhone|iPod|iPad/i.test(navigator.platform) ? "Cmd" : "Ctrl"}+B)`}
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title={`Italic (${typeof window !== "undefined" && /Mac|iPhone|iPod|iPad/i.test(navigator.platform) ? "Cmd" : "Ctrl"}+I)`}
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("heading", { level: 1 }) ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("heading", { level: 2 }) ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("heading", { level: 3 }) ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("taskList") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Todo List"
        >
          <CheckSquare className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("codeBlock") ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Divider"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

        {/* Callout Buttons */}
        <button
          onClick={() => (editor.chain().focus() as any).setCallout("info").run()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Info Callout"
        >
          <Info className="w-4 h-4" />
        </button>
        <button
          onClick={() => (editor.chain().focus() as any).setCallout("warning").run()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Warning Callout"
        >
          <AlertCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => (editor.chain().focus() as any).setCallout("success").run()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Success Callout"
        >
          <CheckCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => (editor.chain().focus() as any).setCallout("tip").run()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Tip Callout"
        >
          <Lightbulb className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        {/* Save Status */}
        <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
          {isSaving ? (
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : lastSaved ? (
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          ) : (
            <span>Type to start</span>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} className="min-h-[600px]" />
        
        {/* Slash Menu */}
        {showSlashMenu && editor && (
          <div className="absolute z-50" style={{ 
            top: editor.view.coordsAtPos(editor.state.selection.from)?.top || 0, 
            left: 20 
          }}>
            <SlashMenu 
              editor={editor} 
              query={slashQuery}
              onSelect={() => {
                setShowSlashMenu(false);
                setSlashQuery("");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

