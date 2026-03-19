"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const types = [
  { value: "NOTES", label: "Notes" },
  { value: "PYQ", label: "Previous Year Questions" },
  { value: "ASSIGNMENT", label: "Assignment" },
  { value: "SYLLABUS", label: "Syllabus" },
  { value: "OTHER", label: "Other" },
];

export default function UploadResourcePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "NOTES",
    subject: "",
    semester: "",
    branch: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          semester: parseInt(formData.semester) || 1,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload resource");
      }

      router.push("/resources");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/resources">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Resource</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Share study material with your campus</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                {types.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <Input
              label="Title"
              placeholder="e.g., DBMS Complete Notes Unit 1-5"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <Textarea
              label="Description (optional)"
              placeholder="What does this resource cover?"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Input
              label="Subject"
              placeholder="e.g., Database Management Systems"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Semester"
                type="number"
                min={1}
                max={12}
                placeholder="e.g., 4"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                required
              />
              <Input
                label="Branch"
                placeholder="e.g., Computer Science"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/resources" className="flex-1">
                <Button type="button" variant="outline" className="w-full">Cancel</Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Upload
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
