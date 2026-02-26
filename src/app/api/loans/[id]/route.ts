import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// PUT /api/loans/:id — return a book
export async function PUT(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const loan = await db.loan.findUnique({ where: { id }, include: { book: true } });
  if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  if (loan.returnedAt) return NextResponse.json({ error: "Already returned" }, { status: 409 });

  // Employees can only return their own loans; admins can return any
  if (session.user.role !== "admin" && loan.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.$transaction([
    db.loan.update({
      where: { id },
      data: { returnedAt: new Date() },
    }),
    db.book.update({
      where: { id: loan.bookId },
      data: { availableCopies: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ success: true });
}
