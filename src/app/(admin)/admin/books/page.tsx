import Link from "next/link";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteBookButton } from "@/components/books/DeleteBookButton";
import { formatDate } from "@/lib/utils";

export default async function AdminBooksPage() {
  const books = await db.book.findMany({
    include: {
      _count: { select: { loans: { where: { returnedAt: null } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Books</h1>
          <p className="text-slate-500 mt-1">{books.length} books in the library</p>
        </div>
        <Button asChild>
          <Link href="/admin/books/new">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Book
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title / Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-slate-400"
                >
                  No books yet.{" "}
                  <Link
                    href="/admin/books/new"
                    className="text-primary hover:underline"
                  >
                    Add the first one
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{book.title}</p>
                      <p className="text-sm text-slate-500">{book.author}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {book.category ? (
                      <Badge variant="secondary">{book.category}</Badge>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {book.isbn ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        book.availableCopies > 0 ? "success" : "destructive"
                      }
                    >
                      {book.availableCopies}/{book.totalCopies}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {formatDate(book.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/books/${book.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteBookButton
                        bookId={book.id}
                        activeLoans={book._count.loans}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
