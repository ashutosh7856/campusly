import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { uploadResourceSchema } from "@/lib/validations/resource";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const user = await db.user.findUnique({ where: { id: session.user.id } });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (user) where.collegeId = user.collegeId;
    if (type && type !== "ALL") where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { subject: { contains: search } },
        { branch: { contains: search } },
      ];
    }

    const resources = await db.resource.findMany({
      where,
      include: {
        uploader: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
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
    const data = uploadResourceSchema.parse(body);

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resource = await db.resource.create({
      data: {
        title: data.title,
        description: data.description || null,
        type: data.type,
        subject: data.subject,
        semester: data.semester,
        branch: data.branch,
        fileUrl: `/uploads/${Date.now()}-${data.title.replace(/\s+/g, "-").toLowerCase()}.pdf`,
        fileName: `${data.title}.pdf`,
        fileSize: 0,
        uploaderId: user.id,
        collegeId: user.collegeId,
      },
      include: {
        uploader: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
