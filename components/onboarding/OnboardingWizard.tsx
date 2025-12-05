"use client";

/**
 * OnboardingWizard Component
 * 
 * 3-step guided setup for new users.
 */

import { useState } from "react";
import { Calendar, GraduationCap, ClipboardList, CheckCircle } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";

interface OnboardingWizardProps {
  workspaceId: string;
  onComplete: () => void;
}

export function OnboardingWizard({ workspaceId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    semesterStart: "",
    semesterEnd: "",
    courses: [] as Array<{ name: string; code: string }>,
    firstExam: { title: "", date: "", course: "" },
    firstTask: { title: "", dueDate: "", course: "" },
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // Save onboarding data
    try {
      // Create courses
      for (const course of formData.courses) {
        await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            name: course.name,
            code: course.code,
            semesterName: "Fall 2025",
          }),
        });
      }

      // Mark onboarding as complete
      localStorage.setItem("noteloft-onboarding-complete", "true");
      onComplete();
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const addCourse = () => {
    setFormData({
      ...formData,
      courses: [...formData.courses, { name: "", code: "" }],
    });
  };

  const updateCourse = (index: number, field: string, value: string) => {
    const updated = [...formData.courses];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, courses: updated });
  };

  return (
    <Modal isOpen={true} onClose={() => {}} title="" className="max-w-2xl">
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  s === step
                    ? "bg-blue-600 text-white scale-110"
                    : s < step
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                }`}
              >
                {s < step ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 ${
                    s < step ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Semester Dates */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Set Your Semester Dates
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                When does your semester start and end?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Semester Start
                </label>
                <Input
                  type="date"
                  value={formData.semesterStart}
                  onChange={(e) =>
                    setFormData({ ...formData, semesterStart: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Semester End
                </label>
                <Input
                  type="date"
                  value={formData.semesterEnd}
                  onChange={(e) =>
                    setFormData({ ...formData, semesterEnd: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Add Courses */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Add Your Courses
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Add at least one course to get started
              </p>
            </div>

            <div className="space-y-3">
              {formData.courses.map((course, index) => (
                <div key={index} className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Course Code (e.g., CS 201)"
                    value={course.code}
                    onChange={(e) => updateCourse(index, "code", e.target.value)}
                  />
                  <Input
                    placeholder="Course Name"
                    value={course.name}
                    onChange={(e) => updateCourse(index, "name", e.target.value)}
                  />
                </div>
              ))}
              <Button variant="outline" onClick={addCourse} className="w-full">
                + Add Another Course
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: First Exam/Assignment */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Add Your First Exam or Assignment
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Optional, but helps us personalize your experience
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Exam Title
                </label>
                <Input
                  placeholder="Midterm Exam"
                  value={formData.firstExam.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      firstExam: { ...formData.firstExam, title: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Exam Date
                </label>
                <Input
                  type="date"
                  value={formData.firstExam.date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      firstExam: { ...formData.firstExam, date: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
          >
            Back
          </Button>
          <Button onClick={handleNext} className="min-w-[120px]">
            {step === 3 ? "Get Started!" : "Next"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

