import { db } from "@/lib/db";
import { BookCard } from "@/components/books/BookCard";
import { Search } from "lucide-react";

interface SearchParams {
  q?: string;
  category?: string;
  available?: string;
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { q, category, available } = params;

  const books = await db.book.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { author: { contains: q, mode: "insensitive" } },
                { isbn: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        category ? { category: { equals: category, mode: "insensitive" } } : {},
        available === "true" ? { availableCopies: { gt: 0 } } : {},
      ],
    },
    orderBy: { title: "asc" },
  });

  const categories = await db.book.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Book Catalog</h1>
        <p className="text-slate-500 mt-1">
          Browse and borrow books from the company library
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by title, author or ISBN..."
            className="w-full pl-9 pr-4 h-10 rounded-md border border-input bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          name="category"
          defaultValue={category}
          className="h-10 rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category ?? ""}>
              {c.category}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-white text-sm cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            name="available"
            value="true"
            defaultChecked={available === "true"}
            className="rounded"
          />
          Available only
        </label>
        <button
          type="submit"
          className="h-10 px-4 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        {books.length} {books.length === 1 ? "book" : "books"} found
      </p>

      {/* Book grid */}
      {books.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg font-medium">No books found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
