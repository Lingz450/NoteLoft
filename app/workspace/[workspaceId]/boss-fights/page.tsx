"use client";

/**
 * Boss Fights Page
 * 
 * View all active boss fights (gamified exam prep).
 */

import { useState } from "react";
import { useBossFights } from "@/lib/hooks/useBossFight";
import { useExams } from "@/lib/hooks/useExams";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { BossHealthBar } from "@/components/boss-fights/BossHealthBar";
import { Swords, Plus, Trophy, Skull, Shield } from "lucide-react";
import { BOSS_DIFFICULTY_VALUES, type BossDifficulty } from "@/lib/constants/enums";
import Link from "next/link";

export default function BossFightsPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  const { list: bossList, create } = useBossFights(workspaceId);
  const { list: examsQuery } = useExams(workspaceId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<BossDifficulty>("NORMAL");

  const bosses = bossList.data || [];
  const exams = examsQuery.data || [];
  const examsWithoutBoss = exams.filter(e => !bosses.some((b: { examId: string }) => b.examId === e.id));

  const handleCreateBoss = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      examId: selectedExamId,
      difficulty: selectedDifficulty,
    });
    setIsModalOpen(false);
  };

  const activeBosses = bosses.filter((b: { status: string }) => b.status === "ALIVE");
  const defeatedBosses = bosses.filter((b: { status: string }) => b.status === "DEFEATED");
  const escapedBosses = bosses.filter((b: { status: string }) => b.status === "ESCAPED");

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Swords className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Boss Fight Arena</h1>
          </div>
          <p className="text-base font-medium text-gray-600 dark:text-gray-400 mt-1">
            Defeat exam bosses through consistent study sessions
          </p>
        </div>
        {examsWithoutBoss.length > 0 && (
          <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Boss Fight
          </Button>
        )}
      </div>

      {/* Active Boss Fights */}
      {activeBosses.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Active Fights ({activeBosses.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {activeBosses.map((boss: { id: string; name: string; currentHP: number; maxHP: number; status: string; difficulty: string; exam?: { date: string } }) => {
              const exam = boss.exam;
              return (
                <Link key={boss.id} href={`/workspace/${workspaceId}/boss-fights/${boss.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
                    <BossHealthBar
                      name={boss.name}
                      currentHP={boss.currentHP}
                      maxHP={boss.maxHP}
                      status={boss.status}
                      difficulty={boss.difficulty}
                    />
                    {exam && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Exam: {new Date(exam.date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Defeated Bosses */}
      {defeatedBosses.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-600" />
            Defeated ({defeatedBosses.length})
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {defeatedBosses.map((boss: { id: string; name: string }) => (
              <Card key={boss.id} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-gray-900 dark:text-white">{boss.name}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Victory! ✨</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bosses.length === 0 && (
        <Card className="p-12 text-center">
          <Swords className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Boss Fights Yet</h3>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6">
            Turn your exams into epic battles! Create a boss fight to gamify your exam prep.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Boss
          </Button>
        </Card>
      )}

      {/* Create Boss Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Boss Fight">
        <form onSubmit={handleCreateBoss} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Select Exam</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-medium"
              required
            >
              <option value="">Choose an exam...</option>
              {examsWithoutBoss.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} - {new Date(exam.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Boss Difficulty</label>
            <div className="grid grid-cols-2 gap-2">
              {BOSS_DIFFICULTY_VALUES.map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                    selectedDifficulty === diff
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">
              Higher difficulty = More HP, harder to defeat
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={create.isPending}>
              {create.isPending ? "Creating Boss..." : "Start Boss Fight"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

