"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/common/ThemeProvider";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { AppHeader } from "@/components/layout/AppHeader";
import { useSidebarPosition } from "@/components/common/UserPreferencesProvider";
import { 
  User, 
  Palette, 
  Bell, 
  Globe, 
  Shield, 
  Zap,
  Download,
  Upload,
  Trash2,
  Clock,
  Calendar,
  Languages,
  Moon,
  Sun,
  Monitor,
  X
} from "lucide-react";

interface Settings {
  appearance: {
    theme: "light" | "dark" | "system";
    compactMode: boolean;
    sidebarPosition: "left" | "right";
  };
  language: {
    interface: string;
    spellcheck: string;
    startWeekOnMonday: boolean;
    autoTimezone: boolean;
    timezone: string;
    timeFormat: "12h" | "24h";
    dateFormat: "MDY" | "DMY" | "YMD";
  };
  notifications: {
    email: boolean;
    taskReminders: boolean;
    examAlerts: boolean;
    studyStreak: boolean;
    weeklyReport: boolean;
  };
  study: {
    defaultSessionLength: number;
    autoStartTimer: boolean;
    focusMode: boolean;
    breakReminders: boolean;
    weeklyGoalHours: number;
  };
  privacy: {
    profileVisibility: "private" | "friends" | "public";
    shareProgress: boolean;
    analyticsOptIn: boolean;
  };
}

const DEFAULT_SETTINGS: Settings = {
  appearance: {
    theme: "system",
    compactMode: false,
    sidebarPosition: "left",
  },
  language: {
    interface: "English (US)",
    spellcheck: "American English",
    startWeekOnMonday: false,
    autoTimezone: true,
    timezone: "(GMT+0:00) UTC",
    timeFormat: "12h",
    dateFormat: "MDY",
  },
  notifications: {
    email: true,
    taskReminders: true,
    examAlerts: true,
    studyStreak: true,
    weeklyReport: false,
  },
  study: {
    defaultSessionLength: 25,
    autoStartTimer: false,
    focusMode: true,
    breakReminders: true,
    weeklyGoalHours: 20,
  },
  privacy: {
    profileVisibility: "private",
    shareProgress: false,
    analyticsOptIn: true,
  },
};

type SettingsCategory = "appearance" | "language" | "notifications" | "study" | "privacy" | "data";

