"use client";

/**
 * Onboarding Page
 * 
 * First-time user setup wizard.
 */

import { useEffect, useState } from "react";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useRouter } from "next/navigation";

export default function OnboardingPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  const router = useRouter();
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    // Check if onboarding already completed
    const completed = localStorage.getItem("noteloft-onboarding-complete");
    if (completed) {
      router.push(`/workspace/${workspaceId}`);
      return;
    }

    setShowWizard(true);
  }, [workspaceId, router]);

  const handleComplete = () => {
    router.push(`/workspace/${workspaceId}`);
  };

  if (!showWizard) {
    return null;
  }

  return <OnboardingWizard workspaceId={workspaceId} onComplete={handleComplete} />;
}

