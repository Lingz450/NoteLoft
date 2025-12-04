"use client";

import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/ToastProvider";

type Props = {
  initialName: string;
  initialEmail: string;
};

export function ProfileForm({ initialName, initialEmail }: Props) {
  const toast = useToast();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to update profile.");
        toast.push({ title: "Profile update failed", variant: "error" });
        return;
      }
      toast.push({ title: "Profile updated", variant: "success" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
