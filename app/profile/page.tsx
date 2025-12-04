"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { AppHeader } from "@/components/layout/AppHeader";
import { User, Mail, Calendar, Award, Settings, Save, X, Bell, Shield, Palette, Download, Upload, Trash2, Eye, EyeOff, Globe, Clock } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  university: string;
  major: string;
  year: string;
  studentId: string;
  bio: string;
  avatar: string;
  preferences: {
    theme: "light" | "dark" | "system";
    studyReminders: boolean;
    weeklyGoalHours: number;
    language: string;
    timezone: string;
    emailNotifications: boolean;
    taskReminders: boolean;
    examAlerts: boolean;
  };
  achievements: {
    totalStudyHours: number;
    longestStreak: number;
    coursesCompleted: number;
    tasksCompleted: number;
  };
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Student",
  email: "student@university.edu",
  university: "University",
  major: "Computer Science",
  year: "Junior",
  studentId: "STU123456",
  bio: "Passionate learner pursuing excellence in academics.",
  avatar: "",
  preferences: {
    theme: "system",
    studyReminders: true,
    weeklyGoalHours: 20,
    language: "English",
    timezone: "UTC",
    emailNotifications: true,
    taskReminders: true,
    examAlerts: true,
  },
  achievements: {
    totalStudyHours: 142,
    longestStreak: 7,
    coursesCompleted: 2,
    tasksCompleted: 34,
  },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Load profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('noteloft-profile');
    if (saved) {
      try {
        const loadedProfile = JSON.parse(saved);
        // Merge with defaults to ensure all fields exist
        const mergedProfile = {
          ...DEFAULT_PROFILE,
          ...loadedProfile,
          preferences: {
            ...DEFAULT_PROFILE.preferences,
            ...(loadedProfile.preferences || {}),
          },
          achievements: {
            ...DEFAULT_PROFILE.achievements,
            ...(loadedProfile.achievements || {}),
          },
        };
        setProfile(mergedProfile);
        setEditedProfile(mergedProfile);
      } catch (e) {
        // Use default
      }
    }
  }, []);

  const handleSave = () => {
    setProfile(editedProfile);
    localStorage.setItem('noteloft-profile', JSON.stringify(editedProfile));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'noteloft-profile.json';
    link.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setProfile(imported);
          setEditedProfile(imported);
          localStorage.setItem('noteloft-profile', JSON.stringify(imported));
          alert('Profile data imported successfully!');
        } catch (error) {
          alert('Failed to import profile data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      localStorage.clear();
      alert('All data has been cleared. The app will now reload.');
      window.location.reload();
    }
  };

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="mt-1 text-base font-medium text-gray-600 dark:text-gray-400">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              
              {/* Basic Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {profile.email}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary">{profile.year}</Badge>
                  <Badge variant="outline">{profile.major}</Badge>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
            </div>
          )}
        </Card>

        {/* Personal Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <Input
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profile.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                University
              </label>
              {isEditing ? (
                <Input
                  value={editedProfile.university}
                  onChange={(e) => setEditedProfile({ ...editedProfile, university: e.target.value })}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profile.university}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Student ID
              </label>
              {isEditing ? (
                <Input
                  value={editedProfile.studentId}
                  onChange={(e) => setEditedProfile({ ...editedProfile, studentId: e.target.value })}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profile.studentId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Major
              </label>
              {isEditing ? (
                <Input
                  value={editedProfile.major}
                  onChange={(e) => setEditedProfile({ ...editedProfile, major: e.target.value })}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profile.major}</p>
              )}
            </div>

            <div>
              <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Academic Year
              </label>
              {isEditing ? (
                <select
                  id="year-select"
                  value={editedProfile.year}
                  onChange={(e) => setEditedProfile({ ...editedProfile, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              ) : (
                <p className="text-gray-900 dark:text-white">{profile.year}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={editedProfile.bio}
                onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{profile.bio}</p>
            )}
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Award className="w-5 h-5" />
            Achievements & Milestones
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.achievements.totalStudyHours}h
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Study Time</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.achievements.longestStreak}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Day Streak</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.achievements.coursesCompleted}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Courses Done</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.achievements.tasksCompleted}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tasks Completed</p>
            </div>
          </div>
        </Card>

        {/* Appearance & Preferences */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5" />
            Appearance & Preferences
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  {(['light', 'dark', 'system'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setEditedProfile({
                        ...editedProfile,
                        preferences: { ...editedProfile.preferences, theme }
                      })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all capitalize ${
                        editedProfile.preferences.theme === theme
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                          : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900 dark:text-white capitalize">
                  {profile.preferences.theme}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                {isEditing ? (
                  <select
                    id="language-select"
                    value={editedProfile.preferences.language}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      preferences: { ...editedProfile.preferences, language: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.preferences.language}</p>
                )}
              </div>

              <div>
                <label htmlFor="timezone-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone
                </label>
                {isEditing ? (
                  <select
                    id="timezone-select"
                    value={editedProfile.preferences.timezone}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      preferences: { ...editedProfile.preferences, timezone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.preferences.timezone}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Study Preferences */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Award className="w-5 h-5" />
            Study Goals
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weekly Study Goal (hours)
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={editedProfile.preferences.weeklyGoalHours}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    preferences: {
                      ...editedProfile.preferences,
                      weeklyGoalHours: parseInt(e.target.value) || 0
                    }
                  })}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {profile.preferences.weeklyGoalHours} hours per week
                </p>
              )}
            </div>

          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5" />
            Notification Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Notifications
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive updates via email
                </p>
              </div>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={editedProfile.preferences.emailNotifications}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    preferences: { ...editedProfile.preferences, emailNotifications: e.target.checked }
                  })}
                  className="w-5 h-5 text-blue-600 rounded"
                  aria-label="Enable email notifications"
                />
              ) : (
                <Badge variant={profile.preferences.emailNotifications ? "default" : "secondary"}>
                  {profile.preferences.emailNotifications ? "On" : "Off"}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Task Reminders
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Get reminded about upcoming task deadlines
                </p>
              </div>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={editedProfile.preferences.taskReminders}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    preferences: { ...editedProfile.preferences, taskReminders: e.target.checked }
                  })}
                  className="w-5 h-5 text-blue-600 rounded"
                  aria-label="Enable task reminders"
                />
              ) : (
                <Badge variant={profile.preferences.taskReminders ? "default" : "secondary"}>
                  {profile.preferences.taskReminders ? "On" : "Off"}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exam Alerts
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive alerts before exams
                </p>
              </div>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={editedProfile.preferences.examAlerts}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    preferences: { ...editedProfile.preferences, examAlerts: e.target.checked }
                  })}
                  className="w-5 h-5 text-blue-600 rounded"
                  aria-label="Enable exam alerts"
                />
              ) : (
                <Badge variant={profile.preferences.examAlerts ? "default" : "secondary"}>
                  {profile.preferences.examAlerts ? "On" : "Off"}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5" />
            Data Management
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Your Data
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Download all your profile data as a JSON file
              </p>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export Profile Data
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Import Data
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Restore your profile from a backup file
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Profile Data
                  </span>
                </Button>
              </label>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                Danger Zone
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Permanently delete all your data. This action cannot be undone.
              </p>
              <Button variant="outline" size="sm" onClick={handleDeleteAccount}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}

        {/* Notifications */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5" />
            Notification Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Notifications
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive updates via email
                </p>
              </div>
              <button
                onClick={() => {
                  const updated = {
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      emailNotifications: !profile.preferences.emailNotifications
                    }
                  };
                  setProfile(updated);
                  setEditedProfile(updated);
                  localStorage.setItem('noteloft-profile', JSON.stringify(updated));
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profile.preferences.emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label="Toggle email notifications"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile.preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Task Reminders
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Get reminded about upcoming deadlines
                </p>
              </div>
              <button
                onClick={() => {
                  const updated = {
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      taskReminders: !profile.preferences.taskReminders
                    }
                  };
                  setProfile(updated);
                  setEditedProfile(updated);
                  localStorage.setItem('noteloft-profile', JSON.stringify(updated));
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profile.preferences.taskReminders ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label="Toggle task reminders"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile.preferences.taskReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exam Alerts
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive alerts before exams
                </p>
              </div>
              <button
                onClick={() => {
                  const updated = {
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      examAlerts: !profile.preferences.examAlerts
                    }
                  };
                  setProfile(updated);
                  setEditedProfile(updated);
                  localStorage.setItem('noteloft-profile', JSON.stringify(updated));
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profile.preferences.examAlerts ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label="Toggle exam alerts"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile.preferences.examAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>


        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  Completed study session for MATH 2051
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  Marked task as complete
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  Added new course: Data Structures
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>
        </div>
      </div>
    </>
  );
}
