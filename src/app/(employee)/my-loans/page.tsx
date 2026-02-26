import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReturnButton } from "@/components/loans/ReturnButton";
import { formatDate, isOverdue } from "@/lib/utils";

export default async function MyLoansPage() {
  const session = await auth();

  const loans = await db.loan.findMany({
    where: { userId: session!.user.id },
    include: { book: true },
    orderBy: { borrowedAt: "desc" },
  });

  const activeLoans = loans.filter((l) => !l.returnedAt);
  const pastLoans = loans.filter((l) => l.returnedAt);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Loans</h1>
        <p className="text-slate-500 mt-1">
          Books you are currently borrowing and your history
        </p>
      </div>

      {/* Active loans */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-700">
          Currently Borrowed ({activeLoans.length})
        </h2>

        {activeLoans.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>You have no active loans.</p>
            <Link
              href="/"
              className="text-sm text-primary hover:underline mt-1 block"
            >
              Browse the catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeLoans.map((loan) => {
              const overdue = isOverdue(loan.dueDate);
              return (
                <div
                  key={loan.id}
                  className="flex items-start gap-4 bg-white rounded-xl border p-4 shadow-sm"
                >
                  {/* Cover */}
                  <div className="relative w-14 h-20 shrink-0 rounded overflow-hidden bg-slate-100">
                    {loan.book.cover ? (
                      <Image
                        src={loan.book.cover}
                        alt={loan.book.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/books/${loan.book.id}`}>
                      <h3 className="font-semibold text-slate-900 hover:text-primary transition-colors line-clamp-1">
                        {loan.book.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-500">{loan.book.author}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="w-3 h-3" />
                        Borrowed {formatDate(loan.borrowedAt)}
                      </span>
                      <Badge variant={overdue ? "destructive" : "warning"}>
                        {overdue ? "Overdue" : `Due ${formatDate(loan.dueDate)}`}
                      </Badge>
                    </div>
                  </div>

                  <ReturnButton loanId={loan.id} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Past loans */}
      {pastLoans.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-700">
            History ({pastLoans.length})
          </h2>
          <div className="space-y-2">
            {pastLoans.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center gap-4 bg-white rounded-xl border p-4 opacity-70"
              >
                <div className="flex-1 min-w-0">
                  <Link href={`/books/${loan.book.id}`}>
                    <span className="text-sm font-medium text-slate-700 hover:text-primary transition-colors line-clamp-1">
                      {loan.book.title}
                    </span>
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {loan.book.author}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="secondary">Returned</Badge>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(loan.returnedAt!)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
