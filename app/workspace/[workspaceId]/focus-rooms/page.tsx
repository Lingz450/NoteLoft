"use client";

/**
 * Focus Rooms Page
 * 
 * Browse and join shared focus sessions.
 */

import { useState } from "react";
import { Plus, Users, Clock, User as UserIcon } from "lucide-react";
import { useFocusRooms } from "@/lib/hooks/useFocusRoom";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import Link from "next/link";

export default function FocusRoomsPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  const { list, create } = useFocusRooms();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [duration, setDuration] = useState(50);

  const rooms = list.data || [];
  const activeRooms = rooms.filter((r: any) => r.status === "ACTIVE");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ name: roomName, duration });
    setIsModalOpen(false);
    setRoomName("");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Focus Rooms</h1>
          </div>
          <p className="text-base font-medium text-gray-600 dark:text-gray-400 mt-1">
            Study together with classmates in shared focus sessions
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Room
        </Button>
      </div>

      {/* Active Rooms Grid */}
      {activeRooms.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRooms.map((room: any) => (
            <Link key={room.id} href={`/workspace/${workspaceId}/focus-rooms/${room.id}`}>
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white">{room.name}</h3>
                    <Badge className="bg-green-100 text-green-700 font-semibold">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{room.timerDuration} min timer</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {room.participants?.length || 0} studying now
                    </span>
                  </div>

                  {/* Participant Avatars Preview */}
                  {room.participants && room.participants.length > 0 && (
                    <div className="flex -space-x-2">
                      {room.participants.slice(0, 5).map((p: any, i: number) => (
                        <div
                          key={p.id}
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: p.avatarColor }}
                          title={p.displayName}
                        >
                          {p.displayName.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {room.participants.length > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                          +{room.participants.length - 5}
                        </div>
                      )}
                    </div>
                  )}

                  <Button className="w-full" size="sm">
                    Join Room →
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Active Rooms</h3>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6">
            Create the first focus room and invite classmates to study together!
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Create First Room
          </Button>
        </Card>
      )}

      {/* Create Room Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Focus Room">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              Room Name
            </label>
            <Input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Morning Study Squad"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              Session Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[25, 50, 90].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                    duration === mins
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create Room"}
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

