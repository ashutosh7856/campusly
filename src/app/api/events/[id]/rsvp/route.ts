import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Check existing RSVP
    const existing = await db.rSVP.findUnique({
      where: { userId_eventId: { userId: session.user.id, eventId } },
    });

    if (existing) {
      // Toggle: if GOING → remove, if cancelled → set GOING
      if (existing.status === "GOING") {
        await db.rSVP.delete({ where: { id: existing.id } });
        return NextResponse.json({ rsvped: false });
      } else {
        await db.rSVP.update({
          where: { id: existing.id },
          data: { status: "GOING" },
        });
        return NextResponse.json({ rsvped: true });
      }
    } else {
      await db.rSVP.create({
        data: { userId: session.user.id, eventId, status: "GOING" },
      });
      return NextResponse.json({ rsvped: true });
    }
  } catch (error) {
    console.error("Error toggling RSVP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
