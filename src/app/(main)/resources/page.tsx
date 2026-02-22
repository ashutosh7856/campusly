"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Upload,
  Search,
  BookOpen,
  ClipboardList,
  FileQuestion,
  File,
  Loader2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  NOTES: { label: "Notes", icon: BookOpen, color: "default" },
  PYQ: { label: "PYQ", icon: FileQuestion, color: "warning" },
  ASSIGNMENT: { label: "Assignment", icon: ClipboardList, color: "success" },
  SYLLABUS: { label: "Syllabus", icon: FileText, color: "secondary" },
  OTHER: { label: "Other", icon: File, color: "secondary" },
};

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  subject: string;
  semester: number;
  branch: string;
  downloads: number;
  createdAt: string;
  uploader: { id: string; name: string };
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeType !== "ALL") params.set("type", activeType);
      if (search) params.set("search", search);
      const res = await fetch(`/api/resources?${params}`);
      if (res.ok) setResources(await res.json());
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    } finally {
      setLoading(false);
    }
  }, [activeType, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchResources(), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchResources, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resources</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Notes, PYQs, assignments & more — shared by your campus
          </p>
        </div>
        <Link href="/resources/upload">
          <Button>
            <Upload className="h-4 w-4" />
            Upload Resource
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by subject, title, or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeType === "ALL" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setActiveType("ALL")}
          >
            All
          </Button>
          {Object.entries(typeConfig).map(([key, { label, icon: Icon }]) => (
            <Button
              key={key}
              variant={activeType === key ? "secondary" : "outline"}
              size="sm"
              onClick={() => setActiveType(key)}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && resources.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No resources yet</h3>
            <p className="text-gray-500 text-sm mb-4">Be the first to share study materials!</p>
            <Link href="/resources/upload">
              <Button>
                <Plus className="h-4 w-4" />
                Upload First Resource
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Resource Cards */}
      {!loading && resources.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {resources.map((resource) => {
            const typeInfo = typeConfig[resource.type] || typeConfig.OTHER;
            const TypeIcon = typeInfo.icon;
            return (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <TypeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Badge variant={typeInfo.color as "default" | "secondary" | "warning" | "success"}>
                        {typeInfo.label}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                      {resource.description}
                    </p>
                  )}

                  <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <p>📚 {resource.subject}</p>
                    <p>🎓 {resource.branch} · Sem {resource.semester}</p>
                    <p>👤 {resource.uploader.name}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                    <span>{resource.downloads} downloads</span>
                    <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
