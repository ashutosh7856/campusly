import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  price: z.coerce.number().min(0),
  originalPrice: z.coerce.number().min(0).optional(),
  category: z.string().min(1),
  condition: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const user = await db.user.findUnique({ where: { id: session.user.id } });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { sold: false };
    if (user) where.collegeId = user.collegeId;
    if (category && category !== "All") where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const listings = await db.listing.findMany({
      where,
      include: {
        seller: { select: { id: true, name: true, branch: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
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
    const data = createListingSchema.parse(body);

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const listing = await db.listing.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice || null,
        category: data.category,
        condition: data.condition || "GOOD",
        sellerId: user.id,
        collegeId: user.collegeId,
      },
      include: {
        seller: { select: { id: true, name: true, branch: true, avatar: true } },
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
