"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, IndianRupee, Search, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

const categoryList = ["All", "Books", "Electronics", "Hostel Stuff", "Stationery", "Clothing", "Other"];

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  category: string;
  condition: string;
  image: string | null;
  createdAt: string;
  seller: { id: string; name: string; branch: string | null; avatar: string | null };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "All") params.set("category", activeCategory);
      if (search) params.set("search", search);
      const res = await fetch(`/api/marketplace?${params}`);
      if (res.ok) setListings(await res.json());
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchListings(), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchListings, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Buy & sell within your campus community
          </p>
        </div>
        <Link href="/marketplace/sell">
          <Button>
            <Plus className="h-4 w-4" />
            Sell Something
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categoryList.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "secondary" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && listings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No listings yet</h3>
            <p className="text-gray-500 text-sm mb-4">Be the first to sell something on campus!</p>
            <Link href="/marketplace/sell">
              <Button>
                <Plus className="h-4 w-4" />
                List First Item
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Listings Grid */}
      {!loading && listings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {listings.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                {/* Image placeholder */}
                <div className="h-40 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <span className="text-4xl">📦</span>
                </div>

                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                    {item.title}
                  </h3>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center text-lg font-bold text-green-600 dark:text-green-400">
                    <IndianRupee className="h-4 w-4" />
                    {item.price}
                  </span>
                  {item.originalPrice && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{item.originalPrice}
                      </span>
                      <Badge variant="success" className="text-[10px]">
                        {Math.round((1 - item.price / item.originalPrice) * 100)}% off
                      </Badge>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {item.seller.name}
                    </p>
                    <p>{item.seller.branch || "Student"} · {timeAgo(item.createdAt)}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-3.5 w-3.5" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
