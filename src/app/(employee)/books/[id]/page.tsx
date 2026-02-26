import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Hash, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BorrowButton } from "@/components/books/BorrowButton";
import { formatDate } from "@/lib/utils";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const book = await db.book.findUnique({
    where: { id },
    include: {
      loans: {
        where: { returnedAt: null },
        select: { userId: true },
      },
    },
  });

  if (!book) notFound();

  const userActiveLoan = book.loans.find(
    (l) => l.userId === session?.user?.id
  );
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to catalog
      </Link>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-6 p-6">
          {/* Cover */}
          <div className="relative w-full sm:w-40 h-56 sm:h-auto shrink-0 rounded-lg overflow-hidden bg-slate-100">
            {book.cover ? (
              <Image
                src={book.cover}
                alt={book.title}
                fill
                className="object-cover"
                sizes="160px"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-slate-300" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            {book.category && (
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                {book.category}
              </p>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{book.title}</h1>
              <p className="text-lg text-slate-500 mt-1">{book.author}</p>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              {book.isbn && (
                <span className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" />
                  ISBN {book.isbn}
                </span>
              )}
              {book.category && (
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {book.category}
                </span>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3">
              <Badge variant={isAvailable ? "success" : "destructive"}>
                {isAvailable ? "Available" : "All copies borrowed"}
              </Badge>
              <span className="text-sm text-slate-500">
                {book.availableCopies} of {book.totalCopies}{" "}
                {book.totalCopies === 1 ? "copy" : "copies"} available
              </span>
            </div>

            {/* Borrow action */}
            {userActiveLoan ? (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-700">
                  You have borrowed this book. Return it from{" "}
                  <Link
                    href="/my-loans"
                    className="font-medium underline underline-offset-2"
                  >
                    My Loans
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <BorrowButton bookId={book.id} isAvailable={isAvailable} />
            )}
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <div className="border-t px-6 py-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Description
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
