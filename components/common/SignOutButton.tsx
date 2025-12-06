"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "./Button";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  );
}





