import { db } from "@/lib/db";
import { BookOpen, BookMarked, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isOverdue } from "@/lib/utils";

async function getStats() {
  const [totalBooks, totalLoans, activeLoans, allActiveLoans] =
    await Promise.all([
      db.book.count(),
      db.loan.count(),
      db.loan.count({ where: { returnedAt: null } }),
      db.loan.findMany({
        where: { returnedAt: null },
        select: { dueDate: true, userName: true },
      }),
    ]);

  const overdueLoans = allActiveLoans.filter((l) => isOverdue(l.dueDate)).length;

  return { totalBooks, totalLoans, activeLoans, overdueLoans };
}

async function getRecentLoans() {
  return db.loan.findMany({
    take: 8,
    orderBy: { borrowedAt: "desc" },
    include: { book: { select: { title: true, author: true } } },
  });
}

export default async function DashboardPage() {
  const [stats, recentLoans] = await Promise.all([getStats(), getRecentLoans()]);

  const statCards = [
    {
      label: "Total Books",
      value: stats.totalBooks,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Loans",
      value: stats.activeLoans,
      icon: BookMarked,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Overdue",
      value: stats.overdueLoans,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Total Loans",
      value: stats.totalLoans,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Library overview at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent loans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Loans</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentLoans.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {loan.book.title}
                  </p>
                  <p className="text-xs text-slate-500">{loan.userName}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  {loan.returnedAt ? (
                    <span className="text-xs text-emerald-600 font-medium">
                      Returned
                    </span>
                  ) : isOverdue(loan.dueDate) ? (
                    <span className="text-xs text-red-600 font-medium">
                      Overdue
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Active</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
