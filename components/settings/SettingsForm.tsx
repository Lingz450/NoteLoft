"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useToast } from "@/components/common/ToastProvider";

export function SettingsForm() {
  const toast = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notifications, setNotifications] = useState(true);
  const [autoSummaries, setAutoSummaries] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = (localStorage.getItem("noteloft-theme") as "light" | "dark" | null) ?? "light";
    setTheme(storedTheme);
    setNotifications(localStorage.getItem("noteloft-notifications") !== "false");
    setAutoSummaries(localStorage.getItem("noteloft-auto-summaries") === "true");
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      localStorage.setItem("noteloft-theme", theme);
      localStorage.setItem("noteloft-notifications", String(notifications));
      localStorage.setItem("noteloft-auto-summaries", String(autoSummaries));
      toast.push({ title: "Settings saved", variant: "success" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Theme</p>
            <p className="text-sm text-[var(--muted)]">Switch between light and dark.</p>
          </div>
          <select
            className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
            value={theme}
            onChange={(e) => setTheme(e.target.value as "light" | "dark")}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </Card>
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Notifications</p>
            <p className="text-sm text-[var(--muted)]">Email reminders for upcoming tasks and exams.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
            Enabled
          </label>
        </div>
      </Card>
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Auto summaries</p>
            <p className="text-sm text-[var(--muted)]">Let AI automatically summarise new study sessions.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={autoSummaries} onChange={(e) => setAutoSummaries(e.target.checked)} />
            Enabled
          </label>
        </div>
      </Card>
      <Button type="button" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save preferences"}
      </Button>
    </div>
  );
}
