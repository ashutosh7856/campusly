"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  BookOpen,
  GraduationCap,
  Calendar,
  Edit,
  LogOut,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

interface Profile {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  branch: string | null;
  year: number | null;
  avatar: string | null;
  role: string;
  college: { name: string; domain: string } | null;
  createdAt: string;
  stats: {
    posts: number;
    resources: number;
    likesReceived: number;
  };
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ name: "", bio: "", branch: "", year: "" });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setEditData({
            name: data.name || "",
            bio: data.bio || "",
            branch: data.branch || "",
            year: data.year?.toString() || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData.name,
          bio: editData.bio,
          branch: editData.branch,
          year: editData.year ? parseInt(editData.year) : undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile((prev) => prev ? { ...prev, ...updated } : prev);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">Failed to load profile. Please log in again.</p>
          <Button className="mt-4" onClick={() => signOut({ callbackUrl: "/login" })}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shrink-0">
              {getInitials(profile.name)}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <div className="space-y-3 w-full">
                  <Input
                    label="Name"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                  <Textarea
                    label="Bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    rows={2}
                    placeholder="Tell us about yourself..."
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Branch"
                      value={editData.branch}
                      onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
                    />
                    <Input
                      label="Year"
                      type="number"
                      min={1}
                      max={6}
                      value={editData.year}
                      onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.name}
                    </h1>
                    <Badge>{profile.role === "ADMIN" ? "Admin" : "Student"}</Badge>
                  </div>

                  {profile.bio && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {profile.email}
                    </span>
                    {profile.branch && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {profile.branch}
                      </span>
                    )}
                    {profile.year && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Year {profile.year}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                  </div>

                  {profile.college && (
                    <p className="text-xs text-gray-400 mt-2">
                      🏫 {profile.college.name} ({profile.college.domain})
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            {!editing && (
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.posts}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.resources}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Resources</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.likesReceived}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Likes Received</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
