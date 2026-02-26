import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BookForm } from "@/components/books/BookForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const book = await db.book.findUnique({ where: { id } });
  if (!book) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/books"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to books
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Book</h1>
        <p className="text-slate-500 mt-1">{book.title}</p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <BookForm initialData={book} />
      </div>
    </div>
  );
}
