import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, isOverdue } from "@/lib/utils";

interface SearchParams {
  filter?: "active" | "overdue" | "returned";
}

export default async function AdminLoansPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { filter } = await searchParams;

  const loans = await db.loan.findMany({
    where:
      filter === "active"
        ? { returnedAt: null }
        : filter === "returned"
        ? { returnedAt: { not: null } }
        : {},
    include: {
      book: { select: { id: true, title: true, author: true } },
    },
    orderBy: { borrowedAt: "desc" },
  });

  const displayLoans =
    filter === "overdue"
      ? loans.filter((l) => !l.returnedAt && isOverdue(l.dueDate))
      : loans;

  const tabs = [
    { label: "All", value: undefined },
    { label: "Active", value: "active" },
    { label: "Overdue", value: "overdue" },
    { label: "Returned", value: "returned" },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Loans</h1>
        <p className="text-slate-500 mt-1">All borrowing activity</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <a
            key={String(tab.value)}
            href={tab.value ? `?filter=${tab.value}` : "/admin/loans"}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === tab.value || (!filter && !tab.value)
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Book</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Borrowed</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayLoans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-slate-400"
                >
                  No loans found
                </TableCell>
              </TableRow>
            ) : (
              displayLoans.map((loan) => {
                const overdue = !loan.returnedAt && isOverdue(loan.dueDate);
                return (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">
                          {loan.book.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {loan.book.author}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {loan.userName}
                        </p>
                        <p className="text-xs text-slate-500">{loan.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(loan.borrowedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(loan.dueDate)}
                    </TableCell>
                    <TableCell>
                      {loan.returnedAt ? (
                        <Badge variant="success">Returned</Badge>
                      ) : overdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge variant="warning">Active</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
