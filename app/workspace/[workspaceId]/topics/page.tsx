"use client";

/**
 * Topics Page
 * 
 * Knowledge graph - manage topics and their relationships.
 */

import { useState } from "react";
import { Plus, Network, Circle } from "lucide-react";
import { useTopics } from "@/lib/hooks/useTopics";
import { useCourses } from "@/lib/hooks/useCourses";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";

export default function TopicsPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  const { list, create } = useTopics(workspaceId);
  const { list: coursesQuery } = useCourses(workspaceId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    courseId: "",
    color: "#6366F1",
  });

  const topics = list.data || [];
  const courses = coursesQuery.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await create.mutateAsync({
      workspaceId,
      name: formData.name,
      description: formData.description || undefined,
      courseId: formData.courseId || undefined,
      color: formData.color,
    });

    setIsModalOpen(false);
    setFormData({ name: "", description: "", courseId: "", color: "#6366F1" });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Network className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Graph</h1>
          </div>
          <p className="text-base font-medium text-gray-600 dark:text-gray-400 mt-1">
            Organize concepts and track understanding across your courses
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Topic
        </Button>
      </div>

      {/* Topics Grid */}
      {topics.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic: any) => {
            const course = courses.find(c => c.id === topic.courseId);
            
            return (
              <Card key={topic.id} className="p-5 hover:shadow-lg transition-all cursor-pointer">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: topic.color }}
                      />
                      <h3 className="font-bold text-gray-900 dark:text-white">{topic.name}</h3>
                    </div>
                    <Circle className="w-8 h-8 text-gray-300" />
                  </div>

                  {topic.description && (
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {topic.description}
                    </p>
                  )}

                  {course && (
                    <Badge className="font-semibold">{course.code}</Badge>
                  )}

                  {/* Placeholder for progress */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-bold text-gray-900 dark:text-white">--</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Network className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Topics Yet</h3>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6">
            Build your knowledge graph by creating topics for concepts you're learning
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Create First Topic
          </Button>
        </Card>
      )}

      {/* Create Topic Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Topic">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Topic Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Vector Spaces"
            required
          />

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key concepts and theorems..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-medium text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Course (optional)</label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-medium"
            >
              <option value="">No course (general)</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Color</label>
            <div className="flex gap-2">
              {["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? "border-gray-900 dark:border-white scale-110"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create Topic"}
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

