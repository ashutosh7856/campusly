import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const comments = await db.comment.findMany({
      where: { postId, parentId: null },
      include: {
        author: { select: { id: true, name: true, avatar: true, branch: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, avatar: true, branch: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;
    const body = await req.json();
    const data = commentSchema.parse(body);

    const comment = await db.comment.create({
      data: {
        content: data.content,
        authorId: session.user.id,
        postId,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, branch: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