export default function SettingsPage() {
  const { theme, setTheme: setGlobalTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("appearance");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sidebarPosition, setSidebarPosition] = useSidebarPosition();

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('noteloft-settings');
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        const merged = {
          ...DEFAULT_SETTINGS,
          ...loaded,
          appearance: { ...DEFAULT_SETTINGS.appearance, ...(loaded.appearance || {}) },
          language: { ...DEFAULT_SETTINGS.language, ...(loaded.language || {}) },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(loaded.notifications || {}) },
          study: { ...DEFAULT_SETTINGS.study, ...(loaded.study || {}) },
          privacy: { ...DEFAULT_SETTINGS.privacy, ...(loaded.privacy || {}) },
        };
        setSettings(merged);
        
        // Sync theme with ThemeProvider
        const savedTheme = merged.appearance?.theme;
        if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
          setGlobalTheme(savedTheme);
        }
        
        // Sync sidebar position
        const storedPosition = merged.appearance?.sidebarPosition;
        if (storedPosition === "left" || storedPosition === "right") {
          setSidebarPosition(storedPosition);
        }
      } catch (e) {
        // Use defaults
      }
    }
  }, [setGlobalTheme, setSidebarPosition]);

  useEffect(() => {
    setSettings((prev) => {
      if (prev.appearance.sidebarPosition === sidebarPosition) {
        return prev;
      }
      return {
        ...prev,
        appearance: {
          ...prev.appearance,
          sidebarPosition,
        },
      };
    });
  }, [sidebarPosition]);

  // Sync settings state with current theme from ThemeProvider
  useEffect(() => {
    setSettings((prev) => {
      if (prev.appearance.theme === theme) {
        return prev;
      }
      return {
        ...prev,
        appearance: {
          ...prev.appearance,
          theme,
        },
      };
    });
  }, [theme]);

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('noteloft-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const categories = [
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "language" as const, label: "Language & Region", icon: Globe },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "study" as const, label: "Study Settings", icon: Zap },
    { id: "privacy" as const, label: "Privacy & Security", icon: Shield },
    { id: "data" as const, label: "Data Management", icon: Download },
  ];

  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
      aria-label={label}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const handleExportData = () => {
    const allData = {
      settings,
      profile: localStorage.getItem('noteloft-profile'),
      courses: localStorage.getItem('noteloft-courses'),
      tasks: localStorage.getItem('noteloft-tasks'),
      exams: localStorage.getItem('noteloft-exams'),
      schedule: localStorage.getItem('noteloft-schedule'),
    };
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'noteloft-backup.json';
    link.click();
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to delete ALL data? This includes courses, tasks, exams, schedule, and all settings. This action cannot be undone.')) {
      localStorage.clear();
      alert('All data has been cleared. The app will now reload with default settings.');
      window.location.reload();
    }
  };

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex h-screen">
        {/* Settings Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 space-y-1 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white px-3">Settings</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 px-3 mt-1">
              Customize your NOTELOFT experience
            </p>
          </div>

          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-8 space-y-6">
            {/* Appearance Settings */}
            {activeCategory === "appearance" && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Appearance
                  </h1>
                  <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                    Customize how NOTELOFT looks on your device
                  </p>
                </div>

                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Theme
                      </h3>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        Choose your interface theme
                      </p>
                      <div className="flex gap-3">
                        {(['light', 'dark', 'system'] as const).map((themeOption) => (
                          <button
                            key={themeOption}
                            onClick={() => {
                              updateSetting('appearance', 'theme', themeOption);
                              setGlobalTheme(themeOption);
                            }}
                            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                              settings.appearance.theme === themeOption
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                            }`}
                          >
                            {themeOption === 'light' && <Sun className="w-6 h-6" />}
                            {themeOption === 'dark' && <Moon className="w-6 h-6" />}
                            {themeOption === 'system' && <Monitor className="w-6 h-6" />}
                            <span className="text-sm font-medium capitalize">{themeOption}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Compact Mode
                          </h3>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                            Reduce spacing and padding for a denser interface
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={settings.appearance.compactMode}
                          onChange={(val) => updateSetting('appearance', 'compactMode', val)}
                          label="Toggle compact mode"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Sidebar Position
                      </h3>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        Choose where the navigation sidebar appears
                      </p>
                      <div className="flex gap-3">
                        {(['left', 'right'] as const).map((position) => {
                          const isActive = sidebarPosition === position;
                          return (
                          <button
                            key={position}
                            onClick={() => {
                              updateSetting('appearance', 'sidebarPosition', position);
                              setSidebarPosition(position);
                            }}
                            className={`flex-1 px-6 py-3 rounded-lg border-2 font-semibold transition-all capitalize ${
                              isActive
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {position}
                          </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Language & Region Settings */}
            {activeCategory === "language" && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Language & Region
                  </h1>
                  <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                    Customize language, time, and regional preferences
                  </p>
                </div>

                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Language
                      </h3>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        Change the language used in the user interface
                      </p>
                      <select
                        id="interface-language"
                        aria-label="Interface language"
                        value={settings.language.interface}
                        onChange={(e) => updateSetting('language', 'interface', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                      >
                        <option value="English (US)">English (US)</option>
                        <option value="English (UK)">English (UK)</option>
                        <option value="Spanish">Español</option>
                        <option value="French">Français</option>
                        <option value="German">Deutsch</option>
                        <option value="Chinese">中文</option>
                        <option value="Japanese">日本語</option>
                      </select>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Start week on Monday
                          </h3>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                            This will change how all calendars in your app look
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={settings.language.startWeekOnMonday}
                          onChange={(val) => updateSetting('language', 'startWeekOnMonday', val)}
                          label="Start week on Monday"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Set timezone automatically
                          </h3>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                            Reminders and notifications are delivered based on your timezone
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={settings.language.autoTimezone}
                          onChange={(val) => updateSetting('language', 'autoTimezone', val)}
                          label="Auto-detect timezone"
                        />
                      </div>

                      {!settings.language.autoTimezone && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                            Timezone
                          </h3>
                          <select
                            id="timezone-select"
                            aria-label="Select timezone"
                            value={settings.language.timezone}
                            onChange={(e) => updateSetting('language', 'timezone', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                          >
                            <option value="(GMT+0:00) UTC">UTC</option>
                            <option value="(GMT-5:00) Eastern Time">(GMT-5:00) Eastern Time</option>
                            <option value="(GMT-6:00) Central Time">(GMT-6:00) Central Time</option>
                            <option value="(GMT-7:00) Mountain Time">(GMT-7:00) Mountain Time</option>
                            <option value="(GMT-8:00) Pacific Time">(GMT-8:00) Pacific Time</option>
                            <option value="(GMT+1:00) London">(GMT+1:00) London</option>
                            <option value="(GMT+2:00) Paris">(GMT+2:00) Paris</option>
                            <option value="(GMT+9:00) Tokyo">(GMT+9:00) Tokyo</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Time Format
                      </h3>
                      <div className="flex gap-3">
                        {(['12h', '24h'] as const).map((format) => (
                          <button
                            key={format}
                            onClick={() => updateSetting('language', 'timeFormat', format)}
                            className={`flex-1 px-6 py-3 rounded-lg border-2 font-semibold transition-all ${
                              settings.language.timeFormat === format
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {format === '12h' ? '12-hour (2:30 PM)' : '24-hour (14:30)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Date Format
                      </h3>
                      <select
                        id="date-format"
                        aria-label="Date format"
                        value={settings.language.dateFormat}
                        onChange={(e) => updateSetting('language', 'dateFormat', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                      >
                        <option value="MDY">MM/DD/YYYY (12/31/2025)</option>
                        <option value="DMY">DD/MM/YYYY (31/12/2025)</option>
                        <option value="YMD">YYYY-MM-DD (2025-12-31)</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Notification Settings */}
            {activeCategory === "notifications" && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Notifications
                  </h1>
                  <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                    Manage how and when you receive notifications
                  </p>
                </div>

                <Card className="p-6">
                  <div className="space-y-6">
                    {[
                      { key: 'email', label: 'Email Notifications', desc: 'Receive updates and summaries via email' },
                      { key: 'taskReminders', label: 'Task Reminders', desc: 'Get reminded about upcoming task deadlines' },
                      { key: 'examAlerts', label: 'Exam Alerts', desc: 'Receive alerts before exams' },
                      { key: 'studyStreak', label: 'Study Streak Notifications', desc: 'Get notified about your study streaks and milestones' },
                      { key: 'weeklyReport', label: 'Weekly Progress Report', desc: 'Receive a weekly summary of your study progress' },
                    ].map((item, index) => (
                      <div
                        key={item.key}
                        className={`flex items-center justify-between ${
                          index > 0 ? 'pt-6 border-t border-gray-200 dark:border-gray-700' : ''
                        }`}
                      >
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            {item.label}
                          </h3>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                            {item.desc}
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                          onChange={(val) => updateSetting('notifications', item.key, val)}
                          label={`Toggle ${item.label}`}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* Study Settings */}
            {activeCategory === "study" && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Study Settings
                  </h1>
                  <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                    Configure your study sessions and goals
                  </p>
                </div>

                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Default Session Length
                      </h3>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        Choose your preferred study session duration
                      </p>
                      <div className="flex gap-3">
                        {[25, 50, 90].map((minutes) => (
                          <button
                            key={minutes}
                            onClick={() => updateSetting('study', 'defaultSessionLength', minutes)}
                            className={`flex-1 px-6 py-3 rounded-lg border-2 font-semibold transition-all ${
                              settings.study.defaultSessionLength === minutes
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {minutes} min
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Weekly Study Goal (hours)
                      </label>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        Set your target study hours per week
                      </p>
                      <input
                        id="weekly-goal"
                        type="number"
                        min="1"
                        max="100"
                        aria-label="Weekly study goal hours"
                        placeholder="20"
                        value={settings.study.weeklyGoalHours}
                        onChange={(e) => updateSetting('study', 'weeklyGoalHours', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                      />
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Auto-start Timer
                          </h3>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                            Automatically start the timer when entering focus mode
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={settings.study.autoStartTimer}
                          onChange={(val) => updateSetting('study', 'autoStartTimer', val)}
                          label="Auto-start timer"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Focus Mode
                          </h3>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                            Minimize distractions during study sessions
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={settings.study.focusMode}
                          onChange={(val) => updateSetting('study', 'focusMode', val)}
                          label="Enable focus mode"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Break Reminders
                          </h3>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                            Get reminded to take breaks during long study sessions
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={settings.study.breakReminders}
                          onChange={(val) => updateSetting('study', 'breakReminders', val)}
                          label="Enable break reminders"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Privacy & Security */}
            {activeCategory === "privacy" && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Privacy & Security
                  </h1>
                  <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                    Manage your privacy and security preferences
                  </p>
                </div>

                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Profile Visibility
                      </h3>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        Control who can see your study statistics and progress
                      </p>
                      <select
                        id="profile-visibility"
                        aria-label="Profile visibility"
                        value={settings.privacy.profileVisibility}
                        onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value as any)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                      >
                        <option value="private">Private - Only me</option>
                        <option value="friends">Friends only</option>
                        <option value="public">Public - Everyone</option>
                      </select>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Share Progress with Classmates
                          </h3>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                            Allow friends to see your study progress and achievements
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={settings.privacy.shareProgress}
                          onChange={(val) => updateSetting('privacy', 'shareProgress', val)}
                          label="Share progress"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Analytics & Usage Data
                          </h3>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                            Help us improve by sharing anonymous usage data
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={settings.privacy.analyticsOptIn}
                          onChange={(val) => updateSetting('privacy', 'analyticsOptIn', val)}
                          label="Share analytics"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Data Management */}
            {activeCategory === "data" && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Data Management
                  </h1>
                  <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                    Export, import, or delete your data
                  </p>
                </div>

                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Export Your Data
                      </h3>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                        Download all your data including courses, tasks, exams, and study sessions as a JSON file
                      </p>
                      <Button variant="outline" onClick={handleExportData}>
                        <Download className="w-4 h-4 mr-2" />
                        Export All Data
                      </Button>
                    </div>

                    <div className="pt-6 border-t border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                      <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Danger Zone
                      </h3>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                        Permanently delete all your data including courses, tasks, exams, schedule, and study sessions. This action cannot be undone.
                      </p>
                      <Button variant="outline" onClick={handleClearAllData}>
                        <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                        <span className="text-red-600">Delete All Data</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
