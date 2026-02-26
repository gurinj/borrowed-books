import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LoanSchema } from "@/lib/validations";
import { getDueDateFromBorrowDate } from "@/lib/utils";

// GET /api/loans — admin: all loans, employee: own loans
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const loans = await db.loan.findMany({
    where:
      session.user.role === "admin" ? {} : { userId: session.user.id },
    include: { book: true },
    orderBy: { borrowedAt: "desc" },
  });

  return NextResponse.json(loans);
}

// POST /api/loans — borrow a book
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = LoanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { bookId } = parsed.data;

  // Use a transaction to safely decrement available copies
  try {
    const loan = await db.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book) throw new Error("Book not found");
      if (book.availableCopies < 1) throw new Error("No copies available");

      // Prevent double-borrowing
      const existing = await tx.loan.findFirst({
        where: { bookId, userId: session.user.id, returnedAt: null },
      });
      if (existing) throw new Error("You already have this book borrowed");

      await tx.book.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } },
      });

      return tx.loan.create({
        data: {
          bookId,
          userId: session.user.id,
          userName: session.user.name ?? "Unknown",
          userEmail: session.user.email ?? "",
          dueDate: getDueDateFromBorrowDate(),
        },
      });
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to borrow book";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
