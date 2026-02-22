import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "upcoming" | "past" | null

    const user = await db.user.findUnique({ where: { id: session.user.id } });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (user) where.collegeId = user.collegeId;

    if (filter === "upcoming") {
      where.startDate = { gte: new Date() };
    } else if (filter === "past") {
      where.startDate = { lt: new Date() };
    }

    const events = await db.event.findMany({
      where,
      include: {
        organizer: { select: { id: true, name: true } },
        rsvps: { select: { userId: true, status: true } },
      },
      orderBy: { startDate: "asc" },
    });

    const eventsWithMeta = events.map((event) => ({
      ...event,
      rsvpCount: event.rsvps.filter((r) => r.status === "GOING").length,
      isRsvped: event.rsvps.some(
        (r) => r.userId === session.user!.id && r.status === "GOING"
      ),
    }));

    return NextResponse.json(eventsWithMeta);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createEventSchema.parse(body);

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const event = await db.event.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        organizerId: user.id,
        collegeId: user.collegeId,
      },
      include: {
        organizer: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
