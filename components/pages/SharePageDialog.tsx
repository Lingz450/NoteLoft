"use client";

/**
 * SharePageDialog Component
 * 
 * Toggle public sharing for a page and copy public link.
 */

import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Globe, Copy, Check } from "lucide-react";

interface SharePageDialogProps {
  pageId: string;
  isPublic: boolean;
  publicSlug?: string | null;
  onUpdate: (isPublic: boolean, publicSlug?: string) => void;
}

export function SharePageDialog({ pageId, isPublic: initialIsPublic, publicSlug: initialSlug, onUpdate }: SharePageDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [publicSlug, setPublicSlug] = useState(initialSlug || "");
  const [copied, setCopied] = useState(false);

  const publicUrl = typeof window !== "undefined" && publicSlug
    ? `${window.location.origin}/p/${publicSlug}`
    : "";

  const handleToggle = async () => {
    const newIsPublic = !isPublic;
    
    // Generate slug if enabling public access for the first time
    let slug = publicSlug;
    if (newIsPublic && !slug) {
      slug = Math.random().toString(36).substring(2, 10);
      setPublicSlug(slug);
    }

    setIsPublic(newIsPublic);
    onUpdate(newIsPublic, slug);
  };

  const handleCopy = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Globe className="w-4 h-4" />
        Share
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Share Page">
        <div className="space-y-4">
          {/* Toggle Public Access */}
          <div className="flex items-start justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-bold text-gray-900 dark:text-white">
                  Publish to web
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isPublic
                  ? "This page is live on the web. Anyone with the link can view it."
                  : "Make this page publicly accessible with a shareable link."}
              </p>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPublic ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  isPublic ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Public Link */}
          {isPublic && publicUrl && (
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                Public Link
              </label>
              <div className="flex gap-2">
                <Input
                  value={publicUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button onClick={handleCopy} variant="outline">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Share this link with anyone. No login required.
              </p>
            </div>
          )}

          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            className="w-full"
          >
            Done
          </Button>
        </div>
      </Modal>
    </>
  );
}

