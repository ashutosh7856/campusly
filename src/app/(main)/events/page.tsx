"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Plus, Clock, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  organizer: { id: string; name: string };
  rsvpCount: number;
  isRsvped: boolean;
}

function formatEventTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) > new Date();
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("upcoming");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events?filter=${filter}`);
      if (res.ok) setEvents(await res.json());
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function toggleRsvp(eventId: string) {
    const res = await fetch(`/api/events/${eventId}/rsvp`, { method: "POST" });
    if (res.ok) {
      const { rsvped } = await res.json();
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, isRsvped: rsvped, rsvpCount: rsvped ? e.rsvpCount + 1 : e.rsvpCount - 1 }
            : e
        )
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Discover and RSVP to events happening on campus
          </p>
        </div>
        <Link href="/events/create">
          <Button>
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { value: "upcoming", label: "Upcoming" },
          { value: "past", label: "Past" },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
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
      {!loading && events.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No events yet</h3>
            <p className="text-gray-500 text-sm mb-4">Create the first event for your campus!</p>
            <Link href="/events/create">
              <Button>
                <Plus className="h-4 w-4" />
                Create First Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Event Cards */}
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {/* Date Sidebar */}
                <div className="sm:w-24 bg-blue-600 text-white flex flex-row sm:flex-col items-center justify-center p-4 gap-2 sm:gap-0">
                  <span className="text-sm font-medium opacity-80">
                    {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                  </span>
                  <span className="text-3xl font-bold">
                    {new Date(event.startDate).getDate()}
                  </span>
                  <span className="text-sm font-medium opacity-80">
                    {new Date(event.startDate).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {event.title}
                    </h3>
                    {isUpcoming(event.startDate) ? (
                      <Badge variant="success">Upcoming</Badge>
                    ) : (
                      <Badge variant="secondary">Past</Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatEventTime(event.startDate)}
                      {event.endDate && ` - ${formatEventTime(event.endDate)}`}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {event.rsvpCount} going
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Organized by {event.organizer.name}
                    </span>
                    <Button
                      size="sm"
                      variant={event.isRsvped ? "secondary" : "default"}
                      onClick={() => toggleRsvp(event.id)}
                    >
                      {event.isRsvped ? "Going ✓" : "RSVP"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
