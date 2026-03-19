"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Heart,
  Share2,
  Plus,
  Filter,
  Megaphone,
  MessageSquare,
  ShoppingBag,
  HelpCircle,
  MapPin,
  Loader2,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ANNOUNCEMENT: { label: "Announcement", color: "default", icon: Megaphone },
  DISCUSSION: { label: "Discussion", color: "secondary", icon: MessageSquare },
  LOST_FOUND: { label: "Lost & Found", color: "warning", icon: MapPin },
  BUYING_SELLING: { label: "Buy/Sell", color: "success", icon: ShoppingBag },
  HELP: { label: "Help", color: "destructive", icon: HelpCircle },
  GENERAL: { label: "General", color: "secondary", icon: MessageSquare },
};

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  author: { id: string; name: string; branch: string | null; avatar: string | null };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; avatar: string | null; branch: string | null };
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const url = activeCategory === "ALL" ? "/api/posts" : `/api/posts?category=${activeCategory}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function toggleLike(postId: string) {
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    if (res.ok) {
      const { liked } = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: liked, likesCount: liked ? p.likesCount + 1 : p.likesCount - 1 }
            : p
        )
      );
    }
  }

  async function loadComments(postId: string) {
    if (expandedComments === postId) {
      setExpandedComments(null);
      return;
    }
    setExpandedComments(postId);
    const res = await fetch(`/api/posts/${postId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => ({ ...prev, [postId]: data }));
    }
  }

  async function submitComment(postId: string) {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => ({
          ...prev,
          [postId]: [newComment, ...(prev[postId] || [])],
        }));
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
        );
        setCommentText("");
      }
    } finally {
      setSubmittingComment(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Feed</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Stay updated with everything happening on campus
          </p>
        </div>
        <Link href="/feed/create">
          <Button>
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={activeCategory === "ALL" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setActiveCategory("ALL")}
        >
          <Filter className="h-3.5 w-3.5" />
          All
        </Button>
        {Object.entries(categoryConfig).map(([key, { label, icon: Icon }]) => (
          <Button
            key={key}
            variant={activeCategory === key ? "secondary" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(key)}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
            <p className="text-gray-500 text-sm mb-4">Be the first to share something with your campus!</p>
            <Link href="/feed/create">
              <Button>
                <Plus className="h-4 w-4" />
                Create First Post
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => {
          const cat = categoryConfig[post.category] || categoryConfig.GENERAL;
          return (
            <Card key={post.id} className={post.pinned ? "border-blue-200 dark:border-blue-800" : ""}>
              <CardContent className="p-5">
                {post.pinned && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-1">
                    📌 Pinned
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                    {getInitials(post.author.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.author.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {post.author.branch || "Student"} · {timeAgo(post.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={cat.color as "default" | "secondary" | "destructive" | "success" | "warning"}
                    className="ml-auto"
                  >
                    {cat.label}
                  </Badge>
                </div>

                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">{post.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      post.isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                    {post.likesCount}
                  </button>
                  <button
                    onClick={() => loadComments(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      expandedComments === post.id ? "text-blue-500" : "text-gray-500 hover:text-blue-500"
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {post.commentsCount}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-500 transition-colors ml-auto">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments === post.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitComment(post.id)}
                        className="flex-1 h-9 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      />
                      <Button
                        size="sm"
                        onClick={() => submitComment(post.id)}
                        disabled={submittingComment || !commentText.trim()}
                      >
                        {submittingComment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    {(comments[post.id] || []).length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">No comments yet</p>
                    )}
                    {(comments[post.id] || []).map((c) => (
                      <div key={c.id} className="flex gap-2">
                        <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700 text-xs flex items-center justify-center font-semibold shrink-0">
                          {getInitials(c.author.name)}
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">{c.author.name}</span>
                            <span className="text-[10px] text-gray-400">{timeAgo(c.createdAt)}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
