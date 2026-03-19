import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createPostSchema } from "@/lib/validations/post";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Get user's college to scope posts
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (user) where.collegeId = user.collegeId;
    if (category && category !== "ALL") where.category = category;

    const posts = await db.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, branch: true, avatar: true } },
        likes: { select: { userId: true } },
        comments: { select: { id: true } },
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });

    const postsWithMeta = posts.map((post) => ({
      ...post,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLiked: post.likes.some((l) => l.userId === session.user!.id),
    }));

    return NextResponse.json(postsWithMeta);
  } catch (error) {
    console.error("Error fetching posts:", error);
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
    const data = createPostSchema.parse(body);

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await db.post.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        image: data.image || null,
        authorId: user.id,
        collegeId: user.collegeId,
      },
      include: {
        author: { select: { id: true, name: true, branch: true, avatar: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
