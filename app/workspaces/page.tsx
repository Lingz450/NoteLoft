"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useToast } from "@/components/common/ToastProvider";

type Workspace = {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    courses: number;
    tasks: number;
    pages: number;
  };
};

export default function WorkspacesPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/workspaces");
        if (!res.ok) throw new Error("Failed to load workspaces");
        setWorkspaces(await res.json());
      } catch (err) {
        console.error(err);
        setError("Unable to load workspaces.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function createWorkspace() {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create workspace.");
        toast.push({ title: "Workspace creation failed", variant: "error" });
        return;
      }
      setWorkspaces((prev) => [data, ...prev]);
      setName("");
      toast.push({ title: "Workspace created", variant: "success" });
    } catch {
      setError("Failed to create workspace.");
      toast.push({ title: "Workspace creation failed", variant: "error" });
    } finally {
      setCreating(false);
    }
  }

  async function deleteWorkspace(id: string) {
    if (!confirm("Delete this workspace?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/workspaces/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      toast.push({ title: "Workspace deleted", variant: "success" });
    } catch {
      setError("Failed to delete workspace.");
      toast.push({ title: "Failed to delete workspace", variant: "error" });
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading workspaces...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Select a workspace</h1>
          <p className="text-sm text-[var(--muted)]">Spin up as many demo semesters as you need.</p>
        </div>

        <Card className="p-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input placeholder="Workspace name" value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="button" onClick={createWorkspace} disabled={creating}>
              {creating ? "Creating..." : "Create workspace"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </Card>

        {workspaces.length === 0 ? (
          <Card className="p-6 text-center text-sm text-[var(--muted)]">No workspaces yet.</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {workspaces.map((workspace) => (
              <Card key={workspace.id} className="space-y-2 border border-[var(--border)] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{workspace.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      Created {new Date(workspace.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteWorkspace(workspace.id)}
                    disabled={deletingId === workspace.id}
                  >
                    {deletingId === workspace.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
                <div className="grid grid-cols-3 text-center text-xs">
                  <div>
                    <p className="font-semibold">{workspace._count?.courses ?? 0}</p>
                    <p className="text-[var(--muted)]">Courses</p>
                  </div>
                  <div>
                    <p className="font-semibold">{workspace._count?.tasks ?? 0}</p>
                    <p className="text-[var(--muted)]">Tasks</p>
                  </div>
                  <div>
                    <p className="font-semibold">{workspace._count?.pages ?? 0}</p>
                    <p className="text-[var(--muted)]">Pages</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => router.push(`/workspace/${workspace.id}`)}>
                  Open workspace
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
