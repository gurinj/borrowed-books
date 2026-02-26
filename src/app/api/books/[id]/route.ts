import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/books/:id
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await db.book.findUnique({ where: { id } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(book);
}

// PUT /api/books/:id — update a book (admin only)
export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = BookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", issues: parsed.error.errors }, { status: 400 });
  }

  const existing = await db.book.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { totalCopies, isbn, cover, description, category, ...rest } = parsed.data;

  // Adjust availableCopies proportionally when totalCopies changes
  const loanedCopies = existing.totalCopies - existing.availableCopies;
  const newAvailable = Math.max(0, totalCopies - loanedCopies);

  const book = await db.book.update({
    where: { id },
    data: {
      ...rest,
      isbn: isbn || null,
      cover: cover || null,
      description: description || null,
      category: category || null,
      totalCopies,
      availableCopies: newAvailable,
    },
  });

  return NextResponse.json(book);
}

// DELETE /api/books/:id — delete a book (admin only)
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // Prevent deletion if there are active loans
  const activeLoans = await db.loan.count({
    where: { bookId: id, returnedAt: null },
  });
  if (activeLoans > 0) {
    return NextResponse.json(
      { error: "Cannot delete a book with active loans" },
      { status: 409 }
    );
  }

  await db.book.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
