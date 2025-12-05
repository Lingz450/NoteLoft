"use client";

/**
 * SharedWorkspaceSettings Component
 * 
 * Manage workspace sharing and members.
 */

import { useState, useEffect } from "react";
import { Users, UserPlus, Mail, Crown, Shield, User, Eye } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { Badge } from "@/components/common/Badge";

type WorkspaceMember = {
  id: string;
  email?: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  joinedAt: Date;
  lastActive: Date;
};

interface SharedWorkspaceSettingsProps {
  workspaceId: string;
}

export function SharedWorkspaceSettings({ workspaceId }: SharedWorkspaceSettingsProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceMember["role"]>("MEMBER");

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/members`);
        if (!res.ok) throw new Error("Failed to load members");
        
        const data = await res.json();
        setMembers(data);
      } catch (error) {
        console.error("Error loading members:", error);
      }
    };

    loadMembers();
  }, [workspaceId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (!res.ok) throw new Error("Failed to invite member");

      const member = await res.json();
      setMembers([...members, member]);
      setIsModalOpen(false);
      setInviteEmail("");
    } catch (error) {
      console.error("Error inviting member:", error);
    }
  };

  const getRoleIcon = (role: WorkspaceMember["role"]) => {
    switch (role) {
      case "OWNER":
        return <Crown className="w-4 h-4" />;
      case "ADMIN":
        return <Shield className="w-4 h-4" />;
      case "MEMBER":
        return <User className="w-4 h-4" />;
      case "VIEWER":
        return <Eye className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: WorkspaceMember["role"]) => {
    switch (role) {
      case "OWNER":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "ADMIN":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300";
      case "MEMBER":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
      case "VIEWER":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-bold text-gray-900 dark:text-white">Workspace Members</h3>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite
        </Button>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900 dark:text-white">
                  {member.email || "Anonymous"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Badge className={`${getRoleColor(member.role)} flex items-center gap-1`}>
              {getRoleIcon(member.role)}
              {member.role}
            </Badge>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite Member">
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@example.com"
          />

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as WorkspaceMember["role"])}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-medium"
            >
              <option value="VIEWER">Viewer - Can view only</option>
              <option value="MEMBER">Member - Can edit</option>
              <option value="ADMIN">Admin - Can manage workspace</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleInvite}>
              Send Invitation
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

