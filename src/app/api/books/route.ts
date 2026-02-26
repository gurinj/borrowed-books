import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookSchema } from "@/lib/validations";

// GET /api/books — list all books
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const available = searchParams.get("available");

  const books = await db.book.findMany({
    where: {
      AND: [
        q ? { OR: [
          { title: { contains: q, mode: "insensitive" } },
          { author: { contains: q, mode: "insensitive" } },
        ]} : {},
        category ? { category } : {},
        available === "true" ? { availableCopies: { gt: 0 } } : {},
      ],
    },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(books);
}

// POST /api/books — create a book (admin only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = BookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", issues: parsed.error.errors }, { status: 400 });
  }

  const { totalCopies, isbn, cover, description, category, ...rest } = parsed.data;

  const book = await db.book.create({
    data: {
      ...rest,
      isbn: isbn || null,
      cover: cover || null,
      description: description || null,
      category: category || null,
      totalCopies,
      availableCopies: totalCopies,
    },
  });

  return NextResponse.json(book, { status: 201 });
}
